"""Backend coverage for SwitchYard Rewards (routes under /rewards).

Runs against the live uvicorn process like the other tests. The staff flow needs the server to
have REWARDS_ADMIN_EMAIL / REWARDS_ADMIN_PASSWORD set, and this process to see the same two
variables; without them those tests are skipped.
"""

import base64
import os
import uuid

import httpx
import pytest

API_URL = f"{os.environ.get('BACKEND_URL', 'http://localhost:8001')}/api"
ADMIN_EMAIL = os.environ.get("REWARDS_ADMIN_EMAIL", "").split(",")[0].strip()
ADMIN_PASSWORD = os.environ.get("REWARDS_ADMIN_PASSWORD", "")
needs_admin = pytest.mark.skipif(not (ADMIN_EMAIL and ADMIN_PASSWORD), reason="REWARDS_ADMIN_EMAIL/PASSWORD not set")

PDF = base64.b64encode(b"%PDF-1.4\n% test voucher\n").decode()


def _client() -> httpx.Client:
    return httpx.Client(base_url=API_URL, timeout=30.0)


def _register(client: httpx.Client, password: str = "secret-pass-1") -> str:
    email = f"member+{uuid.uuid4().hex[:10]}@example.com.au"
    response = client.post("/rewards/register", json={"name": "Test Member", "company": "Test Co Pty Ltd", "email": email, "password": password})
    assert response.status_code == 201, response.text
    assert "pending SwitchYard approval" in response.json()["message"]
    return email


def _admin(client: httpx.Client) -> None:
    response = client.post("/rewards/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert response.status_code == 200, response.text
    assert response.json()["role"] == "admin"


def _approve_member(email: str) -> None:
    with _client() as staff:
        _admin(staff)
        overview = staff.get("/rewards/admin/overview").json()
        member = next(m for m in overview["members"] if m["email"] == email)
        assert member["status"] == "pending"
        assert staff.post(f"/rewards/admin/members/{member['id']}/status", json={"status": "approved"}).status_code == 200
        # A registration is reviewed once.
        assert staff.post(f"/rewards/admin/members/{member['id']}/status", json={"status": "rejected"}).status_code == 409


def test_catalog_lists_rewards(client):
    response = client.get("/rewards/catalog")
    assert response.status_code == 200
    items = response.json()
    assert len(items) == 6
    assert {"id", "title", "description", "points", "category"} <= set(items[0])


def test_guest_session_and_protected_routes(client):
    assert client.get("/rewards/session").json() == {"role": "guest", "member": None, "admin_email": None}
    assert client.post("/rewards/vouchers", json={"file_name": "a.pdf", "content_type": "application/pdf", "data_base64": PDF, "claimed_points": 10}).status_code == 401
    assert client.post("/rewards/redemptions", json={"reward_id": "charity-25"}).status_code == 401
    assert client.get("/rewards/admin/overview").status_code == 401


def test_registration_validation_and_pending_sign_in():
    with _client() as client:
        short = client.post("/rewards/register", json={"name": "A", "company": "B", "email": "short@example.com.au", "password": "short"})
        assert short.status_code == 422

        email = _register(client)
        duplicate = client.post("/rewards/register", json={"name": "Again", "company": "Co", "email": email.upper(), "password": "secret-pass-1"})
        assert duplicate.status_code == 409

        pending = client.post("/rewards/login", json={"email": email, "password": "secret-pass-1"})
        assert pending.status_code == 403
        assert "pending" in pending.json()["detail"]
        assert client.post("/rewards/login", json={"email": email, "password": "wrong-pass-1"}).status_code == 401
        assert client.post("/rewards/login", json={"email": "nobody@example.com.au", "password": "secret-pass-1"}).status_code == 401


def test_staff_sign_in_rejects_bad_credentials(client):
    response = client.post("/rewards/admin/login", json={"email": "someone@example.com.au", "password": "not-the-password"})
    assert response.status_code in (401, 503)


@needs_admin
def test_member_journey_with_staff_validation():
    with _client() as member:
        email = _register(member)
        _approve_member(email)

        signed_in = member.post("/rewards/login", json={"email": email, "password": "secret-pass-1"})
        assert signed_in.status_code == 200, signed_in.text
        assert "httponly" in signed_in.headers["set-cookie"].lower()
        assert "samesite=strict" in signed_in.headers["set-cookie"].lower()
        session = member.get("/rewards/session").json()
        assert session["role"] == "member"
        start = session["member"]["points"]["accrued"]

        # Uploads must be a real file of an accepted type.
        bad_type = member.post("/rewards/vouchers", json={"file_name": "a.txt", "content_type": "text/plain", "data_base64": PDF, "claimed_points": 10})
        assert bad_type.status_code == 422
        mismatch = member.post("/rewards/vouchers", json={"file_name": "a.pdf", "content_type": "application/pdf", "data_base64": base64.b64encode(b"not a pdf").decode(), "claimed_points": 10})
        assert mismatch.status_code == 422
        uploaded = member.post("/rewards/vouchers", json={"file_name": "activity-oct.pdf", "content_type": "application/pdf", "data_base64": PDF, "claimed_points": 6000, "note": "October"})
        assert uploaded.status_code == 201, uploaded.text

        detail = member.get("/rewards/session").json()["member"]
        assert detail["points"]["accrued"] == start
        assert detail["points"]["pending_vouchers"] == 1
        voucher_id = detail["vouchers"][0]["id"]

        # Staff can open the file and credit the points.
        with _client() as staff:
            _admin(staff)
            pending = staff.get("/rewards/admin/overview").json()["pending_vouchers"]
            assert any(item["voucher"]["id"] == voucher_id for item in pending)
            file = staff.get(f"/rewards/admin/vouchers/{voucher_id}/file")
            assert file.status_code == 200
            assert file.content.startswith(b"%PDF")
            assert file.headers["content-disposition"].startswith("attachment")
            assert file.headers["x-content-type-options"] == "nosniff"
            assert staff.post(f"/rewards/admin/vouchers/{voucher_id}/status", json={"status": "approved"}).status_code == 200
            assert staff.post(f"/rewards/admin/vouchers/{voucher_id}/status", json={"status": "approved"}).status_code == 409
        # Members cannot reach staff routes.
        assert member.get(f"/rewards/admin/vouchers/{voucher_id}/file").status_code == 401

        points = member.get("/rewards/session").json()["member"]["points"]
        assert points["accrued"] == start + 6000
        assert points["vested"] == start + 6000

        # Spending holds the points while pending; overspending is refused.
        assert member.post("/rewards/redemptions", json={"reward_id": "treasury-review", "note": "Q4"}).status_code == 201
        points = member.get("/rewards/session").json()["member"]["points"]
        assert points["vested"] == start
        assert points["redeemed"] == 6000
        if start < 1000:
            assert member.post("/rewards/redemptions", json={"reward_id": "charity-25"}).status_code == 400
        assert member.post("/rewards/redemptions", json={"reward_id": "no-such-reward"}).status_code == 404

        # A rejected request releases its points.
        redemption_id = member.get("/rewards/session").json()["member"]["redemptions"][0]["id"]
        with _client() as staff:
            _admin(staff)
            assert staff.post(f"/rewards/admin/redemptions/{redemption_id}/status", json={"status": "rejected"}).status_code == 200
        assert member.get("/rewards/session").json()["member"]["points"]["vested"] == start + 6000

        assert member.post("/rewards/logout").status_code == 200
        assert member.get("/rewards/session").json()["role"] == "guest"

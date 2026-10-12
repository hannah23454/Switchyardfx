# SwitchYard FX Frontend

Standalone React 19 + Vite + TypeScript frontend for SwitchYard FX. The package is ready to copy into a dedicated frontend repository.

## Run locally

```bash
yarn
cp .env.example .env
yarn dev
```

## Data modes

The UI defaults to fully interactive mock mode. All mock behavior lives in `src/data/mockSwitchyard.ts`.

```env
VITE_DATA_MODE=mock
```

To connect the backend, serve or proxy it under the same-origin `/api` prefix and switch to:

```env
VITE_DATA_MODE=api
```

The only frontend integration boundary is `src/services/switchyard.ts`. It currently expects:

- `GET /api/market/overview` — server-proxied Twelve Data quotes and 15-minute AUD/USD candles, with an indicative fallback
- `GET /api/market/ticker` — the home-page FX ticker board: eight AUD pairs (default), cached server-side per
  `TWELVE_DATA_TICKER_TTL_SECONDS` (900s). Owns its own `TWELVE_DATA_API_KEY` request; honours the free-plan
  credit budget. Every response is self-describing: `source` (`live`|`fallback`), `delayed` (a live snapshot
  older than the fresh window, or any fallback), `refresh_seconds`, and a `warning` when not live — the
  FxTicker renders LIVE / DELAYED / INDICATIVE badges from exactly these fields. Mocks it in
  `src/data/mockSwitchyard.ts` (`MOCK_MARKET_TICKER`).
- `GET /api/fx/rates?base=AUD&quotes=USD,EUR,GBP`
- `POST /api/submissions`

The corresponding hand-written TypeScript request/response contracts are in `src/lib/types.ts`. Change the service and those types together if the backend contract differs.

## Frontend structure

- `src/pages/` — route-level screens
- `src/components/` — shared shell, forms, and UI components
- `src/services/switchyard.ts` — backend adapter
- `src/data/mockSwitchyard.ts` — isolated demo data and simulated mutations
- `src/lib/types.ts` — API contracts
- `src/lib/api.ts` — typed HTTP transport over `/api`

No backend secrets, database code, or server runtime is required in this folder.

The Twelve Data key must remain in the backend environment as `TWELVE_DATA_API_KEY`. Never add it to a `VITE_*` variable or browser code.
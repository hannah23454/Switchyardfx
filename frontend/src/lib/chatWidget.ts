import { BRAND_MARK_PATH } from "@/components/BrandMark";

// The SwitchYard chat widget (switchyard-fx-chat.js, loaded in index.html) mounts a shadow root
// at #syfx-chat-root with a fixed .syfx-launcher button and .syfx-panel. Page CSS can't reach
// inside a shadow root, so this adds a small stylesheet to it once it appears:
// - the launcher sits in the same bottom-right column as the WhatsApp button (WhatsApp above it);
// - it rests as a round icon and expands to show its label on hover or keyboard focus;
// - while the chat panel is open the page is told (data-chat-open), so WhatsApp steps aside.
// The offsets come from CSS variables set on the host in index.css (variables cross into the
// shadow root), so the cookie banner can lift the whole column on small screens.

const STYLE_ID = "syfx-site-overrides";

const css = `
  .syfx-launcher {
    position: fixed !important;
    right: var(--syfx-right, 16px) !important;
    bottom: var(--syfx-bottom, 16px) !important;
    left: auto !important;
    top: auto !important;
    box-sizing: border-box !important;
    height: 56px !important;
    min-height: 56px !important;
    width: auto !important;
    max-width: 56px !important;
    padding: 0 16px !important;
    border-radius: 999px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: flex-start !important;
    gap: 20px !important; /* label starts beyond the 56px circle even if it is a bare text node */
    overflow: hidden !important;
    white-space: nowrap !important;
    box-shadow: 0 12px 32px rgba(18, 38, 31, .24) !important;
    transition: max-width .35s cubic-bezier(.22, 1, .36, 1), bottom .3s ease, box-shadow .3s ease !important;
  }
  .syfx-launcher > * { flex-shrink: 0 !important; }
  /* At rest only the icon shows; the label fades in as the pill widens. */
  .syfx-launcher > :not(:first-child) { opacity: 0 !important; transition: opacity .2s ease !important; }
  .syfx-launcher:hover,
  .syfx-launcher:focus-visible {
    max-width: 280px !important;
    box-shadow: 0 16px 40px rgba(18, 38, 31, .3) !important;
  }
  .syfx-launcher:hover > :not(:first-child),
  .syfx-launcher:focus-visible > :not(:first-child) { opacity: 1 !important; transition-delay: .08s !important; }

  /* Give the hosted conversation window the same calm, rounded surfaces as the site. */
  .syfx-panel {
    box-sizing: border-box !important;
    width: min(380px, calc(100vw - 32px)) !important;
    max-height: min(620px, calc(100dvh - 112px)) !important;
    border: 1px solid #dce5e1 !important;
    border-radius: 24px !important;
    overflow: hidden !important;
    background: #f5f7f6 !important;
    color: #12261f !important;
    box-shadow: 0 24px 64px rgba(18, 38, 31, .24) !important;
    font-family: "Gill Sans", "Trebuchet MS", Inter, ui-sans-serif, system-ui, sans-serif !important;
  }
  .syfx-panel header,
  .syfx-panel [class*="header"] {
    background-color: #12261f !important;
    color: #fff !important;
  }
  .syfx-panel header {
    min-height: 82px !important;
    padding: 14px 18px !important;
    gap: 12px !important;
    border-bottom: 1px solid rgba(255, 255, 255, .08) !important;
  }
  .syfx-panel header h1,
  .syfx-panel header h2,
  .syfx-panel header h3,
  .syfx-panel header [class*="title"] {
    color: #fff !important;
    font-family: "Gill Sans", "Trebuchet MS", sans-serif !important;
    font-size: 21px !important;
    font-weight: 600 !important;
    letter-spacing: -.025em !important;
  }
  .syfx-panel header [class*="subtitle"],
  .syfx-panel header [class*="description"] {
    color: #a8c5ba !important;
    font-family: "Gill Sans", "Trebuchet MS", sans-serif !important;
    font-size: 12px !important;
    letter-spacing: .09em !important;
  }
  .syfx-panel header button {
    box-sizing: border-box !important;
    display: grid !important;
    width: 40px !important;
    height: 40px !important;
    flex: 0 0 40px !important;
    place-items: center !important;
    padding: 0 !important;
    border: 1px solid rgba(255, 255, 255, .18) !important;
    border-radius: 999px !important;
    background: transparent !important;
    color: #dce5e1 !important;
    transition: background-color .18s ease, color .18s ease !important;
  }
  .syfx-panel header button:hover {
    background: rgba(255, 255, 255, .1) !important;
    color: #fff !important;
  }
  .syfx-panel h1,
  .syfx-panel h2,
  .syfx-panel h3 {
    color: #12261f !important;
    font-family: "Gill Sans", "Trebuchet MS", sans-serif !important;
    font-weight: 600 !important;
    letter-spacing: -.035em !important;
    line-height: 1.14 !important;
  }
  .syfx-panel [data-syfx-brand-lockup="true"] {
    box-sizing: border-box !important;
    display: grid !important;
    width: 48px !important;
    height: 48px !important;
    flex: 0 0 48px !important;
    place-items: center !important;
    overflow: hidden !important;
    border: 1px solid rgba(168, 197, 186, .2) !important;
    border-radius: 15px !important;
    background: rgba(168, 197, 186, .09) !important;
  }
  .syfx-panel [data-syfx-brand-lockup="true"] svg {
    width: 18px !important;
    height: 30px !important;
    color: #a8c5ba !important;
  }
  .syfx-panel input,
  .syfx-panel textarea {
    box-sizing: border-box !important;
    width: 100% !important;
    min-width: 0 !important;
    min-height: 48px !important;
    padding: 11px 14px !important;
    border: 1px solid #dce5e1 !important;
    border-radius: 15px !important;
    background: #fff !important;
    color: #12261f !important;
    font: inherit !important;
    line-height: 1.4 !important;
    box-shadow: 0 1px 2px rgba(18, 38, 31, .04) !important;
    transition: border-color .18s ease, box-shadow .18s ease !important;
  }
  .syfx-panel input:focus,
  .syfx-panel textarea:focus {
    outline: none !important;
    border-color: #2d6a4f !important;
    box-shadow: 0 0 0 3px rgba(45, 106, 79, .14) !important;
  }
  .syfx-panel input::placeholder,
  .syfx-panel textarea::placeholder { color: #81918b !important; opacity: 1 !important; }
  .syfx-panel textarea {
    height: 48px !important;
    max-height: 104px !important;
    resize: none !important;
    overflow-y: auto !important;
  }
  .syfx-panel button { font-family: inherit !important; }
  .syfx-panel button:not([type="submit"]):not(header button) {
    min-height: 42px !important;
    padding: 9px 14px !important;
    border: 1px solid #dce5e1 !important;
    border-radius: 14px !important;
    background: #fff !important;
    color: #244b3d !important;
    font-size: 14px !important;
    line-height: 1.35 !important;
    transition: background-color .18s ease, border-color .18s ease, transform .18s ease !important;
  }
  .syfx-panel button:not([type="submit"]):not(header button):hover {
    transform: translateY(-1px) !important;
    border-color: #b9cbc3 !important;
    background: #f5f7f6 !important;
  }
  .syfx-panel button[type="submit"],
  .syfx-panel button[class*="send"],
  .syfx-panel button[aria-label*="send" i] {
    min-width: 48px !important;
    min-height: 48px !important;
    border: 1px solid #2d6a4f !important;
    border-radius: 15px !important;
    background: #2d6a4f !important;
    color: #fff !important;
    box-shadow: 0 4px 12px rgba(45, 106, 79, .16) !important;
    transition: background-color .18s ease, transform .18s ease, box-shadow .18s ease !important;
  }
  .syfx-panel button[type="submit"]:hover,
  .syfx-panel button[class*="send"]:hover,
  .syfx-panel button[aria-label*="send" i]:hover {
    background: #244f3c !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 7px 16px rgba(45, 106, 79, .22) !important;
  }
  .syfx-panel * { scrollbar-color: #b9cbc3 transparent; scrollbar-width: thin; }
  .syfx-panel *::-webkit-scrollbar { width: 7px; height: 7px; }
  .syfx-panel *::-webkit-scrollbar-thumb { border: 2px solid transparent; border-radius: 99px; background: #b9cbc3; background-clip: padding-box; }
  @media (max-width: 640px) {
    .syfx-panel {
      right: 16px !important;
      bottom: calc(var(--syfx-bottom, 16px) + 68px) !important;
      width: calc(100vw - 32px) !important;
      max-height: min(620px, calc(100dvh - var(--syfx-bottom, 16px) - 100px)) !important;
      border-radius: 22px !important;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .syfx-launcher { transition: none !important; }
  }
`;

function createCompanyMark(): SVGSVGElement {
  const mark = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  mark.setAttribute("viewBox", "0 0 678 1111");
  mark.setAttribute("width", "18");
  mark.setAttribute("height", "30");
  mark.setAttribute("aria-hidden", "true");
  mark.setAttribute("focusable", "false");
  mark.style.cssText = "display:block;flex:none;color:#a8c5ba";
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", BRAND_MARK_PATH);
  path.setAttribute("fill", "currentColor");
  mark.append(path);
  return mark;
}

function applyCompanyMark(root: ShadowRoot): void {
  const launcher = root.querySelector<HTMLElement>(".syfx-launcher");
  const launcherIcon = launcher?.querySelector("svg, img");
  if (launcher && launcherIcon && launcher.dataset.syfxBrandMark !== "true") {
    launcherIcon.replaceWith(createCompanyMark());
    launcher.dataset.syfxBrandMark = "true";
  }

  const panel = root.querySelector<HTMLElement>(".syfx-panel");
  const header = panel?.querySelector<HTMLElement>("header, [class*='header']");
  const panelIcon = header && Array.from(header.querySelectorAll("svg, img")).find((node) => !node.closest("button") && !node.hasAttribute("data-syfx-company-mark"));
  if (header && panelIcon) {
    const mark = createCompanyMark();
    mark.setAttribute("data-syfx-company-mark", "true");
    panelIcon.replaceWith(mark);
    mark.parentElement?.setAttribute("data-syfx-brand-lockup", "true");
  }
}

function isVisible(element: Element | null): boolean {
  if (!element) return false;
  const style = getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) return false;
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function adapt(host: Element): boolean {
  const root = host.shadowRoot;
  // A closed shadow root can't be styled; the page CSS still keeps WhatsApp clear of it.
  if (!root) return false;
  if (!root.getElementById(STYLE_ID)) {
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = css;
    root.appendChild(style);
  }
  applyCompanyMark(root);
  const syncOpen = () => {
    applyCompanyMark(root);
    requestAnimationFrame(() => {
      document.body.toggleAttribute("data-chat-open", isVisible(root.querySelector(".syfx-panel")));
    });
  };
  const syncAfterTransition = (event: Event) => {
    const panel = root.querySelector(".syfx-panel");
    if (event.target === panel) syncOpen();
  };
  root.addEventListener("transitionend", syncAfterTransition, true);
  root.addEventListener("transitioncancel", syncAfterTransition, true);
  root.addEventListener("animationend", syncAfterTransition, true);
  syncOpen();
  new MutationObserver(syncOpen).observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ["class", "style", "hidden", "aria-hidden", "open"] });
  return true;
}

export function installChatWidgetAdapter() {
  const tryAdapt = () => {
    const host = document.getElementById("syfx-chat-root");
    if (!host) return false;
    document.body.setAttribute("data-chat-widget", host.shadowRoot ? "styled" : "present");
    return adapt(host) || true;
  };
  if (tryAdapt()) return;
  // The widget script loads asynchronously; watch for its host, then stop watching.
  const observer = new MutationObserver(() => { if (tryAdapt()) observer.disconnect(); });
  observer.observe(document.body, { childList: true, subtree: true });
  window.setTimeout(() => observer.disconnect(), 30_000);
}

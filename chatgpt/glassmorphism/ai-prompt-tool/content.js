const STYLE_ID = "chrome-ui-gallery-glassmorphism";
const STORAGE_KEY = "glassEnabled";

function applyGlass(enabled) {
  const existing = document.getElementById(STYLE_ID);

  if (!enabled) {
    existing?.remove();
    document.documentElement.removeAttribute("data-cug-glass");
    return;
  }

  if (existing) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    :root {
      --cug-glass-bg: rgba(18, 20, 31, 0.58);
      --cug-glass-bg-strong: rgba(24, 27, 40, 0.72);
      --cug-glass-border: rgba(255, 255, 255, 0.13);
      --cug-glass-highlight: rgba(255, 255, 255, 0.08);
      --cug-glass-shadow: 0 18px 55px rgba(0, 0, 0, 0.28);
      --cug-glass-blur: 22px;
    }

    html[data-cug-glass] body {
      background:
        radial-gradient(circle at 12% 8%, rgba(122, 92, 255, 0.20), transparent 30%),
        radial-gradient(circle at 88% 78%, rgba(39, 180, 255, 0.14), transparent 32%),
        #08090d !important;
    }

    html[data-cug-glass] main,
    html[data-cug-glass] nav,
    html[data-cug-glass] header,
    html[data-cug-glass] aside,
    html[data-cug-glass] [role="dialog"],
    html[data-cug-glass] [role="complementary"] {
      border-color: var(--cug-glass-border) !important;
    }

    html[data-cug-glass] header,
    html[data-cug-glass] aside,
    html[data-cug-glass] [role="dialog"] {
      background: var(--cug-glass-bg) !important;
      -webkit-backdrop-filter: blur(var(--cug-glass-blur)) saturate(145%) !important;
      backdrop-filter: blur(var(--cug-glass-blur)) saturate(145%) !important;
      box-shadow: var(--cug-glass-shadow) !important;
    }

    html[data-cug-glass] main [class*="bg-token-main"],
    html[data-cug-glass] [class*="bg-token-surface"],
    html[data-cug-glass] [class*="bg-token-sidebar"] {
      background: var(--cug-glass-bg) !important;
      -webkit-backdrop-filter: blur(var(--cug-glass-blur)) saturate(145%) !important;
      backdrop-filter: blur(var(--cug-glass-blur)) saturate(145%) !important;
    }

    html[data-cug-glass] form,
    html[data-cug-glass] textarea,
    html[data-cug-glass] [contenteditable="true"] {
      background: var(--cug-glass-bg-strong) !important;
      border: 1px solid var(--cug-glass-border) !important;
      -webkit-backdrop-filter: blur(26px) saturate(150%) !important;
      backdrop-filter: blur(26px) saturate(150%) !important;
      box-shadow:
        inset 0 1px 0 var(--cug-glass-highlight),
        0 16px 45px rgba(0, 0, 0, 0.24) !important;
    }

    html[data-cug-glass] form:focus-within,
    html[data-cug-glass] textarea:focus,
    html[data-cug-glass] [contenteditable="true"]:focus {
      border-color: rgba(190, 180, 255, 0.34) !important;
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.10),
        0 0 0 1px rgba(155,140,255,0.10),
        0 18px 50px rgba(0,0,0,0.28) !important;
    }

    html[data-cug-glass] button:not([aria-label*="Close"]):not([data-testid*="close"]) {
      border-color: rgba(255,255,255,0.08) !important;
    }

    html[data-cug-glass] [class*="rounded-"] {
      border-color: rgba(255,255,255,0.08);
    }

    html[data-cug-glass] [data-cug-glass-card] {
      background: var(--cug-glass-bg) !important;
      -webkit-backdrop-filter: blur(22px) saturate(145%) !important;
      backdrop-filter: blur(22px) saturate(145%) !important;
      border: 1px solid var(--cug-glass-border) !important;
      box-shadow: var(--cug-glass-shadow) !important;
    }

    @media (prefers-reduced-motion: reduce) {
      html[data-cug-glass] * {
        scroll-behavior: auto !important;
      }
    }
  `;

  document.documentElement.appendChild(style);
  document.documentElement.setAttribute("data-cug-glass", "true");
}

async function sync() {
  const { [STORAGE_KEY]: enabled = true } = await chrome.storage.local.get({
    [STORAGE_KEY]: true
  });
  applyGlass(enabled);
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes[STORAGE_KEY]) {
    applyGlass(Boolean(changes[STORAGE_KEY].newValue));
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === "SET_GLASSMORPHISM") {
    applyGlass(Boolean(message.enabled));
  }
});

sync();

const STYLE_ID = "chrome-ui-gallery-glassmorphism";

const GLASS_CSS = `
:root {
  --cug-glass-bg: rgba(255,255,255,.075);
  --cug-glass-border: rgba(255,255,255,.13);
  --cug-glass-shadow: 0 18px 55px rgba(0,0,0,.20);
}

html, body {
  background:
    radial-gradient(circle at 15% 15%, rgba(129,102,255,.22), transparent 32%),
    radial-gradient(circle at 85% 78%, rgba(57,201,255,.16), transparent 30%),
    #080b13 !important;
}

body { background-attachment: fixed !important; }

body[data-cug-glass="on"] [class*="bg-token-bg-primary"],
body[data-cug-glass="on"] [class*="bg-token-bg-secondary"],
body[data-cug-glass="on"] [class*="bg-token-surface"],
body[data-cug-glass="on"] main,
body[data-cug-glass="on"] header,
body[data-cug-glass="on"] nav {
  background-color: var(--cug-glass-bg) !important;
  background-image: none !important;
  border-color: var(--cug-glass-border) !important;
  box-shadow: var(--cug-glass-shadow), inset 0 1px 0 rgba(255,255,255,.08) !important;
  backdrop-filter: blur(22px) saturate(145%) !important;
  -webkit-backdrop-filter: blur(22px) saturate(145%) !important;
}

body[data-cug-glass="on"] textarea,
body[data-cug-glass="on"] [contenteditable="true"] {
  background: rgba(255,255,255,.065) !important;
  border: 1px solid rgba(255,255,255,.14) !important;
  border-radius: 18px !important;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.07) !important;
  backdrop-filter: blur(18px) !important;
}

body[data-cug-glass="on"] button {
  border-color: rgba(255,255,255,.12) !important;
}

body[data-cug-glass="on"] [class*="bg-token-bg-primary"] {
  --tw-bg-opacity: .06 !important;
}

body[data-cug-glass="on"] [class*="bg-token-main-surface"] {
  background-color: rgba(255,255,255,.055) !important;
  backdrop-filter: blur(20px) saturate(140%) !important;
}
`;

function ensureStyle() {
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = GLASS_CSS;
    (document.head || document.documentElement).appendChild(style);
  }
}

function apply(enabled) {
  ensureStyle();
  document.body?.setAttribute("data-cug-glass", enabled ? "on" : "off");
}

chrome.storage.local.get({ glassEnabled: true }, ({ glassEnabled }) => {
  apply(glassEnabled);
});

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === "SET_GLASSMORPHISM") {
    apply(Boolean(message.enabled));
  }
});

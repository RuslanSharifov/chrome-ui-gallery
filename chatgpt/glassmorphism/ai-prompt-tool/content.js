const STYLE_ID = "chrome-ui-gallery-glassmorphism";
const STORAGE_KEY = "glassEnabled";
const styleText = `
html[data-cug-glass] {
  --cug-bg: #080a10;
  --cug-glass: rgba(19, 22, 32, .62);
  --cug-glass-strong: rgba(24, 28, 41, .80);
  --cug-glass-soft: rgba(255,255,255,.055);
  --cug-border: rgba(255,255,255,.14);
  --cug-border-soft: rgba(255,255,255,.075);
  --cug-text: rgba(249,250,255,.95);
  --cug-text-2: rgba(229,232,243,.74);
  --cug-text-3: rgba(205,210,225,.52);
  --cug-gold: #f2c76d;
  --cug-gold-2: #ffe2a1;
  --cug-purple: #b5a7ff;
  --cug-cyan: #7ddcff;
  --cug-blur: 26px;
  --cug-shadow: 0 24px 70px rgba(0,0,0,.30);
}
html[data-cug-glass][data-theme="light"], html[data-cug-glass]:not(.dark) {
  --cug-bg: #eef2f8;
  --cug-glass: rgba(255,255,255,.60);
  --cug-glass-strong: rgba(255,255,255,.78);
  --cug-glass-soft: rgba(255,255,255,.42);
  --cug-border: rgba(30,39,58,.13);
  --cug-border-soft: rgba(30,39,58,.08);
  --cug-text: rgba(20,25,37,.94);
  --cug-text-2: rgba(48,56,73,.74);
  --cug-text-3: rgba(72,80,98,.58);
  --cug-gold: #a66b00;
  --cug-gold-2: #c68a16;
  --cug-purple: #6758c9;
  --cug-cyan: #167c9e;
}
html[data-cug-glass], html[data-cug-glass] body {
  background: radial-gradient(circle at 8% 0%, rgba(119,92,255,.18), transparent 28%), radial-gradient(circle at 92% 82%, rgba(49,194,255,.13), transparent 31%), var(--cug-bg) !important;
  color: var(--cug-text) !important;
}
html[data-cug-glass] body::before {
  content: ""; position: fixed; inset: -15%; pointer-events: none; z-index: -1;
  background: radial-gradient(circle at 25% 35%, rgba(242,199,109,.055), transparent 24%), radial-gradient(circle at 70% 62%, rgba(122,103,255,.07), transparent 28%);
  animation: cug-ambient 18s ease-in-out infinite alternate;
}
@keyframes cug-ambient { from { transform: translate3d(-1.5%, -1%, 0) scale(1); } to { transform: translate3d(1.5%, 1%, 0) scale(1.04); } }

html[data-cug-glass] aside.app-shell-left-panel,
html[data-cug-glass] aside[data-testid="app-shell-floating-left-panel"],
html[data-cug-glass] #stage-slideover-sidebar,
html[data-cug-glass] nav[aria-label="Chat history"] {
  background: linear-gradient(180deg, rgba(255,255,255,.07), rgba(255,255,255,.018)), rgba(10,13,21,.68) !important;
  color: var(--cug-text) !important; border-color: var(--cug-border) !important;
  backdrop-filter: blur(30px) saturate(155%) !important; -webkit-backdrop-filter: blur(30px) saturate(155%) !important;
  box-shadow: inset -1px 0 rgba(255,255,255,.05), 18px 0 60px rgba(0,0,0,.18) !important;
}
html[data-cug-glass] aside.app-shell-left-panel a, html[data-cug-glass] nav[aria-label="Chat history"] a {
  color: var(--cug-text-2) !important; background: transparent !important; border: 1px solid transparent !important;
  border-radius: 13px !important; transition: transform .18s ease, background .18s ease, color .18s ease, box-shadow .18s ease !important;
}
html[data-cug-glass] aside.app-shell-left-panel a:hover, html[data-cug-glass] nav[aria-label="Chat history"] a:hover {
  color: var(--cug-text) !important; background: rgba(255,255,255,.075) !important;
  transform: perspective(500px) translate3d(3px,-1px,0) rotateX(1deg) scale(1.012);
  box-shadow: 0 8px 24px rgba(0,0,0,.14);
}
html[data-cug-glass] aside.app-shell-left-panel [data-sidebar-group-label], html[data-cug-glass] aside.app-shell-left-panel h3 {
  color: var(--cug-gold) !important; letter-spacing: .045em; text-transform: uppercase;
}
html[data-cug-glass] a[href*="/images"], html[data-cug-glass] a[href*="/library"],
html[data-cug-glass] a[href*="/scheduled"], html[data-cug-glass] a[href*="/projects"],
html[data-cug-glass] a[href*="/codex"], html[data-cug-glass] a[href*="/settings"],
html[data-cug-glass] [data-testid*="images"], html[data-cug-glass] [data-testid*="library"],
html[data-cug-glass] [data-testid*="scheduled"], html[data-cug-glass] [data-testid*="project"] {
  position: relative; color: var(--cug-text-2) !important;
}
html[data-cug-glass] a[href*="/images"] svg, html[data-cug-glass] a[href*="/library"] svg,
html[data-cug-glass] a[href*="/scheduled"] svg, html[data-cug-glass] a[href*="/projects"] svg,
html[data-cug-glass] a[href*="/codex"] svg, html[data-cug-glass] [data-testid*="images"] svg,
html[data-cug-glass] [data-testid*="library"] svg, html[data-cug-glass] [data-testid*="scheduled"] svg,
html[data-cug-glass] [data-testid*="project"] svg { color: var(--cug-gold) !important; }

html[data-cug-glass] nav[aria-label="Chat history"] a, html[data-cug-glass] aside.app-shell-left-panel a[href*="/c/"] {
  transform-origin: left center; perspective: 700px;
}
html[data-cug-glass] nav[aria-label="Chat history"] a:hover, html[data-cug-glass] aside.app-shell-left-panel a[href*="/c/"]:hover {
  transform: perspective(700px) translate3d(5px,-2px,4px) rotateY(-2deg) rotateX(2deg) scale(1.025);
  background: linear-gradient(90deg, rgba(242,199,109,.10), rgba(255,255,255,.045)) !important;
  border-color: rgba(242,199,109,.16) !important;
}
html[data-cug-glass] nav[aria-label="Chat history"] a small, html[data-cug-glass] nav[aria-label="Chat history"] a [class*="text-token-text-tertiary"] {
  color: var(--cug-gold) !important; font-size: .72rem !important; font-weight: 600 !important;
}
html[data-cug-glass] button, html[data-cug-glass] [role="button"] { color: var(--cug-text-2) !important; }
html[data-cug-glass] button:hover, html[data-cug-glass] [role="button"]:hover { color: var(--cug-text) !important; }
html[data-cug-glass] [aria-label*="Upgrade"], html[data-cug-glass] [data-testid*="upgrade"] {
  background: linear-gradient(135deg, rgba(242,199,109,.18), rgba(255,255,255,.055)) !important;
  color: var(--cug-gold-2) !important; box-shadow: inset 0 1px rgba(255,255,255,.10) !important;
}
html[data-cug-glass] main, html[data-cug-glass] [role="main"] {
  background: transparent !important; color: var(--cug-text) !important;
}
html[data-cug-glass] main::before, html[data-cug-glass] [role="main"]::before {
  content: ""; position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(135deg, rgba(255,255,255,.025), transparent 38%), radial-gradient(circle at 50% 20%, rgba(181,167,255,.06), transparent 34%);
}
html[data-cug-glass] [data-composer-surface="true"], html[data-cug-glass] form[data-type="unified-composer"],
html[data-cug-glass] form.group\\/composer {
  background: linear-gradient(135deg, rgba(255,255,255,.085), rgba(255,255,255,.028)), var(--cug-glass-strong) !important;
  border: 1px solid var(--cug-border) !important; border-radius: 27px !important;
  backdrop-filter: blur(32px) saturate(155%) !important; -webkit-backdrop-filter: blur(32px) saturate(155%) !important;
  box-shadow: inset 0 1px rgba(255,255,255,.10), 0 22px 65px rgba(0,0,0,.28) !important;
}
html[data-cug-glass] #prompt-textarea, html[data-cug-glass] textarea[name="prompt-textarea"],
html[data-cug-glass] .ProseMirror[contenteditable="true"] {
  color: var(--cug-text) !important; -webkit-text-fill-color: var(--cug-text) !important;
  caret-color: var(--cug-gold-2) !important; background: transparent !important; border: 0 !important; outline: 0 !important;
}
html[data-cug-glass] #prompt-textarea::placeholder, html[data-cug-glass] textarea[name="prompt-textarea"]::placeholder,
html[data-cug-glass] .ProseMirror[contenteditable="true"]::before { color: var(--cug-text-3) !important; -webkit-text-fill-color: var(--cug-text-3) !important; opacity: 1 !important; }
html[data-cug-glass] [data-composer-surface="true"]:focus-within, html[data-cug-glass] form[data-type="unified-composer"]:focus-within {
  border-color: rgba(242,199,109,.40) !important; box-shadow: inset 0 1px rgba(255,255,255,.11), 0 0 0 1px rgba(242,199,109,.08), 0 25px 70px rgba(0,0,0,.30) !important;
}
html[data-cug-glass] [data-message-author-role="user"], html[data-cug-glass] [data-role="user"] {
  color: var(--cug-text) !important; background: linear-gradient(135deg, rgba(242,199,109,.15), rgba(125,220,255,.07)), rgba(255,255,255,.045) !important;
  border: 1px solid rgba(242,199,109,.15) !important; border-radius: 21px !important; backdrop-filter: blur(20px) !important;
}
html[data-cug-glass] [data-message-author-role="assistant"], html[data-cug-glass] [data-role="assistant"] { color: var(--cug-text) !important; }
html[data-cug-glass] .text-token-text-primary { color: var(--cug-text) !important; }
html[data-cug-glass] .text-token-text-secondary { color: var(--cug-text-2) !important; }
html[data-cug-glass] .text-token-text-tertiary { color: var(--cug-text-3) !important; }
html[data-cug-glass] [role="dialog"], html[data-cug-glass] [role="menu"], html[data-cug-glass] [role="listbox"],
html[data-cug-glass] [data-radix-popper-content-wrapper] > *, html[data-cug-glass] .popover {
  color: var(--cug-text) !important; background: linear-gradient(135deg, rgba(255,255,255,.085), rgba(255,255,255,.025)), rgba(20,23,35,.86) !important;
  border: 1px solid var(--cug-border) !important; border-radius: 18px !important;
  backdrop-filter: blur(30px) saturate(155%) !important; -webkit-backdrop-filter: blur(30px) saturate(155%) !important;
  box-shadow: var(--cug-shadow) !important;
}
html[data-cug-glass] [role="dialog"] *, html[data-cug-glass] [role="menu"] *, html[data-cug-glass] [role="listbox"] * { border-color: var(--cug-border-soft); }
html[data-cug-glass] [role="menuitem"], html[data-cug-glass] [role="option"] { color: var(--cug-text-2) !important; background: transparent !important; border-radius: 11px !important; }
html[data-cug-glass] [role="menuitem"]:hover, html[data-cug-glass] [role="option"]:hover { color: var(--cug-text) !important; background: rgba(242,199,109,.10) !important; }
html[data-cug-glass] h1, html[data-cug-glass] h2, html[data-cug-glass] h3, html[data-cug-glass] h4 { color: var(--cug-text) !important; }
html[data-cug-glass] a { color: var(--cug-text-2); }
html[data-cug-glass] pre, html[data-cug-glass] [data-testid*="code-block"] { background: rgba(5,7,12,.54) !important; border: 1px solid var(--cug-border-soft) !important; border-radius: 15px !important; }
html[data-cug-glass] *::-webkit-scrollbar { width: 8px; height: 8px; }
html[data-cug-glass] *::-webkit-scrollbar-track { background: transparent; }
html[data-cug-glass] *::-webkit-scrollbar-thumb { background: rgba(255,255,255,.16); border-radius: 999px; border: 2px solid transparent; background-clip: padding-box; }
@media (prefers-reduced-motion: reduce) { html[data-cug-glass] body::before { animation: none !important; } html[data-cug-glass] * { transition: none !important; } }
`;

function detectMode() {
  const root = document.documentElement;
  const explicit = root.getAttribute("data-theme") || root.getAttribute("data-color-scheme") || root.dataset.themeMode || (root.classList.contains("dark") ? "dark" : "");
  const value = String(explicit || "").toLowerCase();
  if (value.includes("light")) return "light";
  if (value.includes("dark")) return "dark";
  const bodyClass = String(document.body?.className || "").toLowerCase();
  if (bodyClass.includes("dark")) return "dark";
  if (bodyClass.includes("light")) return "light";
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}
function syncMode() {
  if (document.documentElement.dataset.cugGlass !== "true") return;
  document.documentElement.setAttribute("data-cug-mode", detectMode());
}
function applyGlass(enabled) {
  const root = document.documentElement;
  const old = document.getElementById(STYLE_ID);
  if (!enabled) { old?.remove(); root.removeAttribute("data-cug-glass"); return; }
  if (!old) {
    const style = document.createElement("style");
    style.id = STYLE_ID; style.textContent = styleText; (document.head || root).appendChild(style);
  }
  root.setAttribute("data-cug-glass", "true");
  syncMode();
  setupDialogDrag();
}
function setupDialogDrag() {
  document.querySelectorAll('[role="dialog"]').forEach((dialog) => {
    if (dialog.dataset.cugDragReady === "true") return;
    dialog.dataset.cugDragReady = "true";
    dialog.setAttribute("data-cug-draggable", "true");
    const handle = dialog.querySelector("header, [data-testid*=header], h1, h2, h3") || dialog.firstElementChild;
    if (!handle) return;
    handle.dataset.cugDragHandle = "true";
    let dragging = false, startX = 0, startY = 0, startLeft = 0, startTop = 0;
    handle.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || e.target.closest("button, a, input, textarea, [role=button]")) return;
      const rect = dialog.getBoundingClientRect();
      dragging = true; startX = e.clientX; startY = e.clientY; startLeft = rect.left; startTop = rect.top;
      dialog.style.position = "fixed"; dialog.style.left = rect.left + "px"; dialog.style.top = rect.top + "px";
      dialog.style.margin = "0"; dialog.style.transform = "none"; dialog.style.zIndex = "2147483000";
      dialog.setPointerCapture?.(e.pointerId);
    });
    handle.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const maxLeft = Math.max(8, window.innerWidth - dialog.offsetWidth - 8);
      const maxTop = Math.max(8, window.innerHeight - dialog.offsetHeight - 8);
      dialog.style.left = Math.max(8, Math.min(maxLeft, startLeft + e.clientX - startX)) + "px";
      dialog.style.top = Math.max(8, Math.min(maxTop, startTop + e.clientY - startY)) + "px";
    });
    const stop = () => { dragging = false; };
    handle.addEventListener("pointerup", stop); handle.addEventListener("pointercancel", stop);
  });
}
async function sync() {
  const result = await chrome.storage.local.get({ [STORAGE_KEY]: true });
  applyGlass(Boolean(result[STORAGE_KEY]));
}
chrome.storage.onChanged.addListener((changes, area) => { if (area === "local" && changes[STORAGE_KEY]) applyGlass(Boolean(changes[STORAGE_KEY].newValue)); });
chrome.runtime.onMessage.addListener((message) => { if (message?.type === "SET_GLASSMORPHISM") applyGlass(Boolean(message.enabled)); });
new MutationObserver(() => { if (document.documentElement.dataset.cugGlass === "true") { syncMode(); setupDialogDrag(); } }).observe(document.documentElement, { childList: true, subtree: true });
sync();

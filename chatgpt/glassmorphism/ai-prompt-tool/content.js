const STYLE_ID = "chrome-ui-gallery-glassmorphism";
const STORAGE_KEY = "glassEnabled";

const styleText = `
/* =========================================================
   CHROME UI GALLERY — CHATGPT GLASSMORPHISM
   Visual-only theme: no chat/API/navigation logic changes.
   ========================================================= */

html[data-cug-glass][data-cug-mode="dark"] {
  --cug-bg: #030507;
  --cug-bg-2: #070a0f;
  --cug-surface: rgba(13, 17, 24, .66);
  --cug-surface-2: rgba(18, 23, 32, .78);
  --cug-surface-3: rgba(24, 30, 41, .88);
  --cug-soft: rgba(255,255,255,.045);
  --cug-soft-2: rgba(255,255,255,.075);
  --cug-line: rgba(255,255,255,.105);
  --cug-line-strong: rgba(255,255,255,.18);
  --cug-text: #f7f9fc;
  --cug-text-2: #cdd4df;
  --cug-text-3: #8f99a8;
  --cug-muted: #697585;
  --cug-accent: #f4c96d;
  --cug-accent-2: #ffe4a4;
  --cug-blue: #8bdcff;
  --cug-purple: #b9adff;
  --cug-success: #8fe1b0;
  --cug-danger: #ff9a9a;
  --cug-shadow: 0 24px 80px rgba(0,0,0,.42);
  --cug-shadow-soft: 0 12px 40px rgba(0,0,0,.26);
}

html[data-cug-glass][data-cug-mode="light"] {
  --cug-bg: #e9edf3;
  --cug-bg-2: #f4f6f9;
  --cug-surface: rgba(255,255,255,.60);
  --cug-surface-2: rgba(255,255,255,.74);
  --cug-surface-3: rgba(255,255,255,.88);
  --cug-soft: rgba(255,255,255,.38);
  --cug-soft-2: rgba(255,255,255,.62);
  --cug-line: rgba(24,31,43,.10);
  --cug-line-strong: rgba(24,31,43,.17);
  --cug-text: #18202c;
  --cug-text-2: #414b5b;
  --cug-text-3: #687386;
  --cug-muted: #8b95a5;
  --cug-accent: #986300;
  --cug-accent-2: #bd7e08;
  --cug-blue: #087797;
  --cug-purple: #6659bd;
  --cug-success: #17734a;
  --cug-danger: #a52d2d;
  --cug-shadow: 0 24px 70px rgba(43,52,68,.16);
  --cug-shadow-soft: 0 12px 38px rgba(43,52,68,.11);
}

/* ---------- ROOT / ATMOSPHERE ---------- */
html[data-cug-glass],
html[data-cug-glass] body {
  background:
    radial-gradient(circle at 8% 8%, color-mix(in srgb, var(--cug-purple) 12%, transparent), transparent 28%),
    radial-gradient(circle at 88% 78%, color-mix(in srgb, var(--cug-blue) 10%, transparent), transparent 30%),
    var(--cug-bg) !important;
  color: var(--cug-text) !important;
}

html[data-cug-glass] body {
  min-height: 100vh !important;
}

html[data-cug-glass] body::before,
html[data-cug-glass] body::after {
  content: "";
  position: fixed;
  inset: -18%;
  pointer-events: none;
  z-index: -1;
  background:
    radial-gradient(circle at 22% 30%, color-mix(in srgb, var(--cug-accent) 7%, transparent), transparent 21%),
    radial-gradient(circle at 74% 62%, color-mix(in srgb, var(--cug-purple) 8%, transparent), transparent 25%);
  animation: cug-float 22s ease-in-out infinite alternate;
}

html[data-cug-glass] body::after {
  animation-duration: 30s;
  animation-direction: alternate-reverse;
  opacity: .65;
}

@keyframes cug-float {
  0% { transform: translate3d(-1.2%, -1%, 0) scale(1); }
  50% { transform: translate3d(1%, .7%, 0) scale(1.025); }
  100% { transform: translate3d(1.8%, -1.1%, 0) scale(1.045); }
}

/* ---------- UNIVERSAL TYPOGRAPHY / SURFACES ---------- */
html[data-cug-glass] body,
html[data-cug-glass] body * {
  border-color: var(--cug-line) !important;
}

html[data-cug-glass] body,
html[data-cug-glass] div,
html[data-cug-glass] span,
html[data-cug-glass] p,
html[data-cug-glass] li,
html[data-cug-glass] label,
html[data-cug-glass] small,
html[data-cug-glass] button,
html[data-cug-glass] [role="button"],
html[data-cug-glass] input,
html[data-cug-glass] textarea,
html[data-cug-glass] [contenteditable="true"] {
  color: var(--cug-text);
}

html[data-cug-glass] h1,
html[data-cug-glass] h2,
html[data-cug-glass] h3,
html[data-cug-glass] h4,
html[data-cug-glass] h5,
html[data-cug-glass] h6 {
  color: var(--cug-text) !important;
  text-shadow: 0 1px 18px color-mix(in srgb, var(--cug-text) 8%, transparent);
}

html[data-cug-glass] a {
  color: var(--cug-text-2) !important;
}

html[data-cug-glass] a:hover {
  color: var(--cug-text) !important;
}

html[data-cug-glass] svg {
  color: currentColor;
  transition: color .2s ease, transform .2s ease, opacity .2s ease, filter .2s ease;
}

html[data-cug-glass] button,
html[data-cug-glass] [role="button"] {
  transition:
    color .2s ease,
    background .2s ease,
    border-color .2s ease,
    box-shadow .2s ease,
    transform .2s ease,
    filter .2s ease !important;
}

/* ---------- LEFT SIDEBAR ---------- */
html[data-cug-glass] aside,
html[data-cug-glass] nav[aria-label*="Chat history"],
html[data-cug-glass] [data-testid*="left-panel"],
html[data-cug-glass] [data-testid*="sidebar"] {
  background:
    linear-gradient(180deg, var(--cug-soft-2), transparent 24%),
    var(--cug-surface) !important;
  color: var(--cug-text) !important;
  backdrop-filter: blur(30px) saturate(145%) !important;
  -webkit-backdrop-filter: blur(30px) saturate(145%) !important;
  box-shadow: inset -1px 0 var(--cug-line), 18px 0 60px rgba(0,0,0,.12) !important;
}

html[data-cug-glass] aside::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(255,255,255,.035), transparent 35%);
}

/* Sidebar headings / group labels */
html[data-cug-glass] aside h1,
html[data-cug-glass] aside h2,
html[data-cug-glass] aside h3,
html[data-cug-glass] aside [data-sidebar-group-label],
html[data-cug-glass] aside [class*="group-label"] {
  color: var(--cug-accent) !important;
  font-weight: 700 !important;
  letter-spacing: .045em !important;
}

/* Sidebar navigation */
html[data-cug-glass] aside a,
html[data-cug-glass] aside button,
html[data-cug-glass] aside [role="button"],
html[data-cug-glass] nav a,
html[data-cug-glass] nav button {
  color: var(--cug-text-2) !important;
  background: transparent !important;
  border: 1px solid transparent !important;
  border-radius: 12px !important;
}

html[data-cug-glass] aside a:hover,
html[data-cug-glass] aside button:hover,
html[data-cug-glass] aside [role="button"]:hover,
html[data-cug-glass] nav a:hover,
html[data-cug-glass] nav button:hover {
  color: var(--cug-text) !important;
  background: linear-gradient(90deg, var(--cug-soft-2), var(--cug-soft)) !important;
  border-color: var(--cug-line) !important;
  transform: translate3d(3px,-1px,0) !important;
  box-shadow: var(--cug-shadow-soft) !important;
}

/* Active sidebar item */
html[data-cug-glass] aside a[aria-current="page"],
html[data-cug-glass] aside button[aria-current="page"],
html[data-cug-glass] aside [data-state="active"],
html[data-cug-glass] nav a[aria-current="page"] {
  color: var(--cug-text) !important;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--cug-accent) 15%, transparent), var(--cug-soft)) !important;
  border-color: color-mix(in srgb, var(--cug-accent) 22%, transparent) !important;
  box-shadow: inset 0 1px rgba(255,255,255,.08), var(--cug-shadow-soft) !important;
}

html[data-cug-glass] aside a[aria-current="page"] svg,
html[data-cug-glass] aside [data-state="active"] svg {
  color: var(--cug-accent) !important;
}

/* ---------- SPECIFIC NAV / CHAT-WORK ---------- */
html[data-cug-glass] [data-cug-role],
html[data-cug-glass] [data-cug-nav] {
  color: var(--cug-text-2) !important;
}

html[data-cug-glass] [data-cug-nav="chat-work"],
html[data-cug-glass] [data-cug-nav="new-chat"],
html[data-cug-glass] [data-cug-nav="images"],
html[data-cug-glass] [data-cug-nav="library"],
html[data-cug-glass] [data-cug-nav="scheduled"],
html[data-cug-glass] [data-cug-nav="plans"],
html[data-cug-glass] [data-cug-nav="projects"],
html[data-cug-glass] [data-cug-nav="codex"],
html[data-cug-glass] [data-cug-nav="more"] {
  color: var(--cug-text-2) !important;
  background: linear-gradient(135deg, var(--cug-soft-2), var(--cug-soft)) !important;
  border: 1px solid var(--cug-line) !important;
  box-shadow: inset 0 1px rgba(255,255,255,.035) !important;
}

html[data-cug-glass] [data-cug-nav]:hover {
  color: var(--cug-text) !important;
  border-color: color-mix(in srgb, var(--cug-accent) 28%, var(--cug-line)) !important;
  box-shadow: 0 10px 30px rgba(0,0,0,.16), inset 0 1px rgba(255,255,255,.08) !important;
  transform: translate3d(2px,-1px,0) scale(1.01) !important;
}

html[data-cug-glass] [data-cug-nav] svg {
  color: var(--cug-accent) !important;
}

html[data-cug-glass] [data-cug-nav="claim-offer"],
html[data-cug-glass] [data-cug-nav="upgrade"] {
  color: var(--cug-accent-2) !important;
  background: linear-gradient(135deg, color-mix(in srgb, var(--cug-accent) 17%, transparent), var(--cug-soft)) !important;
  border-color: color-mix(in srgb, var(--cug-accent) 27%, transparent) !important;
}

/* ---------- CHAT HISTORY / PROJECT AFFILIATION ---------- */
html[data-cug-glass] nav[aria-label*="Chat history"] a,
html[data-cug-glass] aside a[href*="/c/"] {
  color: var(--cug-text-2) !important;
  transform-origin: left center;
  perspective: 800px;
}

html[data-cug-glass] nav[aria-label*="Chat history"] a:hover,
html[data-cug-glass] aside a[href*="/c/"]:hover {
  color: var(--cug-text) !important;
  background: linear-gradient(105deg, color-mix(in srgb, var(--cug-accent) 11%, transparent), var(--cug-soft)) !important;
  border-color: color-mix(in srgb, var(--cug-accent) 20%, transparent) !important;
  transform: perspective(800px) translate3d(5px,-2px,4px) rotateY(-2deg) rotateX(1.5deg) scale(1.018) !important;
}

html[data-cug-glass] [data-cug-project-label="true"],
html[data-cug-glass] nav[aria-label*="Chat history"] a small,
html[data-cug-glass] nav[aria-label*="Chat history"] a [class*="tertiary"],
html[data-cug-glass] nav[aria-label*="Chat history"] a [class*="secondary"] {
  color: var(--cug-accent) !important;
  font-size: .72rem !important;
  font-weight: 700 !important;
  letter-spacing: .01em !important;
}

/* ---------- MAIN CONTENT ---------- */
html[data-cug-glass] main,
html[data-cug-glass] [role="main"] {
  position: relative !important;
  isolation: isolate;
  background: transparent !important;
  color: var(--cug-text) !important;
}

html[data-cug-glass] main::before,
html[data-cug-glass] [role="main"]::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    radial-gradient(circle at 50% 5%, color-mix(in srgb, var(--cug-purple) 7%, transparent), transparent 30%),
    linear-gradient(180deg, transparent 60%, color-mix(in srgb, var(--cug-bg) 22%, transparent));
}

/* New-chat empty state: layered glass planes */
html[data-cug-glass] main [class*="empty"],
html[data-cug-glass] main [class*="welcome"] {
  color: var(--cug-text) !important;
}

html[data-cug-glass] main [class*="empty"] > div,
html[data-cug-glass] main [class*="welcome"] > div {
  border-radius: 24px !important;
}

/* ---------- COMPOSER ---------- */
html[data-cug-glass] [data-composer-surface="true"],
html[data-cug-glass] form[data-type="unified-composer"],
html[data-cug-glass] form.group\\/composer,
html[data-cug-glass] [class*="composer"] {
  background:
    linear-gradient(135deg, var(--cug-soft-2), transparent 45%),
    var(--cug-surface-2) !important;
  border: 1px solid var(--cug-line-strong) !important;
  border-radius: 26px !important;
  backdrop-filter: blur(30px) saturate(145%) !important;
  -webkit-backdrop-filter: blur(30px) saturate(145%) !important;
  box-shadow:
    inset 0 1px rgba(255,255,255,.09),
    0 24px 70px rgba(0,0,0,.22) !important;
}

html[data-cug-glass] [data-composer-surface="true"]:focus-within,
html[data-cug-glass] form[data-type="unified-composer"]:focus-within,
html[data-cug-glass] form.group\\/composer:focus-within {
  border-color: color-mix(in srgb, var(--cug-accent) 48%, var(--cug-line)) !important;
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--cug-accent) 13%, transparent),
    0 24px 75px rgba(0,0,0,.27) !important;
}

html[data-cug-glass] #prompt-textarea,
html[data-cug-glass] textarea[name="prompt-textarea"],
html[data-cug-glass] .ProseMirror[contenteditable="true"] {
  color: var(--cug-text) !important;
  -webkit-text-fill-color: var(--cug-text) !important;
  background: transparent !important;
  border: 0 !important;
  outline: 0 !important;
  caret-color: var(--cug-accent) !important;
}

html[data-cug-glass] #prompt-textarea::placeholder,
html[data-cug-glass] textarea[name="prompt-textarea"]::placeholder,
html[data-cug-glass] .ProseMirror[contenteditable="true"]::before {
  color: var(--cug-text-3) !important;
  -webkit-text-fill-color: var(--cug-text-3) !important;
  opacity: 1 !important;
}

/* ---------- USER / ASSISTANT CONTENT ---------- */
html[data-cug-glass] [data-message-author-role="user"],
html[data-cug-glass] [data-role="user"] {
  color: var(--cug-text) !important;
  background: linear-gradient(135deg, color-mix(in srgb, var(--cug-accent) 13%, transparent), var(--cug-soft)) !important;
  border: 1px solid color-mix(in srgb, var(--cug-accent) 15%, var(--cug-line)) !important;
  border-radius: 20px !important;
  backdrop-filter: blur(18px) !important;
}

html[data-cug-glass] [data-message-author-role="assistant"],
html[data-cug-glass] [data-role="assistant"] {
  color: var(--cug-text) !important;
  background: transparent !important;
}

/* ---------- MENUS / POPOVERS / SETTINGS / UPGRADE / PLUGINS ---------- */
html[data-cug-glass] [role="dialog"],
html[data-cug-glass] [role="menu"],
html[data-cug-glass] [role="listbox"],
html[data-cug-glass] [data-radix-popper-content-wrapper] > *,
html[data-cug-glass] [data-state="open"][data-side],
html[data-cug-glass] .popover,
html[data-cug-glass] [class*="modal"],
html[data-cug-glass] [class*="popover"] {
  color: var(--cug-text) !important;
  background:
    linear-gradient(135deg, var(--cug-soft-2), transparent 46%),
    var(--cug-surface-3) !important;
  border: 1px solid var(--cug-line-strong) !important;
  border-radius: 20px !important;
  backdrop-filter: blur(32px) saturate(155%) !important;
  -webkit-backdrop-filter: blur(32px) saturate(155%) !important;
  box-shadow: var(--cug-shadow) !important;
}

html[data-cug-glass] [role="dialog"]::before {
  content: "";
  position: absolute;
  inset: 0 0 auto 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--cug-accent) 55%, transparent), transparent);
  pointer-events: none;
}

html[data-cug-glass] [role="menuitem"],
html[data-cug-glass] [role="option"] {
  color: var(--cug-text-2) !important;
  background: transparent !important;
  border-radius: 10px !important;
}

html[data-cug-glass] [role="menuitem"]:hover,
html[data-cug-glass] [role="option"]:hover {
  color: var(--cug-text) !important;
  background: color-mix(in srgb, var(--cug-accent) 10%, transparent) !important;
}

/* ---------- UPGRADE / PLAN / CLAIM OFFER ---------- */
html[data-cug-glass] [aria-label*="Upgrade"],
html[data-cug-glass] [aria-label*="upgrade"],
html[data-cug-glass] [data-testid*="upgrade"],
html[data-cug-glass] [data-testid*="plan"] {
  color: var(--cug-accent-2) !important;
  background: linear-gradient(135deg, color-mix(in srgb, var(--cug-accent) 15%, transparent), var(--cug-soft)) !important;
  border-color: color-mix(in srgb, var(--cug-accent) 27%, var(--cug-line)) !important;
}

/* ---------- FORMS / CONTROLS ---------- */
html[data-cug-glass] input,
html[data-cug-glass] textarea,
html[data-cug-glass] select,
html[data-cug-glass] [contenteditable="true"] {
  color: var(--cug-text) !important;
  background: var(--cug-soft) !important;
  border-color: var(--cug-line) !important;
}

html[data-cug-glass] input:focus,
html[data-cug-glass] textarea:focus,
html[data-cug-glass] select:focus,
html[data-cug-glass] [contenteditable="true"]:focus {
  border-color: color-mix(in srgb, var(--cug-accent) 45%, var(--cug-line)) !important;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--cug-accent) 9%, transparent) !important;
}

html[data-cug-glass] input::placeholder,
html[data-cug-glass] textarea::placeholder {
  color: var(--cug-text-3) !important;
  opacity: 1 !important;
}

/* ---------- BUTTON SYSTEM ---------- */
html[data-cug-glass] button,
html[data-cug-glass] [role="button"] {
  color: var(--cug-text-2) !important;
}

html[data-cug-glass] button:hover,
html[data-cug-glass] [role="button"]:hover {
  color: var(--cug-text) !important;
}

html[data-cug-glass] button:disabled,
html[data-cug-glass] [role="button"][aria-disabled="true"] {
  color: var(--cug-muted) !important;
  opacity: .58 !important;
}

/* ---------- CODE / TABLES / QUOTES ---------- */
html[data-cug-glass] pre,
html[data-cug-glass] code,
html[data-cug-glass] [data-testid*="code-block"] {
  background: color-mix(in srgb, var(--cug-bg) 70%, var(--cug-surface)) !important;
  color: var(--cug-text) !important;
  border-color: var(--cug-line) !important;
  border-radius: 14px !important;
}

html[data-cug-glass] blockquote {
  color: var(--cug-text-2) !important;
  border-left-color: var(--cug-accent) !important;
}

/* ---------- SELECTION / FOCUS ---------- */
html[data-cug-glass] ::selection {
  background: color-mix(in srgb, var(--cug-accent) 35%, transparent);
  color: var(--cug-text);
}

html[data-cug-glass] :focus-visible {
  outline: 2px solid color-mix(in srgb, var(--cug-accent) 55%, transparent) !important;
  outline-offset: 2px !important;
}

/* ---------- SCROLLBARS ---------- */
html[data-cug-glass] *::-webkit-scrollbar {
  width: 9px;
  height: 9px;
}

html[data-cug-glass] *::-webkit-scrollbar-track {
  background: transparent !important;
}

html[data-cug-glass] *::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--cug-text-3) 38%, transparent) !important;
  border: 2px solid transparent !important;
  background-clip: padding-box !important;
  border-radius: 999px !important;
}

html[data-cug-glass] *::-webkit-scrollbar-thumb:hover {
  background: color-mix(in srgb, var(--cug-accent) 55%, transparent) !important;
  background-clip: padding-box !important;
}

/* ---------- DRAGGABLE WINDOWS ---------- */
html[data-cug-glass] [data-cug-draggable="true"] {
  overflow: hidden;
}

html[data-cug-glass] [data-cug-drag-handle="true"] {
  cursor: grab !important;
  user-select: none !important;
}

html[data-cug-glass] [data-cug-drag-handle="true"]:active {
  cursor: grabbing !important;
}

/* ---------- REDUCED MOTION ---------- */
@media (prefers-reduced-motion: reduce) {
  html[data-cug-glass] *,
  html[data-cug-glass] *::before,
  html[data-cug-glass] *::after {
    animation: none !important;
    transition: none !important;
    scroll-behavior: auto !important;
  }
}
`;

function detectMode() {
  const root = document.documentElement;
  const explicit =
    root.getAttribute("data-theme") ||
    root.getAttribute("data-color-scheme") ||
    root.dataset.themeMode ||
    (root.classList.contains("dark") ? "dark" : "");

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

function labelUI() {
  if (document.documentElement.dataset.cugGlass !== "true") return;

  const nodes = document.querySelectorAll("button, a, [role='button'], [role='menuitem']");
  nodes.forEach((el) => {
    if (el.dataset.cugLabeled === "true") return;

    const raw = [
      el.innerText,
      el.getAttribute("aria-label"),
      el.getAttribute("title"),
      el.getAttribute("data-testid")
    ].filter(Boolean).join(" ").replace(/\\s+/g, " ").trim().toLowerCase();

    if (!raw) return;

    const rules = [
      ["chat-work", /chat\\s*[/·|-]\\s*work|^chat$|^work$/],
      ["new-chat", /new chat|new conversation/],
      ["images", /^(images?|image)$/],
      ["library", /^(library|files)$/],
      ["scheduled", /scheduled/],
      ["plans", /^(plans?|pricing)$/],
      ["projects", /projects?/],
      ["codex", /codex/],
      ["more", /^more(\\s|$)/],
      ["upgrade", /upgrade|go plus|plus plan/],
      ["claim-offer", /claim offer|claim|special offer/],
      ["settings", /settings/],
      ["hidden-chat", /hidden chat|hide chat|show hidden/]
    ];

    const match = rules.find(([, regex]) => regex.test(raw));
    if (match) el.setAttribute("data-cug-nav", match[0]);

    if (/project/.test(raw) && !/projects?\\s*$/.test(raw)) {
      el.setAttribute("data-cug-project-label", "true");
    }

    el.dataset.cugLabeled = "true";
  });
}

function applyGlass(enabled) {
  const root = document.documentElement;
  const old = document.getElementById(STYLE_ID);

  if (!enabled) {
    old?.remove();
    root.removeAttribute("data-cug-glass");
    root.removeAttribute("data-cug-mode");
    return;
  }

  if (!old) {
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = styleText;
    (document.head || root).appendChild(style);
  }

  root.setAttribute("data-cug-glass", "true");
  syncMode();
  labelUI();
  setupDialogDrag();
}

function setupDialogDrag() {
  document.querySelectorAll('[role="dialog"]').forEach((dialog) => {
    if (dialog.dataset.cugDragReady === "true") return;

    const handle =
      dialog.querySelector("header") ||
      dialog.querySelector('[data-testid*="header"]') ||
      dialog.querySelector("h1, h2, h3") ||
      dialog.firstElementChild;

    if (!handle) return;

    dialog.dataset.cugDragReady = "true";
    dialog.dataset.cugDraggable = "true";
    handle.dataset.cugDragHandle = "true";

    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;

    handle.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      if (event.target.closest("button, a, input, textarea, select, [role='button']")) return;

      const rect = dialog.getBoundingClientRect();
      dragging = true;
      startX = event.clientX;
      startY = event.clientY;
      startLeft = rect.left;
      startTop = rect.top;

      dialog.style.position = "fixed";
      dialog.style.left = rect.left + "px";
      dialog.style.top = rect.top + "px";
      dialog.style.margin = "0";
      dialog.style.transform = "none";
      dialog.style.zIndex = "2147483000";
      handle.setPointerCapture?.(event.pointerId);
    });

    handle.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      const maxLeft = Math.max(8, window.innerWidth - dialog.offsetWidth - 8);
      const maxTop = Math.max(8, window.innerHeight - dialog.offsetHeight - 8);
      const nextLeft = Math.max(8, Math.min(maxLeft, startLeft + event.clientX - startX));
      const nextTop = Math.max(8, Math.min(maxTop, startTop + event.clientY - startY));

      dialog.style.left = nextLeft + "px";
      dialog.style.top = nextTop + "px";
    });

    const stop = () => { dragging = false; };
    handle.addEventListener("pointerup", stop);
    handle.addEventListener("pointercancel", stop);
  });
}

async function sync() {
  const result = await chrome.storage.local.get({ [STORAGE_KEY]: true });
  applyGlass(Boolean(result[STORAGE_KEY]));
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

const observer = new MutationObserver(() => {
  if (document.documentElement.dataset.cugGlass === "true") {
    syncMode();
    labelUI();
    setupDialogDrag();
  }
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ["class", "data-theme", "data-color-scheme"]
});

window.matchMedia?.("(prefers-color-scheme: light)").addEventListener?.("change", syncMode);

sync();

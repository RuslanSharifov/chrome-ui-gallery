/* Gemini Claymorphism — content script.
   Resolves the theme (palette + weather + UI mode), writes the CSS variables that clay.css uses,
   and owns the animated scene. Runs at document_start, so every DOM access tolerates a missing <body>. */
(() => {
  "use strict";

  const root = document.documentElement;
  const THEME_ATTRS = ["class", "data-theme", "data-color-scheme", "theme"];
  const DARK_RE = /(?:^|[\s_-])dark(?:[\s_-]|$)/;
  const LIGHT_RE = /(?:^|[\s_-])light(?:[\s_-]|$)/;
  const lightQuery = matchMedia("(prefers-color-scheme: light)");
  const ROOT_ATTRS = ["data-gug-clay", "data-gug-mode", "data-gug-hover3d", "data-gug-halo"];
  const VARS = ["--gug-bg", "--gug-surface", "--gug-surface-2", "--gug-ink", "--gug-accent", "--gug-radius", "--gug-blur",
    "--gug-a-side", "--gug-a-menu", "--gug-a-comp", "--gug-a-card", "--gug-t-side", "--gug-t-menu", "--gug-t-comp", "--gug-t-card",
    "--gug-sh", "--gug-hl", "--gug-shc", "--gug-hlc", "--gug-rim", "--gug-veil"];

  let settings = GUG.normalize(null);
  let scene = null;
  let geminiDark = false;

  /* ---------- Gemini's own theme (only used when UI mode = "Follow Gemini") ---------- */
  function marker(el) {
    if (!el) return "";
    const text = THEME_ATTRS.map((a) => el.getAttribute(a)).filter(Boolean).join(" ").toLowerCase();
    if (DARK_RE.test(text)) return "dark";
    if (LIGHT_RE.test(text)) return "light";
    return "";
  }
  const detectDark = () => (marker(root) || marker(document.body) || (lightQuery.matches ? "light" : "dark")) === "dark";

  /* ---------- settings -> CSS variables ---------- */
  const set = (k, v) => root.style.setProperty(k, String(v));
  // glass amount t (0..1) -> surface alpha: solid base alpha at 0, almost clear at 1
  const alpha = (base, t) => (base * (1 - t) + 0.07 * t).toFixed(3);

  function writeVars(s, theme) {
    const c = theme.c, dark = theme.dark;
    const t = { side: s.sidebarGlass / 100, menu: s.menuGlass / 100, comp: s.composerGlass / 100, card: s.cardGlass / 100 };
    const panel = s.panelOpacity / 100;
    set("--gug-bg", c.bg);
    set("--gug-surface", c.surface);
    set("--gug-surface-2", c.surface2);
    set("--gug-ink", c.ink);
    set("--gug-accent", c.accent);
    set("--gug-radius", s.radius + "px");
    set("--gug-blur", s.glassBlur + "px");
    set("--gug-a-side", alpha(0.62, t.side));
    set("--gug-a-menu", alpha(0.97, t.menu));
    set("--gug-a-comp", alpha(panel, t.comp));
    set("--gug-a-card", alpha(panel, t.card));
    Object.keys(t).forEach((k) => set("--gug-t-" + k, t[k].toFixed(2)));
    set("--gug-shc", dark ? "0 0 0" : "72 79 91");
    set("--gug-hlc", "255 255 255");
    set("--gug-sh", (dark ? s.shadow / 150 : s.shadow / 400).toFixed(3));
    set("--gug-hl", dark ? "0.07" : (0.48 + s.shadow / 400).toFixed(3));
    set("--gug-rim", (s.rim / 100).toFixed(2));
    set("--gug-veil", (s.chatVeil / 100).toFixed(2));
  }

  function clearAll() {
    ROOT_ATTRS.forEach((a) => root.removeAttribute(a));
    VARS.forEach((v) => root.style.removeProperty(v));
    scene && scene.destroy();
    scene = null;
  }

  function apply(next) {
    settings = GUG.normalize(next);
    if (!settings.enabled) return clearAll();
    geminiDark = detectDark();
    const theme = GUG.resolve(settings, geminiDark);
    writeVars(settings, theme);
    root.setAttribute("data-gug-clay", "true");
    root.setAttribute("data-gug-mode", theme.dark ? "dark" : "light");
    root.setAttribute("data-gug-hover3d", settings.hover3d ? "on" : "off");
    root.setAttribute("data-gug-halo", settings.halo ? "on" : "off");
    if (!scene) scene = GUGCLAY.create(root, settings, { interactive: true, geminiDark });
    else scene.update(settings, geminiDark);
  }

  /* ---------- observers ---------- */
  // Gemini toggles classes on <body> often; only re-apply when the detected theme really changed
  // and the user asked to follow it.
  function onThemeChange() {
    if (!settings.enabled || settings.uiMode !== "gemini") return;
    const d = detectDark();
    if (d !== geminiDark) apply(settings);
  }
  const themeObserver = new MutationObserver(onThemeChange);
  themeObserver.observe(root, { attributes: true, attributeFilter: THEME_ATTRS });
  function watchBody() {
    if (!document.body) return false;
    themeObserver.observe(document.body, { attributes: true, attributeFilter: THEME_ATTRS });
    onThemeChange();
    return true;
  }
  if (!watchBody()) {
    const waiter = new MutationObserver(() => { if (watchBody()) waiter.disconnect(); });
    waiter.observe(root, { childList: true });
  }
  lightQuery.addEventListener && lightQuery.addEventListener("change", onThemeChange);

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes[GUG.STORAGE_KEY]) apply(changes[GUG.STORAGE_KEY].newValue);
  });
  GUG.load().then(apply).catch(console.warn);
})();

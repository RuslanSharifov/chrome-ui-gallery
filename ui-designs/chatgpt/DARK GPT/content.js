/* DARK GPT — content script (document_start).
 * - writes the CSS variables for the current settings
 * - owns the WebGL ambient background and the pointer light
 * - keeps the interactive particle headline attached to ChatGPT's welcome text, however React swaps the DOM
 */
(() => {
  "use strict";

  const root = document.documentElement;
  const VAR = "cug-darkgpt-vars", AMBIENT = "cug-ambient", GLOW = "cug-glow";
  const ATTRS = ["data-cug-darkgpt", "data-cug-mode", "data-cug-hover3d", "data-cug-motion", "data-cug-fx", "data-cug-ptext"];
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

  let settings = CUG.normalize(null);
  let fx = null, fxFailed = false;
  let glow = null, glowRaf = 0, gx = -1e4, gy = -1e4, tx = -1e4, ty = -1e4;
  let ptext = null, textFailed = false, textTimer = 0;

  /* ---------------------------------------------------------------- CSS variables */
  function writeVars() {
    let e = document.getElementById(VAR);
    if (!e) {
      e = document.createElement("style");
      e.id = VAR;
      (document.head || root).appendChild(e);
    }
    e.textContent =
      "html[data-cug-darkgpt]{" +
      "--cug-set-alpha:" + (settings.panelBrightness / 100).toFixed(2) + ";" +
      "--cug-set-veil:" + (settings.chatTint / 100).toFixed(2) + ";" +
      "--cug-set-sat:135%;--cug-set-shine:.65;--cug-set-radius:18px;--cug-set-accent:239 38 58;}";
  }

  /* ---------------------------------------------------------------- ambient WebGL background */
  function ambient() {
    let e = document.getElementById(AMBIENT);
    if (!e) {
      e = document.createElement("div");
      e.id = AMBIENT;
      e.setAttribute("aria-hidden", "true");
      e.appendChild(document.createElement("canvas"));
      for (let i = 0; i < 3; i++) e.appendChild(document.createElement("i"));
      root.appendChild(e);
    }
    return e;
  }
  function syncBackground() {
    const canvas = ambient().querySelector("canvas");
    if (fxFailed) { root.setAttribute("data-cug-fx", "css"); return; }
    if (!fx) {
      fx = CUGFX.create(canvas);
      if (!fx) { fxFailed = true; root.setAttribute("data-cug-fx", "css"); return; }
      fx.start();
    }
    fx.update(CUGFX.paramsFrom(settings, false));
    root.setAttribute("data-cug-fx", "gl");
  }

  /* ---------------------------------------------------------------- pointer light (own element, compositor-only) */
  function glowEl() {
    if (!glow || !glow.isConnected) {
      glow = document.createElement("div");
      glow.id = GLOW;
      glow.setAttribute("aria-hidden", "true");
      root.appendChild(glow);
    }
    return glow;
  }
  function placeGlow() {
    const r = settings.glowRadius, el = glowEl();
    el.style.width = el.style.height = r * 2 + "px";
    el.style.transform = "translate3d(" + (gx - r) + "px," + (gy - r) + "px,0)";
  }
  function glowFrame() {
    glowRaf = 0;
    gx += (tx - gx) * 0.22; gy += (ty - gy) * 0.22;
    placeGlow();
    if (Math.abs(tx - gx) + Math.abs(ty - gy) > 0.5) glowRaf = requestAnimationFrame(glowFrame);
  }
  function onGlowMove(e) {
    if (!settings.enabled || !settings.pointerGlow) return;
    if (gx < -1e3) { gx = e.clientX; gy = e.clientY; }
    tx = e.clientX; ty = e.clientY;
    glowEl().setAttribute("data-on", "");
    if (!glowRaf) glowRaf = requestAnimationFrame(glowFrame);
  }
  const onGlowLeave = () => glow && glow.removeAttribute("data-on");
  window.addEventListener("pointermove", onGlowMove, { passive: true });
  root.addEventListener("mouseleave", onGlowLeave);

  /* ---------------------------------------------------------------- interactive welcome headline */
  const textOpts = () => ({
    effect: settings.textEffect,
    radius: settings.textRadius,
    strength: settings.textStrength,
    density: settings.textDensity,
    scale: settings.textScale,
    reduced: reducedMotion.matches,
  });

  // ChatGPT wraps the greeting in an element with view-transition-name: var(--vt-splash-screen-headline)
  function findHeadline() {
    const hs = document.getElementsByTagName("h1");
    for (let i = 0; i < hs.length; i++) {
      if (hs[i].closest('[style*="vt-splash-screen-headline"]')) return hs[i];
    }
    return null;
  }
  function checkText() {
    textTimer = 0;
    const want = settings.enabled && settings.textFx ? findHeadline() : null;
    if (ptext && (ptext.host !== want || !ptext.host.isConnected)) { ptext.destroy(); ptext = null; }
    if (!ptext && want && !textFailed) {
      ptext = CUGTEXT.attach(want, textOpts);
      if (!ptext) { textFailed = true; root.setAttribute("data-cug-ptext", "off"); }
    }
  }
  const scheduleText = () => { if (!textTimer) textTimer = setTimeout(checkText, 30); };
  new MutationObserver(scheduleText).observe(root, { childList: true, subtree: true });
  document.addEventListener("DOMContentLoaded", scheduleText);

  /* ---------------------------------------------------------------- apply / teardown */
  function teardown() {
    ATTRS.forEach((a) => root.removeAttribute(a));
    fx && fx.destroy(); fx = null;
    ptext && ptext.destroy(); ptext = null;
    ["#" + VAR, "#" + AMBIENT, "#" + GLOW].forEach((s) => { const n = document.querySelector(s); n && n.remove(); });
    glow = null; glowRaf = 0; gx = gy = tx = ty = -1e4;
  }

  function apply(next) {
    settings = CUG.normalize(next);
    if (!settings.enabled) return teardown();
    textFailed = false;
    writeVars();
    root.setAttribute("data-cug-darkgpt", "true");
    root.setAttribute("data-cug-mode", "dark");
    root.setAttribute("data-cug-hover3d", settings.hover3d ? "on" : "off");
    root.setAttribute("data-cug-motion", "on");
    root.setAttribute("data-cug-ptext", settings.textFx ? "on" : "off");
    syncBackground();
    if (settings.pointerGlow) { if (gx > -1e3) placeGlow(); } else glow && glow.removeAttribute("data-on");
    if (ptext) ptext.update(textOpts());
    checkText();
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes[CUG.STORAGE_KEY]) apply(changes[CUG.STORAGE_KEY].newValue);
  });
  CUG.load().then(apply).catch((err) => console.warn("[DARK GPT]", err));
})();

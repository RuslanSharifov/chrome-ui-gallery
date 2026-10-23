/* ChatGPT Glassmorphism v2 — content script.
 * CSS is delivered by the manifest (glass.css) and is gated by html[data-cug-glass].
 * This script only: reads settings, toggles attributes, tracks the page's light/dark mode,
 * injects the ambient background layer and implements draggable dialogs.
 */
(() => {
  "use strict";

  const root = document.documentElement;
  const VARS_ID = "cug-vars";
  const AMBIENT_ID = "cug-ambient";
  const DRAG_ZONE = 72; // px from the dialog's top edge that act as a drag handle

  let settings = CUG.normalize(null);
  let mode = "";

  /* ---------- light / dark detection (follows ChatGPT's own theme) ---------- */
  function detectMode() {
    const cls = root.classList;
    if (cls.contains("light")) return "light";
    if (cls.contains("dark")) return "dark";
    const attr = (root.getAttribute("data-theme") || root.getAttribute("data-color-scheme") || "").toLowerCase();
    if (attr.includes("light")) return "light";
    if (attr.includes("dark")) return "dark";
    const scheme = (root.style.colorScheme || "").toLowerCase();
    if (scheme === "light" || scheme === "dark") return scheme;
    return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  function syncMode() {
    if (!settings.enabled) return;
    const next = detectMode();
    if (next !== mode) {
      mode = next;
      root.setAttribute("data-cug-mode", mode);
      if (fx) fx.update(CUGFX.paramsFrom(settings, mode === "light"));
    }
  }

  /* ---------- settings -> CSS variables (separate <style>, so no attribute feedback loop) ---------- */
  function writeVars() {
    let el = document.getElementById(VARS_ID);
    if (!el) {
      el = document.createElement("style");
      el.id = VARS_ID;
      (document.head || root).appendChild(el);
    }
    const a = CUG.ACCENTS[settings.accent];
    el.textContent =
      `html[data-cug-glass]{--cug-set-blur:${settings.blur}px;--cug-set-alpha:${(settings.opacity / 100).toFixed(2)};` +
      `--cug-set-veil:${(settings.veil / 100).toFixed(2)};--cug-set-sat:${settings.saturation}%;` +
      `--cug-set-shine:${(settings.shine / 100).toFixed(2)};--cug-set-radius:${settings.radius}px;` +
      `--cug-set-accent-dark:${a.dark};--cug-set-accent-light:${a.light};}`;
  }

  /* ---------- WebGL light background ---------- */
  let fx = null;
  let fxFailed = false;

  function ensureAmbient() {
    let el = document.getElementById(AMBIENT_ID);
    if (!el) {
      el = document.createElement("div");
      el.id = AMBIENT_ID;
      el.setAttribute("aria-hidden", "true");
      el.innerHTML = "<canvas></canvas><i></i><i></i><i></i>"; // canvas + CSS-blob fallback
      root.appendChild(el); // child of <html>, outside React's tree
    }
    return el;
  }

  function syncFx() {
    const canvas = ensureAmbient().querySelector("canvas");
    const wantFx = settings.enabled && settings.fxOn && !fxFailed;
    if (!wantFx) {
      fx?.destroy(); fx = null;
      root.setAttribute("data-cug-fx", "css");
      return;
    }
    if (!fx) {
      fx = CUGFX.create(canvas);
      if (!fx) { fxFailed = true; root.setAttribute("data-cug-fx", "css"); return; }
      fx.start();
    }
    fx.update(CUGFX.paramsFrom(settings, mode === "light"));
    root.setAttribute("data-cug-fx", "gl");
  }

  function resetDialogs() {
    document.querySelectorAll("[data-cug-dragged]").forEach(clearDialogPosition);
  }

  function apply(next) {
    settings = next;
    if (!settings.enabled) {
      ["data-cug-glass", "data-cug-mode", "data-cug-hover3d", "data-cug-motion", "data-cug-drag", "data-cug-fx"].forEach((n) => root.removeAttribute(n));
      mode = "";
      fx?.destroy(); fx = null;
      document.getElementById(VARS_ID)?.remove();
      document.getElementById(AMBIENT_ID)?.remove();
      resetDialogs();
      return;
    }
    writeVars();
    root.setAttribute("data-cug-glass", "true");
    root.setAttribute("data-cug-hover3d", settings.hover3d ? "on" : "off");
    root.setAttribute("data-cug-motion", settings.speed > 0 ? "on" : "off"); // CSS-blob fallback
    root.setAttribute("data-cug-drag", settings.dragDialogs ? "on" : "off");
    mode = "";
    syncMode();
    syncFx();
    if (!settings.dragDialogs) resetDialogs();
  }

  /* ---------- draggable dialogs (one delegated listener, no per-node setup) ---------- */
  const INTERACTIVE = 'button, a, input, textarea, select, label, [role="button"], [role="tab"], [role="switch"], [role="menuitem"], [contenteditable="true"]';
  let drag = null;

  function clearDialogPosition(dialog) {
    ["position", "left", "top", "margin", "transform", "z-index"].forEach((p) => dialog.style.removeProperty(p));
    dialog.removeAttribute("data-cug-dragged");
  }

  function dialogFromEvent(e) {
    if (!settings.enabled || !settings.dragDialogs || e.button !== 0) return null;
    const dialog = e.target instanceof Element ? e.target.closest('[role="dialog"]') : null;
    if (!dialog) return null;
    const rect = dialog.getBoundingClientRect();
    const fullscreen = rect.width > innerWidth * 0.97 && rect.height > innerHeight * 0.97;
    if (fullscreen || e.clientY - rect.top > DRAG_ZONE) return null;
    if (e.target.closest(INTERACTIVE)) return null;
    return { dialog, rect };
  }

  document.addEventListener("pointerdown", (e) => {
    const hit = dialogFromEvent(e);
    if (!hit) return;
    const { dialog, rect } = hit;
    drag = { dialog, dx: e.clientX - rect.left, dy: e.clientY - rect.top, id: e.pointerId };
    const set = (k, v) => dialog.style.setProperty(k, v, "important");
    set("position", "fixed"); set("left", rect.left + "px"); set("top", rect.top + "px");
    set("margin", "0"); set("transform", "none"); set("z-index", "2147483000");
    dialog.setAttribute("data-cug-dragged", "true");
    document.body?.setAttribute("data-cug-dragging", "");
    e.preventDefault();
  }, true);

  document.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const { dialog } = drag;
    const maxL = Math.max(8, innerWidth - dialog.offsetWidth - 8);
    const maxT = Math.max(8, innerHeight - dialog.offsetHeight - 8);
    dialog.style.setProperty("left", Math.min(maxL, Math.max(8, e.clientX - drag.dx)) + "px", "important");
    dialog.style.setProperty("top", Math.min(maxT, Math.max(8, e.clientY - drag.dy)) + "px", "important");
  }, true);

  const endDrag = () => { drag = null; document.body?.removeAttribute("data-cug-dragging"); };
  document.addEventListener("pointerup", endDrag, true);
  document.addEventListener("pointercancel", endDrag, true);

  // Double-click the top area to snap the dialog back to its native position
  document.addEventListener("dblclick", (e) => {
    const hit = dialogFromEvent(e);
    if (hit && hit.dialog.hasAttribute("data-cug-dragged")) clearDialogPosition(hit.dialog);
  }, true);

  /* ---------- wiring ---------- */
  // Cheap observer: only <html> attributes (theme switches), never the subtree.
  new MutationObserver(syncMode).observe(root, { attributes: true, attributeFilter: ["class", "data-theme", "data-color-scheme", "style"] });
  window.matchMedia?.("(prefers-color-scheme: light)").addEventListener?.("change", syncMode);

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    if (changes[CUG.STORAGE_KEY]) apply(CUG.normalize(changes[CUG.STORAGE_KEY].newValue));
  });

  CUG.load().then(apply).catch((err) => console.warn("[glassmorphism] could not load settings", err));
})();

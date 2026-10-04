/* Gemini Glassmorphism — content script.
   Responsibilities: theme detection, settings sync, ambient-light lifecycle, dialog dragging.
   Runs at document_start, so every DOM access must tolerate a missing <head>/<body>. */
(() => {
  "use strict";

  const root = document.documentElement;
  const VARS_ID = "gug-vars";
  const AMBIENT_ID = "gug-ambient";
  const ROOT_ATTRS = [
    "data-gug-glass",
    "data-gug-mode",
    "data-gug-hover3d",
    "data-gug-fx",
    "data-gug-drag",
  ];
  const THEME_ATTRS = ["class", "data-theme", "data-color-scheme", "theme"];
  const DARK_RE = /(?:^|[\s_-])dark(?:[\s_-]|$)/;
  const LIGHT_RE = /(?:^|[\s_-])light(?:[\s_-]|$)/;
  const lightQuery = matchMedia("(prefers-color-scheme: light)");
  const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");

  let settings = GUG.normalize(null);
  let mode = "";
  let fx = null;
  let fxFailed = false;

  /* ---------- theme detection ---------- */
  // Gemini marks its theme on <body> (e.g. "dark-theme"); some builds use <html>. Check both,
  // then fall back to the OS preference.
  function themeMarker(el) {
    if (!el) return "";
    const text = THEME_ATTRS.map((a) => el.getAttribute(a))
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (DARK_RE.test(text)) return "dark";
    if (LIGHT_RE.test(text)) return "light";
    return "";
  }
  function detectMode() {
    return (
      themeMarker(root) ||
      themeMarker(document.body) ||
      (lightQuery.matches ? "light" : "dark")
    );
  }

  /* ---------- settings -> CSS variables ---------- */
  function writeVars() {
    let el = document.getElementById(VARS_ID);
    if (!el) {
      el = document.createElement("style");
      el.id = VARS_ID;
      (document.head || root).appendChild(el);
    }
    const a = GUG.ACCENTS[settings.accent];
    el.textContent =
      "html[data-gug-glass]{" +
      "--gug-set-blur:" +
      settings.blur +
      "px;" +
      "--gug-set-alpha:" +
      (settings.opacity / 100).toFixed(2) +
      ";" +
      "--gug-set-sat:" +
      settings.saturation +
      "%;" +
      "--gug-set-veil:" +
      (settings.veil / 100).toFixed(2) +
      ";" +
      "--gug-set-shine:" +
      (settings.shine / 100).toFixed(2) +
      ";" +
      "--gug-set-radius:" +
      settings.radius +
      "px;" +
      "--gug-set-accent-dark:" +
      a.dark +
      ";" +
      "--gug-set-accent-light:" +
      a.light +
      ";}";
  }

  function syncMode() {
    if (!settings.enabled) return;
    const next = detectMode();
    // Also compare the attribute: it is removed when the theme is disabled, so `mode` alone can go stale.
    if (next === mode && root.getAttribute("data-gug-mode") === mode) return;
    mode = next;
    root.setAttribute("data-gug-mode", mode);
    fx?.update(GUGFX.paramsFrom(settings, mode === "light"));
  }

  /* ---------- ambient light layer ---------- */
  // Built with createElement (not innerHTML) so it also works under Trusted Types.
  function ensureAmbient() {
    let el = document.getElementById(AMBIENT_ID);
    if (!el) {
      el = document.createElement("div");
      el.id = AMBIENT_ID;
      el.setAttribute("aria-hidden", "true");
      el.appendChild(document.createElement("canvas"));
      for (let i = 0; i < 3; i++) el.appendChild(document.createElement("i"));
      root.appendChild(el);
    }
    return el;
  }

  function cssFallback() {
    fx?.destroy();
    fx = null;
    root.setAttribute("data-gug-fx", "css");
  }

  function syncFx() {
    const canvas = ensureAmbient().querySelector("canvas");
    if (!settings.enabled || !settings.fxOn || fxFailed) return cssFallback();
    if (!fx) {
      fx = GUGFX.create(canvas, () => {
        fxFailed = true;
        cssFallback();
      });
      if (!fx) {
        fxFailed = true;
        return cssFallback();
      }
      fx.start();
    }
    fx.update(GUGFX.paramsFrom(settings, mode === "light"));
    root.setAttribute("data-gug-fx", "gl");
  }

  function clearAll() {
    fx?.destroy();
    fx = null;
    document.getElementById(VARS_ID)?.remove();
    document.getElementById(AMBIENT_ID)?.remove();
  }

  function apply(next) {
    settings = next;
    if (!settings.enabled) {
      ROOT_ATTRS.forEach((a) => root.removeAttribute(a));
      mode = "";
      clearAll();
      return;
    }
    writeVars();
    root.setAttribute("data-gug-glass", "true");
    root.setAttribute("data-gug-hover3d", settings.hover3d ? "on" : "off");
    root.setAttribute("data-gug-drag", settings.dragDialogs ? "on" : "off");
    syncMode();
    syncFx();
  }

  /* ---------- draggable dialogs ---------- */
  let drag = null;
  const INTERACTIVE =
    'button,a,input,textarea,select,label,[role="button"],[contenteditable="true"]';

  function dialogHit(e) {
    if (!settings.enabled || !settings.dragDialogs || e.button !== 0)
      return null;
    if (!(e.target instanceof Element)) return null;
    // Material dialogs: the draggable card is the surface, not the full-screen role="dialog" wrapper.
    const d =
      e.target.closest(".mdc-dialog__surface") ||
      e.target.closest('[role="dialog"]');
    if (!d) return null;
    const r = d.getBoundingClientRect();
    if (r.width > innerWidth * 0.97 && r.height > innerHeight * 0.97)
      return null;
    if (e.clientY - r.top > 72) return null; // only the header strip is a handle
    if (e.target.closest(INTERACTIVE)) return null;
    return { d, r };
  }

  document.addEventListener(
    "pointerdown",
    (e) => {
      const hit = dialogHit(e);
      if (!hit) return;
      drag = {
        d: hit.d,
        id: e.pointerId,
        dx: e.clientX - hit.r.left,
        dy: e.clientY - hit.r.top,
      };
      const set = (k, v) => hit.d.style.setProperty(k, v, "important");
      set("position", "fixed");
      set("left", hit.r.left + "px");
      set("top", hit.r.top + "px");
      set("margin", "0");
      set("transform", "none");
      set("z-index", "2147483000");
      e.preventDefault();
    },
    true,
  );

  document.addEventListener(
    "pointermove",
    (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag.d;
      const left = Math.min(
        innerWidth - d.offsetWidth - 8,
        Math.max(8, e.clientX - drag.dx),
      );
      const top = Math.min(
        innerHeight - d.offsetHeight - 8,
        Math.max(8, e.clientY - drag.dy),
      );
      d.style.setProperty("left", left + "px", "important");
      d.style.setProperty("top", top + "px", "important");
    },
    true,
  );

  const endDrag = () => {
    drag = null;
  };
  document.addEventListener("pointerup", endDrag, true);
  document.addEventListener("pointercancel", endDrag, true);

  /* ---------- observers & lifecycle ---------- */
  const themeObserver = new MutationObserver(syncMode);
  themeObserver.observe(root, {
    attributes: true,
    attributeFilter: THEME_ATTRS,
  });

  // <body> does not exist yet at document_start: attach to it as soon as it is created.
  function watchBody() {
    if (!document.body) return false;
    themeObserver.observe(document.body, {
      attributes: true,
      attributeFilter: THEME_ATTRS,
    });
    syncMode();
    return true;
  }
  if (!watchBody()) {
    const waiter = new MutationObserver(() => {
      if (watchBody()) waiter.disconnect();
    });
    waiter.observe(root, { childList: true });
  }

  lightQuery.addEventListener?.("change", syncMode);
  motionQuery.addEventListener?.("change", () =>
    fx?.update(GUGFX.paramsFrom(settings, mode === "light")),
  );

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes[GUG.STORAGE_KEY])
      apply(GUG.normalize(changes[GUG.STORAGE_KEY].newValue));
  });

  GUG.load().then(apply).catch(console.warn);
})();

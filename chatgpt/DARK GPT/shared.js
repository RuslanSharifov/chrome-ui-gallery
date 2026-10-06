/* DARK GPT — shared settings (content script + popup). Same storage key as v1.0, new keys fall back to defaults. */
(function (g) {
  "use strict";

  const STORAGE_KEY = "darkGptSettings";

  const DEFAULTS = Object.freeze({
    enabled: true,
    // surfaces & background
    panelBrightness: 50,      // panel opacity (sidebar, composer, menus)
    backgroundBrightness: 34, // red ambient light (WebGL). No longer changes any surface.
    chatTint: 14,             // dark veil over the chat area, independent from the glow
    bgQuality: "medium",      // low | medium | high
    hover3d: true,
    // pointer light
    pointerGlow: true,
    glowRadius: 260,
    // welcome headline as interactive particles
    textFx: true,
    textEffect: "repel",      // repel | attract | swirl
    textRadius: 120,
    textStrength: 60,
    textDensity: 60,
    textScale: 120,
  });

  const EFFECTS = Object.freeze({ repel: "Repel", attract: "Attract", swirl: "Swirl" });
  const QUALITIES = Object.freeze({ low: "Low", medium: "Medium", high: "High" });

  const clamp = (n, a, b, f) => {
    n = Number(n);
    return Number.isFinite(n) ? Math.min(b, Math.max(a, n)) : f;
  };
  const pick = (v, table, f) => (Object.prototype.hasOwnProperty.call(table, v) ? v : f);

  function normalize(raw) {
    const s = Object.assign({}, DEFAULTS, raw && typeof raw === "object" ? raw : {});
    const D = DEFAULTS;
    return {
      enabled: Boolean(s.enabled),
      panelBrightness: clamp(s.panelBrightness, 15, 90, D.panelBrightness),
      backgroundBrightness: clamp(s.backgroundBrightness, 0, 80, D.backgroundBrightness),
      chatTint: clamp(s.chatTint, 0, 60, D.chatTint),
      bgQuality: pick(s.bgQuality, QUALITIES, D.bgQuality),
      hover3d: Boolean(s.hover3d),
      pointerGlow: Boolean(s.pointerGlow),
      glowRadius: clamp(s.glowRadius, 80, 520, D.glowRadius),
      textFx: Boolean(s.textFx),
      textEffect: pick(s.textEffect, EFFECTS, D.textEffect),
      textRadius: clamp(s.textRadius, 50, 260, D.textRadius),
      textStrength: clamp(s.textStrength, 10, 100, D.textStrength),
      textDensity: clamp(s.textDensity, 20, 100, D.textDensity),
      textScale: clamp(s.textScale, 80, 200, D.textScale),
    };
  }

  async function load() {
    const d = await chrome.storage.local.get(STORAGE_KEY);
    return normalize(d[STORAGE_KEY]);
  }
  async function save(s) {
    await chrome.storage.local.set({ [STORAGE_KEY]: normalize(s) });
  }

  g.CUG = { STORAGE_KEY, DEFAULTS, EFFECTS, QUALITIES, normalize, load, save };
})(globalThis);

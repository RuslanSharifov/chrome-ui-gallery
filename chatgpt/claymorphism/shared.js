/* Shared by popup and content script: defaults, palettes, presets, storage helpers. */
(function (global) {
  "use strict";

  const STORAGE_KEY = "cugSettings";

  const DEFAULTS = Object.freeze({
    enabled: true,       // master switch
    accent: "gold",      // key of ACCENTS

    // glass
    blur: 28,            // px
    opacity: 52,         // % panel opacity (sidebar, composer, menus, dialogs)
    veil: 12,            // % opacity of the big chat area (0 = fully see-through)
    saturation: 160,     // % backdrop saturation
    shine: 100,          // % edge highlight strength
    radius: 18,          // px base corner radius

    // light effects (WebGL background)
    fxOn: true,
    palette: "ocean",    // key of PALETTES
    intensity: 60,       // % overall brightness of the lights
    scale: 100,          // % size of the light pattern
    speed: 100,          // % animation speed (0 = frozen)
    caustics: 70,        // % underwater light net
    rays: 50,            // % light shafts from above
    neon: 60,            // % neon blobs + ribbons
    mouseGlow: true,     // light that follows the cursor
    quality: "medium",   // low | medium | high

    // behaviour
    hover3d: true,
    dragDialogs: true
  });

  // "r g b" triplets; bright variant for dark UI, deeper for light UI
  const ACCENTS = Object.freeze({
    gold:    { label: "Gold",    dark: "242 199 109", light: "166 107 0"  },
    purple:  { label: "Purple",  dark: "181 167 255", light: "103 88 201" },
    cyan:    { label: "Cyan",    dark: "125 220 255", light: "14 116 144" },
    rose:    { label: "Rose",    dark: "255 143 177", light: "190 24 93"  },
    emerald: { label: "Emerald", dark: "110 231 183", light: "4 120 87"   }
  });

  // three linear 0..1 colours per palette (null => derived from the accent colour)
  const PALETTES = Object.freeze({
    ocean:   { label: "Ocean",     colors: [[0.10, 0.72, 1.00], [0.00, 0.95, 0.80], [0.32, 0.42, 1.00]] },
    neon:    { label: "Cyberpunk", colors: [[1.00, 0.10, 0.68], [0.10, 0.90, 1.00], [0.56, 0.22, 1.00]] },
    aurora:  { label: "Aurora",    colors: [[0.20, 1.00, 0.55], [0.55, 0.35, 1.00], [0.10, 0.85, 1.00]] },
    sunset:  { label: "Sunset",    colors: [[1.00, 0.50, 0.20], [1.00, 0.25, 0.55], [0.60, 0.30, 1.00]] },
    accent:  { label: "Accent",    colors: null }
  });

  const PRESETS = Object.freeze({
    underwater: { label: "Underwater", patch: { fxOn: true, palette: "ocean",  intensity: 62, scale: 100, speed: 90,  caustics: 90, rays: 70, neon: 25, mouseGlow: true, blur: 30, opacity: 48, veil: 10 } },
    cyberpunk:  { label: "Cyberpunk",  patch: { fxOn: true, palette: "neon",   intensity: 75, scale: 90,  speed: 130, caustics: 30, rays: 25, neon: 95, mouseGlow: true, blur: 26, opacity: 50, veil: 12 } },
    aurora:     { label: "Aurora",     patch: { fxOn: true, palette: "aurora", intensity: 60, scale: 120, speed: 70,  caustics: 45, rays: 60, neon: 70, mouseGlow: true, blur: 32, opacity: 52, veil: 12 } },
    calm:       { label: "Calm",       patch: { fxOn: true, palette: "accent", intensity: 35, scale: 140, speed: 45,  caustics: 40, rays: 30, neon: 35, mouseGlow: false, blur: 34, opacity: 62, veil: 22 } },
    minimal:    { label: "Minimal",    patch: { fxOn: false, blur: 24, opacity: 66, veil: 24 } }
  });

  function clamp(n, min, max, fallback) {
    n = Number(n);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
  }
  const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

  /** Validate untrusted/legacy stored data and fill in defaults. */
  function normalize(raw) {
    const s = Object.assign({}, DEFAULTS, raw && typeof raw === "object" ? raw : {});
    const D = DEFAULTS;
    return {
      enabled: Boolean(s.enabled),
      accent: has(ACCENTS, s.accent) ? s.accent : D.accent,
      blur: clamp(s.blur, 8, 60, D.blur),
      opacity: clamp(s.opacity, 10, 92, D.opacity),
      veil: clamp(s.veil, 0, 60, D.veil),
      saturation: clamp(s.saturation, 100, 240, D.saturation),
      shine: clamp(s.shine, 0, 200, D.shine),
      radius: clamp(s.radius, 6, 36, D.radius),
      fxOn: Boolean(s.fxOn),
      palette: has(PALETTES, s.palette) ? s.palette : D.palette,
      intensity: clamp(s.intensity, 0, 100, D.intensity),
      scale: clamp(s.scale, 40, 240, D.scale),
      speed: clamp(s.speed, 0, 250, D.speed),
      caustics: clamp(s.caustics, 0, 100, D.caustics),
      rays: clamp(s.rays, 0, 100, D.rays),
      neon: clamp(s.neon, 0, 100, D.neon),
      mouseGlow: Boolean(s.mouseGlow),
      quality: ["low", "medium", "high"].includes(s.quality) ? s.quality : D.quality,
      hover3d: Boolean(s.hover3d),
      dragDialogs: Boolean(s.dragDialogs)
    };
  }

  /* ---- colour helpers: derive a 3-colour palette from the accent ---- */
  function rotateHue([r, g, b], deg) {
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    let h = 0;
    if (d) {
      if (max === r) h = ((g - b) / d) % 6; else if (max === g) h = (b - r) / d + 2; else h = (r - g) / d + 4;
    }
    h = ((h * 60 + deg) % 360 + 360) % 360;
    const l = (max + min) / 2, s = d ? d / (1 - Math.abs(2 * l - 1)) : 0;
    const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
    const [r1, g1, b1] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
    return [r1 + m, g1 + m, b1 + m];
  }

  /** Returns [[r,g,b] x3] in 0..1 for the chosen palette. */
  function paletteColors(settings) {
    const p = PALETTES[settings.palette];
    if (p && p.colors) return p.colors;
    const base = ACCENTS[settings.accent].dark.split(" ").map((v) => Number(v) / 255);
    return [base, rotateHue(base, 150), rotateHue(base, 230)];
  }

  async function load() {
    const data = await chrome.storage.local.get([STORAGE_KEY, "glassEnabled"]);
    const stored = data[STORAGE_KEY] ? Object.assign({}, data[STORAGE_KEY]) : {};
    if (stored.enabled === undefined && typeof data.glassEnabled === "boolean") stored.enabled = data.glassEnabled; // v1 key
    if (stored.motion === false && stored.speed === undefined) stored.speed = 0; // v2.0 key
    return normalize(stored);
  }

  async function save(settings) {
    await chrome.storage.local.set({ [STORAGE_KEY]: normalize(settings) });
  }

  global.CUG = { STORAGE_KEY, DEFAULTS, ACCENTS, PALETTES, PRESETS, normalize, paletteColors, load, save };
})(globalThis);

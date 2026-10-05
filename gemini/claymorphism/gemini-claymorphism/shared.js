/* Gemini Claymorphism — shared settings, palettes, weather definitions, presets and theme resolver.
   Loaded by both the content script and the popup. */
(function (global) {
  "use strict";

  const STORAGE_KEY = "geminiClaySettings";

  /* ---------- surface styles: clay <-> glass ---------- */
  // Transparency is 0 (solid clay) .. 100 (almost clear glass), per area.
  const SURFACES = Object.freeze({
    clay:   { sidebarGlass: 0,  menuGlass: 0,  composerGlass: 0,  cardGlass: 0,  chatVeil: 0,  glassBlur: 12 },
    hybrid: { sidebarGlass: 45, menuGlass: 55, composerGlass: 35, cardGlass: 30, chatVeil: 8,  glassBlur: 18 },
    glass:  { sidebarGlass: 80, menuGlass: 85, composerGlass: 70, cardGlass: 62, chatVeil: 12, glassBlur: 26 },
  });
  const SURFACE_LABELS = Object.freeze({ clay: "Clay", hybrid: "Clay + Glass", glass: "Glass" });
  const SURFACE_KEYS = Object.keys(SURFACES.clay);

  const BASE = Object.freeze({
    weather: "cloudy", weatherIntensity: 50, wind: 15, lightning: 55, skyTint: 50,
    cloudTone: "auto", cloudType: "puffy",
    cloudSpeed: 44, cloudSize: 100, cloudCount: 6, cloudOpacity: 78, cloudDepth: 72,
    panelOpacity: 78, shadow: 46, radius: 28, rim: 50,
    ...SURFACES.clay,
  });

  const DEFAULTS = Object.freeze({
    ...BASE,
    enabled: true, palette: "sky", uiMode: "auto",
    parallax: true, hover3d: true, halo: true, quality: "medium",
  });

  /* ---------- palettes (light; a dark variant is derived on demand) ---------- */
  const PALETTES = Object.freeze({
    sky:      { label: "Sky",      bg: "232 239 247", surface: "244 247 251", surface2: "224 232 242", ink: "54 64 78",  accent: "104 151 190", cloud: ["247 249 252", "229 236 244", "203 215 229"] },
    lavender: { label: "Lavender", bg: "239 236 247", surface: "248 246 252", surface2: "229 224 241", ink: "68 61 82",  accent: "139 120 177", cloud: ["252 250 255", "236 230 247", "210 201 228"] },
    peach:    { label: "Peach",    bg: "247 238 231", surface: "253 248 244", surface2: "239 225 215", ink: "86 67 58",  accent: "190 128 103", cloud: ["255 252 248", "244 231 221", "221 201 190"] },
    mint:     { label: "Mint",     bg: "229 242 237", surface: "245 251 248", surface2: "219 234 227", ink: "53 72 65",  accent: "91 148 128",  cloud: ["249 253 251", "225 239 233", "197 218 209"] },
    rose:     { label: "Rose",     bg: "247 234 238", surface: "253 246 248", surface2: "239 221 227", ink: "88 60 70",  accent: "194 111 138", cloud: ["255 250 252", "245 228 234", "222 199 208"] },
    dusk:     { label: "Dusk",     bg: "29 34 45",    surface: "47 53 66",    surface2: "37 43 55",    ink: "238 241 247", accent: "157 181 211", cloud: ["112 124 143", "82 94 113", "58 69 87"], dark: true },
  });

  /* ---------- weather ---------- */
  // kind: what the canvas draws. sky: [top, bottom] gradient (light version). patch: recommended cloud values.
  const WEATHER = Object.freeze({
    clear:  { label: "Sunny",  icon: "\u2600\uFE0F", kind: "none", tone: "bright",  dark: false, fog: "255 255 255", sky: ["96 165 232", "214 234 250"],  patch: { cloudCount: 3, cloudOpacity: 72, weatherIntensity: 55 } },
    cloudy: { label: "Cloudy", icon: "\u2601\uFE0F", kind: "none", tone: "neutral", dark: false, fog: "236 240 244", sky: ["176 192 210", "226 233 241"], patch: { cloudCount: 6, cloudOpacity: 78, weatherIntensity: 50 } },
    rain:   { label: "Rain",   icon: "\uD83C\uDF27\uFE0F", kind: "rain", tone: "gray", dark: false, fog: "200 210 222", sky: ["112 128 148", "176 188 201"], patch: { cloudCount: 7, cloudOpacity: 92, weatherIntensity: 55, wind: 18 } },
    storm:  { label: "Storm",  icon: "\u26C8\uFE0F", kind: "rain", tone: "dark",   dark: true,  fog: "120 130 150", sky: ["46 54 74", "98 108 130"],     patch: { cloudCount: 8, cloudOpacity: 96, weatherIntensity: 78, wind: 40, lightning: 60 } },
    snow:   { label: "Snow",   icon: "\u2744\uFE0F", kind: "snow", tone: "bright", dark: false, fog: "240 244 250", sky: ["196 208 226", "240 244 250"], patch: { cloudCount: 6, cloudOpacity: 86, weatherIntensity: 45, wind: 10 } },
    fog:    { label: "Fog",    icon: "\uD83C\uDF2B\uFE0F", kind: "none", tone: "gray", dark: false, fog: "232 236 240", sky: ["204 210 218", "233 236 240"], patch: { cloudCount: 5, cloudOpacity: 60, weatherIntensity: 60 } },
    night:  { label: "Night",  icon: "\uD83C\uDF19", kind: "stars", tone: "night", dark: true,  fog: "120 130 160", sky: ["12 18 42", "44 54 94"],       patch: { cloudCount: 4, cloudOpacity: 55, weatherIntensity: 60 } },
  });

  const TONES = Object.freeze({
    bright:  { to: [255, 255, 255], k: 0.30 },
    neutral: { to: [255, 255, 255], k: 0 },
    gray:    { to: [148, 158, 172], k: 0.50 },
    dark:    { to: [70, 78, 94],    k: 0.65 },
    night:   { to: [44, 52, 80],    k: 0.72 },
  });
  const TONE_LABELS = Object.freeze({ auto: "Auto", bright: "Bright", neutral: "Neutral", gray: "Overcast", dark: "Stormy" });
  const CLOUD_TYPES = Object.freeze({ puffy: "Puffy", flat: "Flat", wispy: "Wispy" });
  const UI_MODES = Object.freeze({ auto: "Auto", gemini: "Follow Gemini", light: "Light", dark: "Dark" });
  const QUALITIES = Object.freeze({ low: "Low", medium: "Medium", high: "High" });

  /* ---------- presets (each one is a complete look: palette + weather + surface style) ---------- */
  const P = (o) => Object.freeze({ ...BASE, ...o });
  const PRESETS = Object.freeze({
    cloudscape: { label: "Cloudscape", patch: P({ palette: "sky", skyTint: 45 }) },
    sunny:      { label: "Sunny day",  patch: P({ palette: "peach", weather: "clear", cloudCount: 3, cloudOpacity: 72, skyTint: 60, ...SURFACES.hybrid }) },
    rainy:      { label: "Rainy",      patch: P({ palette: "sky", weather: "rain", cloudCount: 7, cloudOpacity: 92, weatherIntensity: 55, wind: 18, cloudSpeed: 40, skyTint: 70, ...SURFACES.hybrid }) },
    storm:      { label: "Thunderstorm", patch: P({ palette: "dusk", weather: "storm", cloudCount: 8, cloudOpacity: 96, weatherIntensity: 75, wind: 40, lightning: 60, skyTint: 75, ...SURFACES.glass }) },
    snow:       { label: "Snowfall",   patch: P({ palette: "lavender", weather: "snow", cloudCount: 6, cloudOpacity: 86, weatherIntensity: 45, wind: 10, skyTint: 60, ...SURFACES.hybrid }) },
    night:      { label: "Starry night", patch: P({ palette: "dusk", weather: "night", cloudCount: 4, cloudOpacity: 55, weatherIntensity: 60, skyTint: 80, ...SURFACES.glass }) },
    fog:        { label: "Foggy",      patch: P({ palette: "mint", weather: "fog", cloudCount: 5, cloudOpacity: 60, weatherIntensity: 60, skyTint: 55 }) },
    calm:       { label: "Calm",       patch: P({ palette: "sky", cloudSpeed: 18, cloudSize: 132, cloudCount: 4, cloudOpacity: 58, cloudDepth: 54, panelOpacity: 84, shadow: 34, radius: 32 }) },
  });

  /* ---------- validation ---------- */
  const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const clamp = (v, min, max, f) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : f;
  };
  const pick = (v, table, f) => (has(table, v) ? v : f);

  function normalize(raw) {
    const s = Object.assign({}, DEFAULTS, raw && typeof raw === "object" ? raw : {});
    const D = DEFAULTS;
    return {
      enabled: Boolean(s.enabled),
      palette: pick(s.palette, PALETTES, D.palette),
      uiMode: pick(s.uiMode, UI_MODES, D.uiMode),
      weather: pick(s.weather, WEATHER, D.weather),
      weatherIntensity: clamp(s.weatherIntensity, 0, 100, D.weatherIntensity),
      wind: clamp(s.wind, -100, 100, D.wind),
      lightning: clamp(s.lightning, 0, 100, D.lightning),
      skyTint: clamp(s.skyTint, 0, 100, D.skyTint),
      cloudTone: pick(s.cloudTone, TONE_LABELS, D.cloudTone),
      cloudType: pick(s.cloudType, CLOUD_TYPES, D.cloudType),
      cloudSpeed: clamp(s.cloudSpeed, 0, 100, D.cloudSpeed),
      cloudSize: clamp(s.cloudSize, 55, 180, D.cloudSize),
      cloudCount: Math.round(clamp(s.cloudCount, 1, 9, D.cloudCount)),
      cloudOpacity: clamp(s.cloudOpacity, 20, 100, D.cloudOpacity),
      cloudDepth: clamp(s.cloudDepth, 20, 100, D.cloudDepth),
      parallax: Boolean(s.parallax),
      sidebarGlass: clamp(s.sidebarGlass, 0, 100, D.sidebarGlass),
      menuGlass: clamp(s.menuGlass, 0, 100, D.menuGlass),
      composerGlass: clamp(s.composerGlass, 0, 100, D.composerGlass),
      cardGlass: clamp(s.cardGlass, 0, 100, D.cardGlass),
      chatVeil: clamp(s.chatVeil, 0, 60, D.chatVeil),
      glassBlur: clamp(s.glassBlur, 0, 40, D.glassBlur),
      rim: clamp(s.rim, 0, 100, D.rim),
      panelOpacity: clamp(s.panelOpacity, 48, 94, D.panelOpacity),
      shadow: clamp(s.shadow, 15, 75, D.shadow),
      radius: clamp(s.radius, 14, 42, D.radius),
      hover3d: Boolean(s.hover3d),
      halo: Boolean(s.halo),
      quality: pick(s.quality, QUALITIES, D.quality),
    };
  }

  /* Which surface style do the current sliders correspond to? ("custom" when none matches) */
  function surfaceOf(s) {
    for (const name of Object.keys(SURFACES))
      if (SURFACE_KEYS.every((k) => Number(s[k]) === SURFACES[name][k])) return name;
    return "custom";
  }

  /* ---------- colour helpers & theme resolver ---------- */
  const parse = (str) => str.split(" ").map(Number);
  const fmt = (a) => a.map((v) => Math.round(v)).join(" ");
  const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
  const lum = (a) => 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];

  function darkOf(p) {
    if (p.dark) return p;
    return {
      bg: fmt(mix(parse(p.bg), [20, 24, 34], 0.95)),
      surface: fmt(mix(parse(p.surface), [42, 48, 62], 0.94)),
      surface2: fmt(mix(parse(p.surface2), [32, 37, 49], 0.94)),
      ink: "238 241 247",
      accent: fmt(mix(parse(p.accent), [255, 255, 255], 0.28)),
      cloud: p.cloud.map((c) => fmt(mix(parse(c), [74, 84, 106], 0.62))),
      dark: true,
    };
  }
  const lightOf = (p) => (p.dark ? PALETTES.sky : p);

  /* Everything the page needs to paint: colours (triplet strings), cloud colours, sky gradient, dark flag. */
  function resolve(s, geminiDark) {
    const P0 = PALETTES[s.palette] || PALETTES.sky;
    const W = WEATHER[s.weather] || WEATHER.cloudy;
    let dark;
    if (s.uiMode === "light") dark = false;
    else if (s.uiMode === "dark") dark = true;
    else if (s.uiMode === "gemini") dark = Boolean(geminiDark);
    else dark = Boolean(P0.dark || W.dark);
    const c = dark ? darkOf(P0) : lightOf(P0);
    const toneName = s.cloudTone === "auto" ? W.tone : s.cloudTone;
    const tone = TONES[toneName] || TONES.neutral;
    const cloud = c.cloud.map((col) => fmt(mix(parse(col), tone.to, tone.k)));
    const sky = W.sky.map((col) => fmt(mix(parse(col), parse(c.bg), dark && !W.dark ? 0.55 : 0)));
    const skyDark = lum(parse(sky[0])) < 110;
    return {
      dark, c, cloud, sky, skyDark, tone: toneName, weather: W, fog: W.fog,
      cloudDark: lum(parse(cloud[1])) < 140,
    };
  }

  async function load() {
    const d = await chrome.storage.local.get([STORAGE_KEY]);
    return normalize(d[STORAGE_KEY]);
  }
  async function save(s) {
    await chrome.storage.local.set({ [STORAGE_KEY]: normalize(s) });
  }

  global.GUG = {
    STORAGE_KEY, DEFAULTS, PALETTES, WEATHER, PRESETS, SURFACES, SURFACE_LABELS, SURFACE_KEYS,
    TONE_LABELS, CLOUD_TYPES, UI_MODES, QUALITIES,
    normalize, surfaceOf, resolve, load, save,
  };
})(globalThis);

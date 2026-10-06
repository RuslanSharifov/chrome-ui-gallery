/* GitHub Liquid Glass — shared model: settings schema, per-zone options, presets, palettes and the token
   resolver used by BOTH the content script (real GitHub) and the popup/options preview. */
(function (global) {
  "use strict";

  const STORAGE_KEY = "githubLiquidGlassSettings";
  const UI_KEY = "githubLiquidGlassUi";

  const ACCENTS = { green: ["GitHub green", "46 160 67"], blue: ["Blue", "56 139 253"], purple: ["Octocat purple", "137 87 229"], orange: ["Orange", "219 109 40"], pink: ["Pink", "219 97 162"], teal: ["Teal", "47 191 183"] };
  const STYLES = { frosted: "Frosted glass", liquid: "Liquid glass", clear: "Clear liquid" };
  const COLOR_MODES = { auto: "Auto (follow GitHub)", light: "Light", dark: "Dark" };
  const QUALITIES = { low: "Battery saver", medium: "Balanced", high: "High quality" };
  const BG_EFFECTS = { matrix: "🟩 Matrix rain", contrib: "🟢 Contribution grid", gitgraph: "🔀 Git graph", aurora: "🌌 Aurora", stars: "⭐ Stars", mesh: "🎨 Gradient mesh", none: "⛔ None" };
  const BG_THEMES = { github: "GitHub greens", octo: "Octocat purple", blue: "Blue", amber: "Amber", pink: "Pink", mono: "Mono", rainbow: "Rainbow" };
  const GLYPHS = { code: "Code symbols { } < > /", hex: "Git hashes (hex)", binary: "Binary 0 1", katakana: "Katakana (classic)", gitsym: "Git symbols ⑂ ★ ✓" };

  /* ---------- per-zone options: every part of GitHub can be reshaped on its own ---------- */
  // tr = transparency %, blur = backdrop blur px, r = corner radius px, lq = refraction map shape (l = large panel, s = small)
  const ZONES = [
    { id: "page", icon: "🖼️", label: "Page background veil", tr: 70, blur: 0, r: 0, lq: "l", hint: "A soft veil over the whole page so text stays readable on top of the animated background." },
    { id: "header", icon: "🔝", label: "Header bar", tr: 38, blur: 26, r: 0, lq: "l" },
    { id: "nav", icon: "🧭", label: "Repo / profile tabs", tr: 55, blur: 18, r: 0, lq: "l" },
    { id: "sidebar", icon: "📑", label: "Sidebars & settings menu", tr: 46, blur: 22, r: 16, lq: "l" },
    { id: "cards", icon: "🗂️", label: "Cards & lists (Box)", tr: 42, blur: 22, r: 14, lq: "l" },
    { id: "code", icon: "💻", label: "Code, files & diffs", tr: 36, blur: 16, r: 12, lq: "l" },
    { id: "readme", icon: "📖", label: "README & markdown", tr: 52, blur: 20, r: 14, lq: "l" },
    { id: "convo", icon: "💬", label: "Issue & PR conversation", tr: 42, blur: 20, r: 14, lq: "l" },
    { id: "menus", icon: "📂", label: "Menus, popovers & tooltips", tr: 24, blur: 30, r: 14, lq: "s" },
    { id: "dialogs", icon: "🪟", label: "Dialogs & command palette", tr: 20, blur: 34, r: 22, lq: "l" },
    { id: "controls", icon: "🔘", label: "Buttons, inputs & labels", tr: 48, blur: 10, r: 10, lq: "s" },
    { id: "footer", icon: "🦶", label: "Footer", tr: 58, blur: 16, r: 0, lq: "l" }
  ];

  /* ---------- schema: t = b(ool) | e(num) | n(umber) ---------- */
  const SCHEMA = {
    enabled: { t: "b", d: true },
    style: { t: "e", d: "liquid", o: STYLES }, accent: { t: "e", d: "green", o: ACCENTS }, colorMode: { t: "e", d: "auto", o: COLOR_MODES },
    trOffset: { t: "n", d: 0, min: -30, max: 30 }, blurScale: { t: "n", d: 100, min: 40, max: 180 },
    saturation: { t: "n", d: 160, min: 100, max: 240 }, brightness: { t: "n", d: 108, min: 80, max: 140 },
    refraction: { t: "n", d: 60, min: 0, max: 100 }, dispersion: { t: "n", d: 30, min: 0, max: 100 }, bezel: { t: "n", d: 45, min: 10, max: 90 },
    specular: { t: "n", d: 60, min: 0, max: 100 }, edge: { t: "n", d: 55, min: 0, max: 100 }, depth: { t: "n", d: 40, min: 0, max: 100 },
    bounce: { t: "b", d: true },
    bgEffect: { t: "e", d: "matrix", o: BG_EFFECTS }, bgTheme: { t: "e", d: "github", o: BG_THEMES },
    bgIntensity: { t: "n", d: 55, min: 0, max: 100 }, bgSpeed: { t: "n", d: 50, min: 0, max: 100 }, bgDensity: { t: "n", d: 55, min: 10, max: 100 },
    bgSoft: { t: "n", d: 0, min: 0, max: 16 }, bgMouse: { t: "b", d: true }, bgAnimate: { t: "b", d: true },
    matrixGlyphs: { t: "e", d: "code", o: GLYPHS }, matrixSize: { t: "n", d: 16, min: 10, max: 30 }, matrixTrail: { t: "n", d: 60, min: 10, max: 100 }, matrixHead: { t: "b", d: true },
    gridCell: { t: "n", d: 20, min: 10, max: 44 }, gridGap: { t: "n", d: 3, min: 1, max: 9 }, gridWave: { t: "n", d: 50, min: 0, max: 100 },
    gitLanes: { t: "n", d: 6, min: 3, max: 12 },
    starsShoot: { t: "b", d: true },
    quality: { t: "e", d: "medium", o: QUALITIES }
  };
  ZONES.forEach(z => {
    SCHEMA["z_" + z.id + "_on"] = { t: "b", d: true };
    SCHEMA["z_" + z.id + "_tr"] = { t: "n", d: z.tr, min: 0, max: 92 };
    SCHEMA["z_" + z.id + "_blur"] = { t: "n", d: z.blur, min: 0, max: 60 };
    SCHEMA["z_" + z.id + "_r"] = { t: "n", d: z.r, min: 0, max: 34 };
  });
  const DEFAULTS = Object.freeze(Object.fromEntries(Object.entries(SCHEMA).map(([k, v]) => [k, v.d])));

  const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  function normalize(input) {
    const src = input && typeof input === "object" ? input : {}, out = {};
    for (const [k, def] of Object.entries(SCHEMA)) {
      const v = has(src, k) ? src[k] : def.d;
      if (def.t === "b") out[k] = Boolean(v);
      else if (def.t === "e") out[k] = has(def.o, v) ? v : def.d;
      else { const n = Number(v); out[k] = Number.isFinite(n) ? Math.round(Math.min(def.max, Math.max(def.min, n))) : def.d; }
    }
    return out;
  }

  /* ---------- presets (global look; zones keep their own values) ---------- */
  const PRESETS = {
    aurora: { label: "💠 Liquid Aurora", patch: { style: "liquid", accent: "blue", bgEffect: "aurora", bgTheme: "blue", bgIntensity: 70, refraction: 65, specular: 65 } },
    matrix: { label: "🟩 Matrix Terminal", patch: { style: "clear", accent: "green", bgEffect: "matrix", bgTheme: "github", bgIntensity: 62, matrixGlyphs: "code", refraction: 55, trOffset: 0 } },
    contrib: { label: "🟢 Contribution Glow", patch: { style: "liquid", accent: "green", bgEffect: "contrib", bgTheme: "github", bgIntensity: 60, gridWave: 60 } },
    gitgraph: { label: "🔀 Git Graph Night", patch: { style: "liquid", accent: "purple", bgEffect: "gitgraph", bgTheme: "octo", bgIntensity: 70, refraction: 55 } },
    frosted: { label: "🧊 Frosted Classic", patch: { style: "frosted", accent: "blue", bgEffect: "mesh", bgTheme: "blue", bgIntensity: 60, refraction: 0, trOffset: 0 } },
    crystal: { label: "💎 Crystal Clear", patch: { style: "clear", accent: "teal", bgEffect: "stars", bgTheme: "mono", bgIntensity: 70, refraction: 80, specular: 80, trOffset: 8 } },
    minimal: { label: "◻️ Minimal Glass", patch: { style: "frosted", accent: "green", bgEffect: "none", bgIntensity: 0, refraction: 0, trOffset: -6 } }
  };

  /* ---------- colour helpers ---------- */
  const rgb = s => String(s).trim().split(/\s+/).map(Number);
  const fmt = a => a.map(v => Math.round(Math.min(255, Math.max(0, v)))).join(" ");
  const mix = (a, b, t) => { const A = rgb(a), B = rgb(b); return fmt(A.map((v, i) => v + (B[i] - v) * t)); };
  const a3 = n => Math.min(1, Math.max(0, n)).toFixed(3);

  function resolveMode(s, githubMode) { return s.colorMode === "auto" ? (githubMode === "dark" ? "dark" : "light") : s.colorMode; }

  /* palette for the background effects: 5 contribution-style levels + matrix head/body */
  const GH_LEVELS = { dark: ["22 27 34", "14 68 41", "0 109 50", "38 166 65", "57 211 83"], light: ["235 237 240", "155 233 168", "64 196 99", "48 161 78", "33 110 57"] };
  const THEME_BASE = { github: "57 211 83", octo: "137 87 229", blue: "56 139 253", amber: "219 140 40", pink: "219 97 162", mono: "210 218 228" };
  function bgPalette(s, mode) {
    const dark = mode === "dark";
    if (s.bgTheme === "rainbow") {
      const lv = ["229 83 75", "219 140 40", "57 211 83", "56 139 253", "137 87 229"];
      return { levels: lv, body: "57 211 83", head: "235 255 240", rainbow: true, dark };
    }
    const base = s.bgTheme === "github" && !dark ? "48 161 78" : (dark || s.bgTheme === "mono" ? THEME_BASE[s.bgTheme] : mix(THEME_BASE[s.bgTheme], "20 30 50", .25));
    const levels = s.bgTheme === "github" ? GH_LEVELS[mode] : [dark ? "22 27 34" : "235 237 240", mix(dark ? "22 27 34" : "235 237 240", base, .3), mix("22 27 34", base, .55), mix("22 27 34", base, .8), base].map((c, i) => (!dark && i > 0 ? mix("235 237 240", base, [0, .35, .55, .8, 1][i]) : c));
    return { levels, body: base, head: mix(base, "255 255 255", dark ? .78 : .2), rainbow: false, dark };
  }

  /* ---------- token resolver: CSS variables for both GitHub and the popup preview ---------- */
  function tokens(s, mode) {
    const dark = mode === "dark", acc = ACCENTS[s.accent][1];
    const panel = mix(dark ? "13 17 23" : "255 255 255", acc, .035);
    const fg = dark ? "230 237 243" : "31 35 40";
    const E = s.edge / 100, P = s.specular / 100, D = s.depth / 100, style = s.style;
    const eA = dark ? .10 + E * .28 : .35 + E * .5, sA = dark ? .20 + P * .55 : .5 + P * .45;
    const v = {
      "--gh-panel": panel, "--gh-fg": fg, "--gh-accent": acc, "--gh-spec": a3(P),
      "--gh-base-a": dark ? mix("13 17 23", acc, .10) : mix("246 248 250", acc, .06), "--gh-base-b": dark ? "5 7 11" : mix("231 236 243", acc, .08),
      "--gh-line": "rgb(" + fg + " / " + (dark ? .16 : .16) + ")", "--gh-line-soft": "rgb(" + fg + " / .10)",
      "--gh-bg-opacity": (s.bgIntensity / 100).toFixed(2), "--gh-bg-soft": s.bgSoft + "px",
      "--gh-ease": s.bounce ? "cubic-bezier(.3, 1.6, .5, 1)" : "ease"
    };
    // material pieces
    const hiFrost = `linear-gradient(135deg, rgb(255 255 255 / ${a3(.08 + .1 * P)}), rgb(255 255 255 / .02) 60%)`;
    const hiLiquid = `radial-gradient(120% 90% at 0% 0%, rgb(255 255 255 / ${a3((dark ? .12 : .30) * P + .02)}), transparent 55%), linear-gradient(135deg, rgb(255 255 255 / ${a3(.06 + .16 * P)}) 0%, rgb(255 255 255 / .02) 38%, rgb(255 255 255 / 0) 62%, rgb(255 255 255 / ${a3(.03 + .07 * P)}) 100%)`;
    v["--gh-hi"] = style === "frosted" ? hiFrost : hiLiquid;
    const rimF = `inset 0 0 0 1px rgb(255 255 255 / ${a3(eA)}), inset 0 1px 0 rgb(255 255 255 / ${a3(eA * .8)})`;
    const k = style === "clear" ? 1.25 : 1;
    const rimL = `inset 0 0 0 1px rgb(255 255 255 / ${a3(eA * .9 * k)}), inset 0 2px 1px -1px rgb(255 255 255 / ${a3(sA)}), inset 0 -1.5px 1px -1px rgb(255 255 255 / ${a3(sA * .35)}), inset 12px 12px 30px -10px rgb(255 255 255 / ${a3(P * (dark ? .10 : .28))}), inset -10px -10px 26px -12px rgb(0 0 0 / ${dark ? .35 : .10})`;
    v["--gh-rim"] = style === "frosted" ? rimF : rimL;
    v["--gh-shadow"] = `0 ${Math.round(8 + D * 10)}px ${Math.round(24 + D * 24)}px rgb(0 0 0 / ${a3((dark ? .16 : .06) + D * (dark ? .30 : .16))})`;

    // zones
    const sat = s.saturation + "%", br = (s.brightness / 100).toFixed(2), zones = [];
    ZONES.forEach(z => {
      const on = s["z_" + z.id + "_on"], tr = Math.min(92, Math.max(0, s["z_" + z.id + "_tr"] + s.trOffset));
      const blur = Math.round(s["z_" + z.id + "_blur"] * s.blurScale / 100);
      let bf = "none";
      if (on && !(z.id === "page")) {
        if (style === "frosted" || s.refraction === 0) bf = `blur(${blur}px) saturate(${sat}) brightness(${br})`;
        else bf = `blur(${(blur * (style === "clear" ? .18 : .4)).toFixed(1)}px) url(#gug-lq-${z.lq}) saturate(${sat}) brightness(${br})`;
      }
      v["--gh-z-" + z.id + "-bg"] = "rgb(" + panel + " / " + (z.id === "page" ? (on ? a3(1 - tr / 100) : "0") : (on ? a3(1 - tr / 100) : ".96")) + ")";
      v["--gh-z-" + z.id + "-bf"] = bf;
      v["--gh-z-" + z.id + "-r"] = s["z_" + z.id + "_r"] + "px";
      if (on) zones.push(z.id);
    });

    // GitHub design tokens (Primer): translucent surfaces so the background effect shows through
    const T = (n, val) => { v[n] = val; };
    const soft = (al) => "rgb(" + panel + " / " + al + ")", f = (al) => "rgb(" + fg + " / " + al + ")";
    ["--bgColor-default", "--color-canvas-default", "--overlay-bgColor", "--header-bgColor", "--color-header-bg"].forEach(n => T(n, "transparent"));
    ["--bgColor-muted", "--color-canvas-subtle", "--color-btn-bg"].forEach(n => T(n, soft(".26")));
    ["--bgColor-inset", "--color-canvas-inset", "--color-btn-hover-bg"].forEach(n => T(n, soft(".34")));
    ["--bgColor-neutral-muted", "--color-neutral-muted"].forEach(n => T(n, f(".10")));
    ["--borderColor-default", "--color-border-default"].forEach(n => T(n, f(".16")));
    ["--borderColor-muted", "--color-border-muted"].forEach(n => T(n, f(".10")));
    ["--fgColor-default", "--color-fg-default"].forEach(n => T(n, "rgb(" + fg + ")"));
    ["--fgColor-muted", "--color-fg-muted"].forEach(n => T(n, f(".72")));
    return { vars: v, zones, palette: bgPalette(s, mode), mode };
  }

  function cssText(s, mode, selector) {
    const t = tokens(s, mode);
    return (selector || "html[data-gug-gh]") + "{" + Object.entries(t.vars).map(([k, val]) => k + ":" + val + (/^--(?:bgColor|color|overlay|header|borderColor|fgColor)/.test(k) ? " !important" : "")).join(";") + "}";
  }
  async function load() { const d = await chrome.storage.local.get([STORAGE_KEY]); return normalize(d[STORAGE_KEY]); }
  async function save(s) { await chrome.storage.local.set({ [STORAGE_KEY]: normalize(s) }); }

  global.GUG = { STORAGE_KEY, UI_KEY, SCHEMA, DEFAULTS, ZONES, ACCENTS, STYLES, COLOR_MODES, QUALITIES, BG_EFFECTS, BG_THEMES, GLYPHS, PRESETS, normalize, resolveMode, tokens, cssText, bgPalette, mix, load, save };
})(globalThis);

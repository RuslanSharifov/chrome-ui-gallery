/* Popup / options page. The UI is generated from SECTIONS (+ one section per GitHub part from GUG.ZONES):
   add a control to the schema and it appears, persists and previews automatically. */
(() => {
  "use strict";

  const $ = id => document.getElementById(id);
  const root = document.documentElement;
  const isFull = root.classList.contains("full");
  const osDark = matchMedia("(prefers-color-scheme: dark)");
  const nameOf = v => (Array.isArray(v) ? v[0] : v);
  const opts = table => Object.entries(table).map(([k, v]) => [k, nameOf(v)]);
  const sign = v => (v > 0 ? "+" : "") + v + "%";
  const is = (...effects) => s => effects.includes(s.bgEffect);

  let settings = GUG.normalize(null), bg = null, lq = null, ui = { open: { style: true } }, booting = true;

  /* ---------------- schema ---------------- */
  const SECTIONS = [
    { id: "style", icon: "💧", title: "Glass style", sum: s => `${GUG.STYLES[s.style]} · ${nameOf(GUG.ACCENTS[s.accent])}`, controls: [
      { t: "select", key: "style", label: "Glass style", options: opts(GUG.STYLES) },
      { t: "select", key: "accent", label: "Accent color", options: opts(GUG.ACCENTS) },
      { t: "select", key: "colorMode", label: "Color mode", options: opts(GUG.COLOR_MODES) },
      { t: "hint", text: s => s.colorMode === "auto" ? "Auto follows GitHub's own light/dark theme (recommended)." : "Forcing a mode that differs from GitHub's theme can leave a few texts low-contrast." },
      { t: "range", key: "trOffset", label: "Global transparency (all parts)", min: -30, max: 30, fmt: sign },
      { t: "range", key: "blurScale", label: "Blur strength (all parts)", unit: "%", min: 40, max: 180 },
      { t: "range", key: "saturation", label: "Color boost", unit: "%", min: 100, max: 240 },
      { t: "range", key: "brightness", label: "Brightness", unit: "%", min: 80, max: 140 },
      { t: "range", key: "depth", label: "Shadow depth", unit: "%", min: 0, max: 100 }
    ] },
    { id: "liquid", icon: "🫧", title: "Liquid refraction & highlights", sum: s => s.style === "frosted" ? "Off in Frosted style" : `Refraction ${s.refraction}% · dispersion ${s.dispersion}%`, controls: [
      { t: "hint", text: s => s.style === "frosted" ? "Choose “Liquid glass” or “Clear liquid” in Glass style to bend the background at the glass edges." : "Edge refraction uses an SVG backdrop filter (Chrome / Edge). Elsewhere you still get the blur and the specular edges." },
      { t: "range", key: "refraction", label: "Refraction strength", unit: "%", min: 0, max: 100, when: s => s.style !== "frosted" },
      { t: "range", key: "dispersion", label: "Chromatic dispersion", unit: "%", min: 0, max: 100, when: s => s.style !== "frosted" && s.refraction > 0 },
      { t: "range", key: "bezel", label: "Glass edge thickness", unit: "%", min: 10, max: 90, when: s => s.style !== "frosted" && s.refraction > 0 },
      { t: "range", key: "specular", label: "Specular highlight", unit: "%", min: 0, max: 100 },
      { t: "range", key: "edge", label: "Edge light", unit: "%", min: 0, max: 100 },
      { t: "switch", key: "bounce", label: "Bouncy liquid hover on buttons" }
    ] },
    { id: "bg", icon: "🌌", title: "Background effect", sum: s => `${nameOf(GUG.BG_EFFECTS[s.bgEffect]).replace(/^\S+\s/, "")} · ${GUG.BG_THEMES[s.bgTheme]}`, controls: [
      { t: "select", key: "bgEffect", label: "Effect", options: opts(GUG.BG_EFFECTS) },
      { t: "select", key: "bgTheme", label: "Color theme", options: opts(GUG.BG_THEMES), when: s => s.bgEffect !== "none" },
      { t: "range", key: "bgIntensity", label: "Intensity", unit: "%", min: 0, max: 100, when: s => s.bgEffect !== "none" },
      { t: "range", key: "bgSpeed", label: "Speed", unit: "%", min: 0, max: 100, when: is("matrix", "contrib", "gitgraph", "aurora", "stars") },
      { t: "range", key: "bgDensity", label: "Density", unit: "%", min: 10, max: 100, when: is("matrix", "contrib", "gitgraph", "stars") },
      { t: "range", key: "bgSoft", label: "Soften (blur the effect)", unit: "px", min: 0, max: 16, when: s => s.bgEffect !== "none" },
      { t: "switch", key: "bgMouse", label: "React to the cursor", when: is("matrix", "contrib", "gitgraph", "stars") },
      { t: "switch", key: "bgAnimate", label: "Animate (off = still image)", when: is("matrix", "contrib", "gitgraph", "aurora", "stars") },
      { t: "select", key: "quality", label: "Quality", options: opts(GUG.QUALITIES) }
    ] },
    { id: "fxopts", icon: "🎚️", title: "Effect options", sum: s => nameOf(GUG.BG_EFFECTS[s.bgEffect]).replace(/^\S+\s/, ""), controls: [
      { t: "hint", text: s => is("aurora", "mesh", "none")(s) ? "This effect has no extra options — use Intensity, Speed and Soften above." : "Options for the selected effect:" },
      { t: "select", key: "matrixGlyphs", label: "Matrix glyphs", options: opts(GUG.GLYPHS), when: is("matrix") },
      { t: "range", key: "matrixSize", label: "Glyph size", unit: "px", min: 10, max: 30, when: is("matrix") },
      { t: "range", key: "matrixTrail", label: "Trail length", unit: "%", min: 10, max: 100, when: is("matrix") },
      { t: "switch", key: "matrixHead", label: "Glowing lead glyph", when: is("matrix") },
      { t: "range", key: "gridCell", label: "Square size", unit: "px", min: 10, max: 44, when: is("contrib") },
      { t: "range", key: "gridGap", label: "Square gap", unit: "px", min: 1, max: 9, when: is("contrib") },
      { t: "range", key: "gridWave", label: "Activity wave", unit: "%", min: 0, max: 100, when: is("contrib") },
      { t: "range", key: "gitLanes", label: "Branch lanes", min: 3, max: 12, when: is("gitgraph") },
      { t: "switch", key: "starsShoot", label: "Shooting stars", when: is("stars") }
    ] }
  ];
  const zoneSections = GUG.ZONES.map(z => ({
    id: "z_" + z.id, zone: z, icon: z.icon, title: z.label,
    sum: s => s["z_" + z.id + "_on"] ? (z.id === "page" ? `veil ${100 - Math.min(92, s.z_page_tr + s.trOffset)}%` : `${Math.min(92, Math.max(0, s["z_" + z.id + "_tr"] + s.trOffset))}% · blur ${s["z_" + z.id + "_blur"]} · r ${s["z_" + z.id + "_r"]}`) : "Solid panel",
    controls: [
      ...(z.hint ? [{ t: "hint", text: () => z.hint }] : []),
      { t: "switch", key: "z_" + z.id + "_on", label: z.id === "page" ? "Show veil" : "Glass effect (off = solid panel)" },
      { t: "range", key: "z_" + z.id + "_tr", label: z.id === "page" ? "Veil transparency" : "Transparency", unit: "%", min: 0, max: 92, when: s => s["z_" + z.id + "_on"] },
      ...(z.id === "page" ? [] : [
        { t: "range", key: "z_" + z.id + "_blur", label: "Blur", unit: "px", min: 0, max: 60, when: s => s["z_" + z.id + "_on"] },
        { t: "range", key: "z_" + z.id + "_r", label: "Corner radius", unit: "px", min: 0, max: 34 }
      ]),
      { t: "reset", zone: z }
    ]
  }));

  /* ---------------- builders ---------------- */
  const refs = [], mk = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const commit = async () => {
    try { await GUG.save(settings); flash("All changes saved ✓"); } catch { flash("Could not save"); }
  };
  function flash(msg) { const s = $("saveState"); s.textContent = msg; s.dataset.on = "true"; clearTimeout(s._t); s._t = setTimeout(() => { s.dataset.on = "false"; }, 1500); }
  function update(patch) { settings = GUG.normalize({ ...settings, ...patch }); render(); commit(); }

  function build(ctl) {
    if (ctl.t === "select") {
      const f = mk("div", "field"), w = mk("div", "select"), sel = document.createElement("select"); sel.setAttribute("aria-label", ctl.label);
      ctl.options.forEach(([v, t]) => { const o = document.createElement("option"); o.value = v; o.textContent = t; sel.appendChild(o); });
      sel.onchange = () => update({ [ctl.key]: sel.value }); w.appendChild(sel); f.append(mk("span", "lbl", ctl.label), w);
      refs.push({ el: f, ctl, update: s => { sel.value = s[ctl.key]; sel.disabled = ctl.when ? !ctl.when(s) : false; } }); return f;
    }
    if (ctl.t === "range") {
      const l = mk("label", "rng"), head = mk("span", "rl"), name = mk("span", "", ctl.label), out = mk("output"), i = document.createElement("input");
      Object.assign(i, { type: "range", min: ctl.min, max: ctl.max, step: 1 }); head.append(name, out); l.append(head, i);
      i.oninput = () => { settings = GUG.normalize({ ...settings, [ctl.key]: i.value }); render(); clearTimeout(commit._t); commit._t = setTimeout(commit, 120); };
      refs.push({ el: l, ctl, update: s => {
        i.value = s[ctl.key]; out.textContent = ctl.fmt ? ctl.fmt(s[ctl.key]) : s[ctl.key] + (ctl.unit ?? "");
        i.style.setProperty("--fill", ((s[ctl.key] - ctl.min) / (ctl.max - ctl.min)) * 100 + "%"); i.disabled = ctl.when ? !ctl.when(s) : false;
      } }); return l;
    }
    if (ctl.t === "switch") {
      const r = mk("div", "row"), b = mk("button", "switch"); b.type = "button"; b.setAttribute("role", "switch"); b.setAttribute("aria-label", ctl.label); b.appendChild(mk("span"));
      b.onclick = () => update({ [ctl.key]: !settings[ctl.key] }); r.append(mk("span", "", ctl.label), b);
      refs.push({ el: r, ctl, update: s => { b.setAttribute("aria-checked", s[ctl.key]); b.disabled = ctl.when ? !ctl.when(s) : false; } }); return r;
    }
    if (ctl.t === "hint") { const p = mk("p", "hint"); refs.push({ el: p, ctl, update: s => { p.textContent = ctl.text(s); } }); return p; }
    if (ctl.t === "reset") {
      const b = mk("button", "mini", "Reset this part"); b.type = "button";
      b.onclick = () => update(Object.fromEntries(["on", "tr", "blur", "r"].map(k => ["z_" + ctl.zone.id + "_" + k, GUG.DEFAULTS["z_" + ctl.zone.id + "_" + k]])));
      return b;
    }
    return mk("div");
  }

  const sectionEls = [];
  function addSection(sec, parent) {
    const d = document.createElement("details"); d.className = "sec" + (sec.zone ? " zone" : ""); d.dataset.id = sec.id;
    const sm = document.createElement("summary"), sumEl = mk("span", "sum");
    sm.append(mk("span", "ico", sec.icon), mk("span", "ttl", sec.title), sumEl, mk("span", "chev"));
    const body = mk("div", "body"); sec.controls.forEach(c => body.appendChild(build(c))); d.append(sm, body);
    d.addEventListener("toggle", () => { if (booting || isFull) return; ui.open[sec.id] = d.open; chrome.storage.local.set({ [GUG.UI_KEY]: ui }).catch(() => {}); });
    parent.appendChild(d); sectionEls.push({ sec, d, sumEl });
  }
  SECTIONS.forEach(sec => addSection(sec, $("sections")));
  $("sections").appendChild(mk("p", "group-title", "Reshape each part of GitHub"));
  zoneSections.forEach(sec => addSection(sec, $("sections")));

  Object.entries(GUG.PRESETS).forEach(([k, p]) => {
    const b = mk("button", "pill", p.label); b.type = "button"; b.dataset.preset = k; b.onclick = () => update(p.patch); $("presets").appendChild(b);
  });
  // click a part in the preview -> open and highlight its settings
  document.querySelectorAll(".pv[data-zone]").forEach(el => el.addEventListener("click", e => {
    e.stopPropagation(); const t = sectionEls.find(x => x.sec.id === "z_" + el.dataset.zone); if (!t) return;
    t.d.open = true; t.d.scrollIntoView({ block: "nearest", behavior: "smooth" }); t.d.classList.remove("flash"); void t.d.offsetWidth; t.d.classList.add("flash");
  }));
  $("live").addEventListener("click", () => { const t = sectionEls.find(x => x.sec.id === "z_page"); t.d.open = true; t.d.scrollIntoView({ block: "nearest", behavior: "smooth" }); });

  /* ---------------- render ---------------- */
  function render() {
    $("enabled").setAttribute("aria-checked", settings.enabled);
    $("stateText").textContent = settings.enabled ? "Active on GitHub" : "Disabled";
    $("controls").style.opacity = settings.enabled ? "1" : ".45"; $("controls").style.pointerEvents = settings.enabled ? "auto" : "none";
    refs.forEach(r => { r.update(settings); const off = r.ctl.when && r.ctl.t !== "hint" ? !r.ctl.when(settings) : false; r.el.classList.toggle("is-off", off); });
    sectionEls.forEach(({ sec, sumEl }) => { sumEl.textContent = sec.sum(settings); });
    $("presets").querySelectorAll(".pill").forEach(b => { const p = GUG.PRESETS[b.dataset.preset].patch; b.setAttribute("aria-pressed", Object.keys(p).every(k => settings[k] === p[k])); });

    const mode = GUG.resolveMode(settings, osDark.matches ? "dark" : "light"), T = GUG.tokens(settings, mode);
    for (const [k, v] of Object.entries(T.vars)) if (!/^--(?:bgColor|color-|overlay|header|borderColor|fgColor)/.test(k)) root.style.setProperty(k, v);
    root.dataset.gugMode = mode;
    const wantLiquid = settings.style !== "frosted" && settings.refraction > 0;
    if (wantLiquid && !lq) lq = GUGLQ.create(root); if (!wantLiquid && lq) { lq.destroy(); lq = null; } lq?.update(settings);
    if (!bg) bg = GUGBG.create($("pvBg"), false); bg?.update(settings, mode);
  }

  /* ---------------- boot ---------------- */
  $("enabled").onclick = () => update({ enabled: !settings.enabled });
  $("reset").onclick = () => update({ ...GUG.DEFAULTS });
  $("version").textContent = "v" + chrome.runtime.getManifest().version;
  $("openFull").onclick = () => chrome.runtime.openOptionsPage();
  osDark.addEventListener?.("change", render);
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local" || !changes[GUG.STORAGE_KEY]) return;
    const next = GUG.normalize(changes[GUG.STORAGE_KEY].newValue);
    if (JSON.stringify(next) !== JSON.stringify(settings)) { settings = next; render(); }
  });
  if (!isFull) chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => { $("tabNotice").hidden = /^https:\/\/(?:gist\.)?github\.com\//.test(tab?.url || ""); }).catch(() => {});
  Promise.all([GUG.load(), chrome.storage.local.get([GUG.UI_KEY])]).then(([s, u]) => {
    settings = s; if (u[GUG.UI_KEY]?.open) ui = u[GUG.UI_KEY];
    sectionEls.forEach(({ sec, d }) => { d.open = isFull ? !sec.zone : Boolean(ui.open[sec.id]); });
    render(); setTimeout(() => { booting = false; }, 0);
  });
})();

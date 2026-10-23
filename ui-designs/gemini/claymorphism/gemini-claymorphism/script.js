/* Popup: presets + accordion sections (Clouds, Weather, Glass, Clay, More), live preview, save. */
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const OPEN_KEY = "gugClayOpenSections";
  let settings = GUG.normalize(null);
  let preview = null;
  const refs = { sliders: {}, switches: {}, choices: {}, tiles: [], surface: [] };

  $("version").textContent = "v" + chrome.runtime.getManifest().version;

  /* ---------- tiny DOM helpers ---------- */
  function h(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function chevron() {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.setAttribute("class", "chev");
    svg.setAttribute("aria-hidden", "true");
    const path = document.createElementNS(ns, "path");
    path.setAttribute("d", "M3.5 6l4.5 4.5L12.5 6");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    svg.appendChild(path);
    return svg;
  }

  /* ---------- control factories ---------- */
  function slider([key, label, unit, min, max]) {
    const l = h("label", "slider");
    const head = h("span", "", label);
    const out = h("output");
    head.appendChild(out);
    const i = h("input");
    Object.assign(i, { type: "range", min, max, step: 1 });
    l.append(head, i);
    refs.sliders[key] = { i, out, unit, min, max };
    i.oninput = () => {
      settings = GUG.normalize({ ...settings, [key]: i.value });
      render();
      clearTimeout(i._t);
      i._t = setTimeout(commit, 80);
    };
    return l;
  }
  function sw(key, label) {
    const row = h("div", "row");
    row.appendChild(h("span", "", label));
    const b = h("button", "switch");
    b.type = "button";
    b.setAttribute("role", "switch");
    b.setAttribute("aria-label", label);
    b.appendChild(h("span"));
    b.onclick = () => update({ [key]: !settings[key] });
    row.appendChild(b);
    refs.switches[key] = b;
    return row;
  }
  function choices(title, key, options) {
    const w = h("div");
    w.appendChild(h("div", "field", title));
    const box = h("div", "chips");
    refs.choices[key] = [];
    options.forEach(([v, t]) => {
      const b = h("button", "pill", t);
      b.type = "button";
      b.dataset.value = v;
      b.onclick = () => update({ [key]: isNaN(Number(v)) ? v : Number(v) });
      box.appendChild(b);
      refs.choices[key].push(b);
    });
    w.appendChild(box);
    return w;
  }
  const entries = (obj) => Object.entries(obj);

  /* ---------- accordion ---------- */
  function loadOpen() {
    try { const v = JSON.parse(localStorage.getItem(OPEN_KEY)); if (Array.isArray(v)) return new Set(v); } catch (_) {}
    return new Set(["clouds", "weather"]);
  }
  const open = loadOpen();
  function saveOpen() { try { localStorage.setItem(OPEN_KEY, JSON.stringify([...open])); } catch (_) {} }

  function section(id, icon, title, subFn, nodes) {
    const card = h("section", "card acc");
    const head = h("button", "acc-head");
    head.type = "button";
    head.id = "acc-head-" + id;
    head.setAttribute("aria-controls", "acc-body-" + id);
    const sub = h("span", "acc-sub");
    head.append(h("span", "acc-ico", icon), h("span", "", title), sub, chevron());
    const body = h("div", "acc-body");
    body.id = "acc-body-" + id;
    body.setAttribute("role", "region");
    body.setAttribute("aria-labelledby", head.id);
    const inner = h("div", "acc-inner");
    const pad = h("div", "acc-pad");
    pad.append(...nodes);
    inner.appendChild(pad);
    body.appendChild(inner);
    const sync = () => {
      const on = open.has(id);
      head.setAttribute("aria-expanded", String(on));
      inner.inert = !on;
    };
    head.onclick = () => { open.has(id) ? open.delete(id) : open.add(id); sync(); saveOpen(); };
    sync();
    card.append(head, body);
    refs.subs = refs.subs || [];
    refs.subs.push(() => (sub.textContent = subFn()));
    return card;
  }

  /* ---------- build sections ---------- */
  const SL = {
    clouds: [["cloudSpeed", "Speed", "%", 0, 100], ["cloudSize", "Size", "%", 55, 180], ["cloudCount", "Amount", "", 1, 9],
             ["cloudOpacity", "Opacity", "%", 20, 100], ["cloudDepth", "3D depth", "%", 20, 100]],
    weather: [["weatherIntensity", "Weather strength", "%", 0, 100], ["wind", "Wind  (\u2190 left · right \u2192)", "%", -100, 100],
              ["lightning", "Lightning (storm only, 0 = off)", "%", 0, 100], ["skyTint", "Sky tint", "%", 0, 100]],
    glass: [["sidebarGlass", "Sidebar transparency", "%", 0, 100], ["composerGlass", "Input box transparency", "%", 0, 100],
            ["menuGlass", "Menus & dialogs transparency", "%", 0, 100], ["cardGlass", "Cards, bubbles & code", "%", 0, 100],
            ["chatVeil", "Chat area tint", "%", 0, 60], ["glassBlur", "Glass blur", "px", 0, 40], ["rim", "Edge shine", "%", 0, 100]],
    clay: [["panelOpacity", "Surface opacity", "%", 48, 94], ["shadow", "Clay shadow", "%", 15, 75], ["radius", "Roundness", "px", 14, 42]],
  };

  // weather tiles
  const tiles = h("div", "tiles");
  entries(GUG.WEATHER).forEach(([k, w]) => {
    const b = h("button", "tile");
    b.type = "button";
    b.dataset.weather = k;
    b.append(h("b", "", w.icon), h("span", "", w.label));
    b.onclick = () => update({ weather: k, ...w.patch });
    tiles.appendChild(b);
    refs.tiles.push(b);
  });

  // glass: surface style segmented control
  const surfaceBox = h("div");
  surfaceBox.appendChild(h("div", "field", "Surface style"));
  const surfaceChips = h("div", "chips");
  entries(GUG.SURFACE_LABELS).forEach(([k, label]) => {
    const b = h("button", "pill", label);
    b.type = "button";
    b.dataset.surface = k;
    b.onclick = () => update(GUG.SURFACES[k]);
    surfaceChips.appendChild(b);
    refs.surface.push(b);
  });
  const customPill = h("button", "pill", "Custom");
  customPill.type = "button";
  customPill.dataset.surface = "custom";
  customPill.tabIndex = -1;
  customPill.style.cursor = "default";
  surfaceChips.appendChild(customPill);
  refs.surface.push(customPill);
  surfaceBox.appendChild(surfaceChips);

  const acc = $("accordion");
  acc.append(
    section("clouds", "\u2601\uFE0F", "Clouds", () => GUG.CLOUD_TYPES[settings.cloudType] + " · " + settings.cloudCount, [
      choices("Cloud type", "cloudType", entries(GUG.CLOUD_TYPES)),
      choices("Cloud tone", "cloudTone", entries(GUG.TONE_LABELS)),
      ...SL.clouds.map(slider),
      sw("parallax", "Cursor parallax"),
    ]),
    section("weather", "\uD83C\uDF26\uFE0F", "Weather", () => GUG.WEATHER[settings.weather].label, [
      tiles,
      ...SL.weather.map(slider),
    ]),
    section("glass", "\uD83E\uDE9F", "Glass", () => ({ clay: "Clay", hybrid: "Clay + Glass", glass: "Glass", custom: "Custom" })[GUG.surfaceOf(settings)], [
      surfaceBox,
      h("p", "hint", "Raise a slider to turn that area from solid clay into frosted glass: the pastel fill fades, the offset shadows soften and a light rim appears."),
      ...SL.glass.map(slider),
      sw("halo", "Text halo (easier reading over clouds)"),
    ]),
    section("clay", "\uD83E\uDDF1", "Clay", () => GUG.PALETTES[settings.palette].label, [
      choices("Palette", "palette", entries(GUG.PALETTES).map(([k, v]) => [k, v.label])),
      choices("UI colour mode", "uiMode", entries(GUG.UI_MODES)),
      ...SL.clay.map(slider),
      sw("hover3d", "3D sidebar hover"),
    ]),
    section("more", "\u2699\uFE0F", "More", () => GUG.QUALITIES[settings.quality], [
      choices("Quick cloud speed", "cloudSpeed", [["18", "Calm"], ["44", "Natural"], ["72", "Lively"], ["94", "Fast"]]),
      choices("Effects quality (rain, snow, stars)", "quality", entries(GUG.QUALITIES)),
      h("p", "hint", "Lower the quality or the weather strength if the page feels heavy. Lightning is off under reduced-motion settings."),
    ]),
  );

  // presets
  entries(GUG.PRESETS).forEach(([k, p]) => {
    const b = h("button", "pill", p.label);
    b.type = "button";
    b.dataset.preset = k;
    b.onclick = () => update(p.patch);
    $("presets").appendChild(b);
  });

  /* ---------- actions ---------- */
  let savedTimer = 0;
  async function commit() {
    const s = $("saveState");
    try {
      await GUG.save(settings);
      s.textContent = "Saved \u2713";
    } catch (_) {
      s.textContent = "Could not save";
    }
    s.dataset.on = "true";
    clearTimeout(savedTimer);
    savedTimer = setTimeout(() => (s.dataset.on = "false"), 1500);
  }
  function update(p) {
    settings = GUG.normalize({ ...settings, ...p });
    render();
    commit();
  }
  $("enabled").onclick = () => update({ enabled: !settings.enabled });
  $("reset").onclick = () => update({ ...GUG.DEFAULTS });
  $("save").onclick = commit;

  /* ---------- render ---------- */
  function renderPreview(theme) {
    const host = $("preview-host");
    host.style.background = "rgb(" + theme.c.bg + ")";
    if (!settings.enabled) { preview && preview.destroy(); preview = null; return; }
    if (!preview) preview = GUGCLAY.create(host, settings, { interactive: false, preview: true, geminiDark: false });
    else preview.update(settings, false);
  }

  function render() {
    const theme = GUG.resolve(settings, false);
    const st = document.documentElement.style;
    st.setProperty("--bg", theme.c.bg);
    st.setProperty("--surface", theme.c.surface);
    st.setProperty("--surface2", theme.c.surface2);
    st.setProperty("--ink", theme.c.ink);
    st.setProperty("--accent", theme.c.accent);
    st.setProperty("--shc", theme.dark ? "0 0 0" : "72 82 98");
    st.setProperty("--sh", theme.dark ? ".34" : ".18");
    st.setProperty("--hl", theme.dark ? ".05" : ".76");
    document.documentElement.toggleAttribute("data-dark", theme.dark);

    $("enabled").setAttribute("aria-checked", settings.enabled);
    $("stateText").textContent = settings.enabled ? "Active on Gemini" : "Disabled";
    $("controls").style.opacity = settings.enabled ? "1" : ".45";
    $("controls").style.pointerEvents = settings.enabled ? "auto" : "none";

    Object.entries(refs.switches).forEach(([k, b]) => b.setAttribute("aria-checked", settings[k]));
    Object.entries(refs.sliders).forEach(([k, r]) => {
      r.i.value = settings[k];
      r.i.style.setProperty("--fill", ((settings[k] - r.min) / (r.max - r.min)) * 100 + "%");
      r.out.textContent = (k === "wind" && settings[k] > 0 ? "+" : "") + settings[k] + r.unit;
    });
    Object.entries(refs.choices).forEach(([k, list]) =>
      list.forEach((b) => b.setAttribute("aria-pressed", b.dataset.value === String(settings[k]))));
    refs.tiles.forEach((b) => b.setAttribute("aria-pressed", b.dataset.weather === settings.weather));
    const sf = GUG.surfaceOf(settings);
    refs.surface.forEach((b) => {
      b.setAttribute("aria-pressed", b.dataset.surface === sf);
      if (b.dataset.surface === "custom") b.hidden = sf !== "custom";
    });
    $("presets").querySelectorAll(".pill").forEach((b) => {
      const patch = GUG.PRESETS[b.dataset.preset].patch;
      b.setAttribute("aria-pressed", Object.keys(patch).every((k) => settings[k] === patch[k]));
    });
    (refs.subs || []).forEach((f) => f());
    renderPreview(theme);
  }

  chrome.tabs.query({ active: true, currentWindow: true })
    .then(([tab]) => { $("tabNotice").hidden = /^https:\/\/gemini\.google\.com\//.test((tab && tab.url) || ""); })
    .catch(() => {});

  GUG.load().then((s) => { settings = s; render(); });
})();

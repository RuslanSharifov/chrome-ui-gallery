/* Popup logic. Settings are written to chrome.storage; the content script reacts through
 * chrome.storage.onChanged. The background canvas is a live preview using the same shader. */
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  let settings = CUG.normalize(null);

  $("version").textContent = "v" + chrome.runtime.getManifest().version;

  /* ---------- declarative control definitions ---------- */
  const SLIDERS = {
    fx: [
      { key: "intensity", label: "Intensity", unit: "%", min: 0,  max: 100 },
      { key: "scale",     label: "Size",      unit: "%", min: 40, max: 240 },
      { key: "speed",     label: "Speed",     unit: "%", min: 0,  max: 250, zero: "Frozen" },
      { key: "caustics",  label: "Underwater light", unit: "%", min: 0, max: 100 },
      { key: "rays",      label: "Light rays",       unit: "%", min: 0, max: 100 },
      { key: "neon",      label: "Neon glow",        unit: "%", min: 0, max: 100 }
    ],
    glass: [
      { key: "blur",       label: "Blur",               unit: "px", min: 8,   max: 60 },
      { key: "opacity",    label: "Panel opacity",      unit: "%",  min: 10,  max: 92 },
      { key: "veil",       label: "Chat area opacity",  unit: "%",  min: 0,   max: 60 },
      { key: "saturation", label: "Colour boost",       unit: "%",  min: 100, max: 240 },
      { key: "shine",      label: "Edge shine",         unit: "%",  min: 0,   max: 200 },
      { key: "radius",     label: "Roundness",          unit: "px", min: 6,   max: 36 }
    ]
  };

  const refs = { sliders: {}, switches: {}, chips: {} };

  function makeSlider(def) {
    const label = document.createElement("label");
    label.className = "slider";
    const head = document.createElement("span");
    head.textContent = def.label + " ";
    const out = document.createElement("output");
    head.appendChild(out);
    const input = document.createElement("input");
    Object.assign(input, { type: "range", min: def.min, max: def.max, step: 1 });
    label.append(head, input);
    let timer;
    input.addEventListener("input", () => {
      settings = CUG.normalize({ ...settings, [def.key]: input.value });
      render(true);                      // instant UI + preview
      clearTimeout(timer);
      timer = setTimeout(() => CUG.save(settings), 60); // debounced write
    });
    refs.sliders[def.key] = { def, input, out };
    return label;
  }

  function makeSwitchRow(key, text) {
    const row = document.createElement("div");
    row.className = "row";
    const span = document.createElement("span"); span.textContent = text;
    const b = document.createElement("button");
    b.type = "button"; b.className = "switch switch--sm"; b.setAttribute("role", "switch"); b.setAttribute("aria-label", text);
    b.innerHTML = "<span></span>";
    b.addEventListener("click", () => update({ [key]: !settings[key] }));
    row.append(span, b);
    refs.switches[key] = b;
    return row;
  }

  function makeChoice(title, key, options, kind) {
    const wrap = document.createElement("div");
    const h = document.createElement("p"); h.className = "field-label"; h.textContent = title;
    const chips = document.createElement("div"); chips.className = "chips"; chips.setAttribute("role", "radiogroup"); chips.setAttribute("aria-label", title);
    refs.chips[key] = [];
    options.forEach(([value, text, color]) => {
      const b = document.createElement("button");
      b.type = "button"; b.setAttribute("role", "radio"); b.setAttribute("aria-label", text); b.title = text; b.dataset.value = value;
      if (kind === "swatch") { b.className = "swatch"; b.style.setProperty("--c", color); } else { b.className = "pill"; b.textContent = text; }
      b.addEventListener("click", () => update({ [key]: value }));
      chips.appendChild(b);
      refs.chips[key].push(b);
    });
    wrap.append(h, chips);
    return wrap;
  }

  function hint(text) { const p = document.createElement("p"); p.className = "hint"; p.textContent = text; return p; }

  /* ---------- build panels ---------- */
  const fxPanel = $("panel-fx"), glassPanel = $("panel-glass"), morePanel = $("panel-more");

  fxPanel.append(
    makeSwitchRow("fxOn", "Dynamic light background"),
    makeChoice("Palette", "palette", Object.entries(CUG.PALETTES).map(([k, p]) => [k, p.label]), "pill"),
    ...SLIDERS.fx.map(makeSlider),
    makeSwitchRow("mouseGlow", "Light follows cursor"),
    makeChoice("Quality", "quality", [["low", "Low (fast)"], ["medium", "Medium"], ["high", "High"]], "pill"),
    hint("Lower quality renders the light at a smaller size: smoother on laptops, same look.")
  );

  glassPanel.append(
    makeChoice("Accent", "accent", Object.entries(CUG.ACCENTS).map(([k, a]) => [k, a.label, a.dark]), "swatch"),
    ...SLIDERS.glass.map(makeSlider),
    hint("Lower the opacity sliders to see more of the lights through every container.")
  );

  morePanel.append(
    makeSwitchRow("hover3d", "3D chat hover"),
    makeSwitchRow("dragDialogs", "Draggable dialogs"),
    hint("Drag a dialog (Settings, plans…) by its top area. Double-click there to snap it back.")
  );

  // presets
  const presetBox = $("presets");
  Object.entries(CUG.PRESETS).forEach(([key, p]) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "pill"; b.textContent = p.label; b.dataset.preset = key;
    b.addEventListener("click", () => update(p.patch));
    presetBox.appendChild(b);
  });

  // tabs (roving selection, arrow-key support)
  const tabs = [...document.querySelectorAll(".tab")];
  function selectTab(name) {
    tabs.forEach((t) => {
      const on = t.dataset.tab === name;
      t.setAttribute("aria-selected", String(on)); t.tabIndex = on ? 0 : -1;
      $("panel-" + t.dataset.tab).hidden = !on;
    });
  }
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => selectTab(t.dataset.tab));
    t.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const n = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
      selectTab(n.dataset.tab); n.focus();
    });
  });
  selectTab("fx");

  $("enabled").addEventListener("click", () => update({ enabled: !settings.enabled }));
  $("reset").addEventListener("click", () => update({ ...CUG.DEFAULTS }));

  /* ---------- state -> UI ---------- */
  function update(patch) {
    settings = CUG.normalize({ ...settings, ...patch });
    render(true);
    CUG.save(settings);
  }

  let preview = null;
  function syncPreview() {
    const canvas = $("preview");
    if (!settings.fxOn) { preview?.destroy(); preview = null; canvas.style.display = "none"; return; }
    canvas.style.display = "block";
    if (!preview) { preview = CUGFX.create(canvas); if (!preview) { canvas.style.display = "none"; return; } preview.start(); }
    // the popup is always dark; preview in low quality to keep it light on the GPU
    preview.update({ ...CUGFX.paramsFrom({ ...settings, quality: "low" }, false) });
  }

  function render() {
    $("enabled").setAttribute("aria-checked", String(settings.enabled));
    $("stateText").textContent = settings.enabled ? "Active on ChatGPT" : "Disabled";
    $("controls").dataset.disabled = String(!settings.enabled);

    Object.entries(refs.switches).forEach(([k, b]) => b.setAttribute("aria-checked", String(settings[k])));
    Object.entries(refs.sliders).forEach(([k, { def, input, out }]) => {
      input.value = settings[k];
      out.textContent = def.zero && settings[k] === 0 ? def.zero : settings[k] + def.unit;
      input.style.setProperty("--fill", ((settings[k] - def.min) / (def.max - def.min)) * 100 + "%");
    });
    Object.entries(refs.chips).forEach(([k, list]) => list.forEach((b) => b.setAttribute("aria-checked", String(b.dataset.value === settings[k]))));

    // highlight a preset only while every one of its values still matches
    presetBox.querySelectorAll(".pill").forEach((b) => {
      const patch = CUG.PRESETS[b.dataset.preset].patch;
      b.setAttribute("aria-pressed", String(Object.keys(patch).every((k) => settings[k] === patch[k])));
    });

    document.documentElement.style.setProperty("--accent", CUG.ACCENTS[settings.accent].dark);
    syncPreview();
  }

  // Hint when the active tab is not ChatGPT (activeTab grants url access once the popup is open)
  chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
    const onChat = /^https:\/\/(chatgpt\.com|chat\.openai\.com)\//.test(tab?.url || "");
    $("tabNotice").hidden = onChat || !tab?.url;
  }).catch(() => {});

  CUG.load().then((s) => { settings = s; render(); });
})();

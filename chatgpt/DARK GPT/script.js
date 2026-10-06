/* DARK GPT popup: sections (accordion), live WebGL background + interactive particle preview, auto-save. */
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const OPEN_KEY = "cugDarkGptOpen";
  const PREVIEW_TEXT = "Ready when you are.";
  const PREVIEW_FONT = 'Inter, ui-sans-serif, system-ui, "Segoe UI", sans-serif';

  let settings = CUG.normalize(null);
  let bg = null, bgFailed = false, text = null;
  const refs = { sliders: {}, switches: {}, choices: {} };

  $("version").textContent = "v" + chrome.runtime.getManifest().version;

  /* ---------- helpers ---------- */
  function h(tag, cls, txt) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }
  function slider([key, label, unit, min, max]) {
    const l = h("label", "slider");
    const head = h("span", "", label), out = h("output");
    head.appendChild(out);
    const i = h("input");
    Object.assign(i, { type: "range", min, max, step: 1 });
    l.append(head, i);
    refs.sliders[key] = { i, out, unit, min, max };
    i.oninput = () => {
      settings = CUG.normalize({ ...settings, [key]: i.value });
      render();
      clearTimeout(i._t);
      i._t = setTimeout(commit, 90);
    };
    return l;
  }
  function toggle(key, label) {
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
  function choices(title, key, table) {
    const w = h("div");
    w.appendChild(h("p", "field-label", title));
    const box = h("div", "chips");
    refs.choices[key] = [];
    Object.entries(table).forEach(([v, t]) => {
      const b = h("button", "pill", t);
      b.type = "button";
      b.dataset.value = v;
      b.onclick = () => update({ [key]: v });
      box.appendChild(b);
      refs.choices[key].push(b);
    });
    w.appendChild(box);
    return w;
  }

  /* ---------- sections ---------- */
  let open;
  try { open = new Set(JSON.parse(localStorage.getItem(OPEN_KEY))); } catch (_) { open = null; }
  if (!open || !open.size) open = new Set(["text"]);
  const saveOpen = () => { try { localStorage.setItem(OPEN_KEY, JSON.stringify([...open])); } catch (_) {} };

  function section(id, icon, title, nodes) {
    const d = h("details", "card sec");
    d.open = open.has(id);
    const s = h("summary");
    s.append(h("span", "sec-ico", icon), h("span", "sec-title", title), h("span", "sec-chev"));
    const body = h("div", "sec-body");
    body.append(...nodes);
    d.append(s, body);
    d.addEventListener("toggle", () => { d.open ? open.add(id) : open.delete(id); saveOpen(); });
    return d;
  }

  $("sections").append(
    section("text", "✦", "Welcome text (particles)", [
      toggle("textFx", "Interactive particle headline"),
      choices("Mouse effect", "textEffect", CUG.EFFECTS),
      slider(["textRadius", "Effect radius", "px", 50, 260]),
      slider(["textStrength", "Strength", "%", 10, 100]),
      slider(["textDensity", "Particle density", "%", 20, 100]),
      slider(["textScale", "Text size", "%", 80, 200]),
    ]),
    section("pointer", "◎", "Pointer light", [
      toggle("pointerGlow", "Red light follows the cursor"),
      slider(["glowRadius", "Light radius", "px", 80, 520]),
    ]),
    section("look", "◐", "Surfaces & background", [
      slider(["panelBrightness", "Panel opacity", "%", 15, 90]),
      slider(["chatTint", "Chat area tint", "%", 0, 60]),
      slider(["backgroundBrightness", "Ambient red glow", "%", 0, 80]),
      choices("Background quality", "bgQuality", CUG.QUALITIES),
      toggle("hover3d", "3D hover on chat list"),
    ]),
  );

  /* ---------- persistence ---------- */
  let savedTimer = 0;
  async function commit() {
    const el = $("saveState");
    try { await CUG.save(settings); el.textContent = "Saved ✓"; }
    catch (_) { el.textContent = "Could not save"; }
    el.dataset.on = "true";
    clearTimeout(savedTimer);
    savedTimer = setTimeout(() => (el.dataset.on = "false"), 1400);
  }
  function update(p) {
    settings = CUG.normalize({ ...settings, ...p });
    render();
    commit();
  }
  $("enabled").onclick = () => update({ enabled: !settings.enabled });
  $("reset").onclick = () => update({ ...CUG.DEFAULTS });

  /* ---------- previews ---------- */
  function textOpts() {
    return { effect: settings.textEffect, radius: settings.textRadius, strength: settings.textStrength,
             density: settings.textDensity, scale: settings.textScale,
             reduced: matchMedia("(prefers-reduced-motion: reduce)").matches };
  }
  // the preview box is narrow: use a smaller base font and cap the scale so the whole sentence always fits
  function previewScale(box) {
    const c = document.createElement("canvas").getContext("2d");
    c.font = "400 22px " + PREVIEW_FONT;
    const tw = c.measureText(PREVIEW_TEXT).width || 1;
    return Math.min(settings.textScale, Math.floor(((box.clientWidth || 332) * 0.9) / tw * 100));
  }
  function syncTextPreview() {
    const canvas = $("textPreview"), box = canvas.parentElement;
    const on = settings.enabled && settings.textFx;
    box.dataset.off = String(!on);
    if (!on) { text && text.destroy(); text = null; canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height); return; }
    const opts = Object.assign(textOpts(), { scale: previewScale(box) });
    if (!text) {
      text = CUGTEXT.createEngine(canvas, opts);
      if (!text) return;
      const w = Math.round(box.clientWidth) || 332, hgt = 104;
      const font = { style: "normal", weight: "400", size: 22, family: PREVIEW_FONT, letterSpacing: "0px" };
      text.setLayout(CUGTEXT.layoutFromText(PREVIEW_TEXT, w, hgt, font), true);
      text.start();
    } else text.setOptions(opts);
  }
  function syncBackground() {
    if (bgFailed) return;
    if (!settings.enabled) { bg && bg.destroy(); bg = null; return; }
    if (!bg) {
      bg = CUGFX.create($("preview"));
      if (!bg) { bgFailed = true; return; }
      bg.start();
    }
    bg.update(CUGFX.paramsFrom(settings, false));
  }

  /* ---------- render ---------- */
  function render() {
    $("enabled").setAttribute("aria-checked", String(settings.enabled));
    $("stateText").textContent = settings.enabled ? "Active on ChatGPT" : "Disabled";
    $("controls").style.opacity = settings.enabled ? "1" : ".45";
    $("controls").style.pointerEvents = settings.enabled ? "auto" : "none";
    Object.entries(refs.sliders).forEach(([k, r]) => {
      r.i.value = settings[k];
      r.out.textContent = settings[k] + r.unit;
      r.i.style.setProperty("--fill", ((settings[k] - r.min) / (r.max - r.min)) * 100 + "%");
    });
    Object.entries(refs.switches).forEach(([k, b]) => b.setAttribute("aria-checked", String(settings[k])));
    Object.entries(refs.choices).forEach(([k, list]) => list.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.value === settings[k]))));
    syncBackground();
    syncTextPreview();
  }

  chrome.tabs.query({ active: true, currentWindow: true })
    .then(([tab]) => { $("tabNotice").hidden = /^https:\/\/(chatgpt\.com|chat\.openai\.com)\//.test((tab && tab.url) || "") || !(tab && tab.url); })
    .catch(() => {});

  CUG.load().then((s) => { settings = s; render(); });
})();

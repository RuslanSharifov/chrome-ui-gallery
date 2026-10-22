/* UI Doctor — side panel controller.
 * Renders each screen from state, routes actions to the page (via the service worker),
 * and exports reports. Every value that originates on the inspected page is escaped.
 */
(() => {
  "use strict";
  const esc = UD.esc;
  const $ = (sel, root = document) => root.querySelector(sel);
  const PRESETS = self.UD_PRESETS;
  const PLAY_PROPS = ["margin", "padding", "width", "max-width", "min-width", "height", "font-size", "line-height", "letter-spacing", "color", "background-color", "border-radius", "gap", "display", "text-align", "white-space", "overflow-wrap", "flex-wrap", "justify-content", "align-items", "opacity"];
  const TYPO_KEYS = ["font-family", "font-size", "font-weight", "line-height", "letter-spacing", "text-align", "text-transform", "text-decoration-line", "color", "white-space", "word-break", "overflow-wrap"];
  const LIVE = ["overview", "inspector", "spacing", "typography", "colors"];
  const SEVERITIES = ["error", "warning", "info"];
  const CATEGORY_LABELS = {
    "page-horizontal-scroll": "Page scrolls sideways",
    "horizontal-overflow": "Horizontal overflow",
    "outside-viewport": "Outside the viewport",
    "clipped-text": "Potentially clipped text",
    "image-exceeds-container": "Image exceeds container",
    "oversized-fixed-container": "Oversized fixed-width container",
    "small-target": "Small interactive target",
    "possible-overlap": "Possible element overlap",
    "alignment": "Possible alignment inconsistency",
    "ignored-off-screen": "Ignored off-screen elements"
  };

  const S = {
    tabId: null,
    url: "",
    snap: null,
    error: "",
    screen: "overview",
    busy: false,
    settings: null,
    recent: [],
    customPresets: [],
    orientation: "portrait",
    customW: 390,
    customH: 844,
    test: null,
    diag: null,
    diagTabId: null,
    filters: { error: true, warning: true, info: true },
    sweep: null,
    playList: [],
    pg: { prop: "margin", value: "", important: false }
  };

  /* ---------- helpers ---------- */
  const raw = (html) => ({ raw: html });
  const cell = (v) => (v && v.raw !== undefined ? v.raw : esc(v));
  const kv = (rows, cls = "") => `<table class="kv ${cls}">${rows.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${cell(v)}</td></tr>`).join("")}</table>`;
  const card = (title, body) => `<section class="card"><h2>${esc(title)}</h2>${body}</section>`;
  const empty = (text) => `<p class="empty">${esc(text)}</p>`;
  const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
  const countSev = (sev) => (S.diag ? S.diag.findings.filter((f) => f.severity === sev).length : 0);
  const label = (cat) => CATEGORY_LABELS[cat] || cat;

  const bgCall = (msg) => chrome.runtime.sendMessage(msg).then((r) => {
    if (!r || !r.ok) throw new Error((r && r.error) || "Background service did not respond.");
    return r.data;
  });
  const tabCall = (payload, tabId = S.tabId) => {
    if (!tabId) return Promise.reject(new Error("No active tab. Click on the page you want to inspect."));
    return bgCall({ type: "BG_TAB_MSG", tabId, payload });
  };

  function toast(text) {
    const t = $("#toast");
    t.textContent = text;
    t.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => { t.hidden = true; }, 2600);
  }
  function setLive(text) { $("#live").textContent = text || ""; }

  async function copyText(text, done = "Copied to clipboard") {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    toast(done);
  }

  function download(name, mime, text) {
    const url = URL.createObjectURL(new Blob([text], { type: mime }));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const stamp = () => new Date().toISOString().replace(/[-:]/g, "").slice(0, 13).replace("T", "-");

  function applyTheme() {
    const pref = S.settings.theme;
    const resolved = pref === "system"
      ? (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark")
      : pref;
    document.documentElement.dataset.theme = resolved;
    const motion = S.settings.motion === "reduce" ? "reduce"
      : S.settings.motion === "full" ? "full"
      : (matchMedia("(prefers-reduced-motion: reduce)").matches ? "reduce" : "full");
    document.body.dataset.motion = motion;
  }

  /* ---------- state refresh ---------- */
  async function refreshSnapshot() {
    try {
      S.snap = await tabCall({ type: "UD_SNAPSHOT" });
      S.url = S.snap.url;
      S.error = "";
    } catch (e) {
      S.snap = null;
      S.error = e.message;
    }
    render();
  }

  async function loadRecent() {
    S.recent = (await chrome.storage.local.get("recent")).recent || [];
  }

  async function loadPlayList() {
    try { S.playList = await tabCall({ type: "UD_PLAY_LIST" }); } catch (e) { S.playList = []; }
  }

  /* ---------- views ---------- */
  function viewOverview() {
    const s = S.snap;
    let h = "";
    if (S.error) {
      h += `<div class="alert"><strong>UI Doctor can't read this page.</strong><p class="muted">${esc(S.error)}</p>${S.url ? '<button class="btn primary" data-action="grant">Allow access to this site</button>' : ""}</div>`;
    }
    h += card("Current page", s
      ? `<p class="strong">${esc(s.title || "Untitled page")}</p><p class="muted mono">${esc(s.url)}</p>`
      : empty("No page connected. Open a regular web page and try again."));
    if (s) {
      h += card("Viewport", kv([
        ["Window (innerWidth × innerHeight)", `${s.viewport.innerWidth} × ${s.viewport.innerHeight} px`],
        ["Content width (no scrollbar)", `${s.viewport.clientWidth} px`],
        ["Device pixel ratio", String(s.viewport.dpr)]
      ]));
    }
    const count = (sev) => (S.diag ? countSev(sev) : "–");
    h += card("Status", `<div class="stats">
      <div><span>Inspection</span><b class="${s && s.inspecting ? "ok" : ""}">${s && s.inspecting ? "On" : "Off"}</b></div>
      <div><span>Errors</span><b>${count("error")}</b></div>
      <div><span>Warnings</span><b>${count("warning")}</b></div>
      <div><span>Info</span><b>${count("info")}</b></div>
    </div>`);
    h += card("Quick actions", `<div class="row">
      <button class="btn primary" data-action="toggle-inspect">${s && s.inspecting ? "Stop inspecting" : "Start inspecting"}</button>
      <button class="btn" data-action="run-diag">Run diagnostics</button>
      <button class="btn" data-action="go" data-screen="responsive">Responsive Lab</button>
      <button class="btn ghost" data-action="clear">Clear overlays</button>
    </div>`);
    const recent = S.recent.length
      ? `<ul class="linklist" style="padding:0;margin:0;list-style:none">${S.recent.map((r) => `<li class="muted"><strong style="color:var(--text)">${esc(r.title || r.url)}</strong><br>${esc(new Date(r.at).toLocaleString())} · ${r.errors} errors, ${r.warnings} warnings, ${r.info} info</li>`).join("")}</ul>`
      : empty("No diagnostic runs yet.");
    h += card("Recent results", recent);
    return h;
  }

  function computedTable(c) {
    return kv(Object.entries(c).map(([k, v]) => [k, v || "—"]), "compact");
  }

  function viewInspector() {
    const s = S.snap;
    let h = card("Element inspector", `<div class="row">
      <button class="btn ${s && s.inspecting ? "" : "primary"}" data-action="toggle-inspect">${s && s.inspecting ? "Stop inspecting" : "Start inspecting"}</button>
      <button class="btn ghost" data-action="clear">Clear overlays</button>
    </div>
    <p class="note">Hover to preview · Click to select · Shift+click to pin a second element for spacing · Esc stops inspection.</p>`);
    const sel = s && s.selection;
    if (!sel) return h + card("Selected element", empty("Nothing selected yet."));
    h += card("Selected element", kv([
      ["Tag", sel.tag],
      ["CSS selector", raw(`<span class="mono">${esc(sel.selector)}</span> <button class="btn ghost" data-action="copy-selector" data-text="${esc(sel.selector)}">Copy</button>`)],
      ["Width × height", `${sel.rect.width} × ${sel.rect.height} px`],
      ["Position (viewport)", `x ${sel.rect.x}, y ${sel.rect.y}`],
      ["Position (page)", `x ${sel.rect.pageX}, y ${sel.rect.pageY}`]
    ]) + computedTable(sel.computed) + `<div class="row"><button class="btn" data-action="copy-styles">Copy computed styles</button></div>`);
    if (s.pinned) h += card("Pinned element", kv([["Tag", s.pinned.tag], ["Selector", raw(`<span class="mono">${esc(s.pinned.selector)}</span>`)], ["Size", `${s.pinned.rect.width} × ${s.pinned.rect.height} px`]]));
    return h;
  }

  function viewSpacing() {
    const s = S.snap;
    const sel = s && s.selection;
    if (!sel) return card("Spacing", empty("Select an element in the Inspector first, then Shift+click a second element to measure."));
    const o = S.settings.overlay;
    const legend = `<div class="legend">
      <span><i class="swatch" style="background:${esc(o.margin)}"></i>Margin</span>
      <span><i class="swatch" style="background:${esc(o.padding)}"></i>Padding</span>
      <span><i class="swatch" style="background:${esc(o.content)}"></i>Content</span>
    </div>`;
    let h = card("Box model", kv([
      ["Margin (CSS)", sel.computed.margin],
      ["Padding (CSS)", sel.computed.padding],
      ["Border width (CSS)", sel.computed["border-width"]],
      ["Content box", `${sel.rect.width} × ${sel.rect.height} px (border box)`]
    ]) + `<div style="margin-top:8px">${legend}</div>`);
    if (!s.pinned) {
      h += card("Distance measurement", empty("Shift+click a second element while inspecting to measure the distance between them."));
      return h;
    }
    const sp = s.spacing;
    const gapText = (g) => (g == null ? "None on this axis" : `${g} px`);
    h += card("Distance between elements", kv([
      ["Pinned element", raw(`<span class="mono">${esc(s.pinned.selector)}</span>`)],
      ["Horizontal gap (bounding box)", sp ? (sp.bounding.overlap ? "Elements overlap" : gapText(sp.bounding.horizontalGap)) : "—"],
      ["Vertical gap (bounding box)", sp ? (sp.bounding.overlap ? "Elements overlap" : gapText(sp.bounding.verticalGap)) : "—"],
      ["Selected margin (declared CSS)", sp ? sp.css.selectedMargin : "—"],
      ["Pinned margin (declared CSS)", sp ? sp.css.pinnedMargin : "—"]
    ]) + `<p class="note">${esc(sp ? sp.note : "")}</p>
      <div class="row"><button class="btn" data-action="clear-measure">Clear measurements</button></div>`);
    return h;
  }

  function sweepTable() {
    if (!S.sweep) return "";
    const rows = S.sweep.map((r) => `<tr>
      <td>${esc(r.label)}</td>
      <td>${r.requested.width}×${r.requested.height}</td>
      <td>${r.actual.innerWidth}×${r.actual.innerHeight}${r.matches ? "" : " ⚠"}</td>
      <td>${r.counts.error}</td><td>${r.counts.warning}</td><td>${r.counts.info}</td></tr>`).join("");
    const details = S.sweep.filter((r) => r.counts.error + r.counts.warning > 0).map((r) => `
      <h3 style="margin-top:12px">${esc(r.label)}</h3>
      ${r.findings.filter((f) => f.severity !== "info").slice(0, 4).map((f) => `<div class="finding ${esc(f.severity)}">
        <span class="badge ${esc(f.severity)}">${esc(f.severity)}</span> <strong>${esc(label(f.category))}</strong>
        <p class="mono sel">${esc(f.selector || "—")}</p><p class="muted">${esc(f.explanation)}</p></div>`).join("")}`).join("");
    return `<div class="table-wrap"><table class="sweep">
      <tr><th>Preset</th><th>Requested</th><th>Actual</th><th>E</th><th>W</th><th>I</th></tr>${rows}</table></div>
      <p class="note">E = errors, W = warnings, I = info. ⚠ means the window could not match the requested viewport exactly.</p>${details}`;
  }

  function viewResponsive() {
    const t = S.test;
    const info = t
      ? kv([
          ["Status", "Open in a dedicated test window"],
          ["Requested", t.requested ? `${t.requested.width} × ${t.requested.height}` : "—"],
          ["Actual content viewport", t.actual ? `${t.actual.innerWidth} × ${t.actual.innerHeight} px` : "Apply a size to measure"],
          ["Match", t.actual ? (t.matches ? "Within 1 px" : "Differs; the OS or Chrome may limit window size") : "—"]
        ])
      : empty("No test window yet. Choose a size: UI Doctor opens a separate window and leaves your main window unchanged.");
    const orient = `<div class="row" role="group" aria-label="Orientation">
      <button class="chip" aria-pressed="${S.orientation === "portrait"}" data-action="orient" data-o="portrait">Portrait</button>
      <button class="chip" aria-pressed="${S.orientation === "landscape"}" data-action="orient" data-o="landscape">Landscape</button></div>`;
    const groups = ["Mobile", "Tablet", "Desktop"].map((g) => `<h3 style="margin-top:8px">${g}</h3><div class="row">${
      PRESETS.filter((p) => p.group === g).map((p) => `<button class="btn" data-action="apply-preset" data-id="${esc(p.id)}">${esc(p.label)}</button>`).join("")
    }</div>`).join("");
    const favs = S.customPresets.length
      ? `<div class="row">${S.customPresets.map((p, i) => `<span class="inline"><button class="btn" data-action="apply-fav" data-i="${i}">★ ${esc(p.label)}</button><button class="btn ghost" data-action="del-fav" data-i="${i}" aria-label="Delete favourite ${esc(p.label)}">✕</button></span>`).join("")}</div>`
      : empty("No favourites yet.");
    return card("Test window", info)
      + card("Presets", orient + groups)
      + card("Custom size", `<div class="inline">
          <label class="field" style="margin:0">Width<input type="number" id="cw" min="200" max="3840" value="${S.customW}"></label>
          <label class="field" style="margin:0">Height<input type="number" id="ch" min="200" max="3000" value="${S.customH}"></label>
        </div>
        <div class="row"><button class="btn primary" data-action="apply-custom">Apply size</button><button class="btn" data-action="save-fav">Save as favourite</button></div>
        <h3 style="margin-top:10px">Favourites</h3>${favs}`)
      + card("Breakpoint tests", `<div class="row">
          <button class="btn primary" data-action="sweep">Run all presets</button>
          <button class="btn" data-action="test-diag">Diagnose test window</button>
          <button class="btn danger" data-action="close-test">Close test window</button></div>
          <p class="note">Overflow diagnostics run at each size against the live layout. Device emulation (touch, pixel ratio, user agent) is not provided.</p>${sweepTable()}`);
  }

  function findingCard(f) {
    const canHighlight = !!f.selector;
    return `<article class="finding ${esc(f.severity)}">
      <div class="row" style="margin:0 0 4px"><span class="badge ${esc(f.severity)}">${esc(f.severity)}</span><strong>${esc(label(f.category))}</strong><span class="badge" style="background:var(--surface-2);color:var(--muted)">${esc(f.certainty)}</span></div>
      <p class="mono sel">${esc(f.tag)} · ${esc(f.selector || "—")}</p>
      ${f.measured ? `<p class="muted mono">${esc(Object.entries(f.measured).map(([k, v]) => `${k}: ${v}`).join(" · "))}${f.overflow != null ? ` · overflow: ${esc(f.overflow)} px` : ""}</p>` : ""}
      <p>${esc(f.explanation)}</p>
      <p class="muted"><strong>Likely cause:</strong> ${esc(f.cause)}</p>
      <p class="muted"><strong>Suggested CSS:</strong></p>
      <pre class="code">${esc(f.fix)}</pre>
      <p class="note"><strong>Possible side effects:</strong> ${esc(f.sideEffects)}</p>
      <div class="row">
        <button class="btn" data-action="copy-css" data-text="${esc(f.fix)}">Copy CSS</button>
        ${canHighlight ? `<button class="btn" data-action="highlight" data-id="${esc(f.id)}">Highlight element</button>` : ""}
      </div></article>`;
  }

  function viewDiagnostics() {
    const testNote = S.diagTabId && S.diagTabId !== S.tabId ? ' <span class="badge info">Test window</span>' : "";
    let h = card("Diagnostics", `<div class="row"><button class="btn primary" data-action="run-diag">Run diagnostics</button>${testNote}</div>
      <p class="note">Heuristic checks run locally. Items marked “potential” or “heuristic” are things to review, not confirmed bugs.</p>`);
    if (!S.diag) return h + empty("Run diagnostics to scan the current page.");
    h += `<div class="row">${SEVERITIES.map((sev) => `<button class="chip" aria-pressed="${S.filters[sev]}" data-action="filter" data-sev="${sev}">${sev} (${countSev(sev)})</button>`).join("")}</div>`;
    const shown = S.diag.findings.filter((f) => S.filters[f.severity]);
    h += shown.length ? shown.map(findingCard).join("") : empty("No findings match the current filters.");
    return h;
  }

  function typographyRows(t) {
    return TYPO_KEYS.map((k) => [k, t ? t[k] : "—"]);
  }

  function viewTypography() {
    const s = S.snap;
    if (!s || !s.selection) return card("Typography", empty("Select a text element in the Inspector."));
    const t = s.typography;
    let h = card("Typography", kv(typographyRows(t)) + `<div class="row">
      <button class="btn" data-action="copy-typo">Copy typography CSS</button>
      <button class="btn" data-action="recheck">Re-check text clipping</button></div>`);
    const c = t.clip;
    h += card("Text clipping", `<p>${c.checked ? (c.clipped ? '<span class="badge warning">Clipped</span>' : '<span class="badge ok">OK</span>') : ""} ${esc(c.note)}</p>`);
    if (s.pinned && s.pinnedTypography) {
      const p = s.pinnedTypography;
      const rows = TYPO_KEYS.map((k) => [k, raw(t[k] === p[k]
        ? esc(t[k])
        : `<span style="color:var(--warn)">${esc(t[k])}</span> ↔ ${esc(p[k])}`)]);
      h += card("Compare with pinned element", kv(rows));
    }
    return h;
  }

  function viewColors() {
    const s = S.snap;
    if (!s || !s.selection) return card("Color & contrast", empty("Select a text element in the Inspector."));
    const c = s.contrast;
    if (!c || c.unable) {
      return card("Color & contrast", `<p><strong>Unable to determine accurately.</strong></p><p class="muted">${esc(c ? c.reason : "No colour data.")}</p><p class="note">UI Doctor does not guess WCAG results when the background cannot be measured reliably.</p>`);
    }
    const pf = (r) => `<span class="badge ${r.pass ? "ok" : "fail"}">${r.pass ? "Pass" : "Fail"}</span>`;
    return card("Colors", `<div class="grid2">
        <div><h3>Text</h3><p><span class="swatch" style="background:${esc(c.text.hex)}"></span>${esc(c.text.hex)}</p><p class="muted">${esc(c.text.rgb)}</p>
          <div class="row"><button class="btn" data-action="copy-hex" data-v="${esc(c.text.hex)}">Copy HEX</button><button class="btn" data-action="copy-hex" data-v="${esc(c.text.rgb)}">Copy RGB</button></div></div>
        <div><h3>Background</h3><p><span class="swatch" style="background:${esc(c.background.hex)}"></span>${esc(c.background.hex)}</p><p class="muted">${esc(c.background.rgb)}</p>
          <div class="row"><button class="btn" data-action="copy-hex" data-v="${esc(c.background.hex)}">Copy HEX</button><button class="btn" data-action="copy-hex" data-v="${esc(c.background.rgb)}">Copy RGB</button></div></div>
      </div>`)
      + card("Contrast ratio", `<p class="strong" style="font-size:20px">${esc(c.ratio)} : 1</p>
        <p class="muted">${c.large ? "Treated as large text." : "Treated as normal text."}</p>
        ${kv([
          [`AA (≥ ${c.aa.threshold}:1)`, raw(pf(c.aa))],
          [`AAA (≥ ${c.aaa.threshold}:1)`, raw(pf(c.aaa))]
        ])}
        ${c.assumedCanvas ? '<p class="note">No opaque background was found, so the browser’s default white canvas was assumed.</p>' : ""}
        <p class="note">${esc(c.note)}</p>`);
  }

  function viewPlayground() {
    const sel = S.snap && S.snap.selection;
    if (!sel) return card("CSS playground", empty("Select an element in the Inspector first. Changes are temporary and reset on reload."));
    const options = PLAY_PROPS.map((p) => `<option value="${esc(p)}" ${p === S.pg.prop ? "selected" : ""}>${esc(p)}</option>`).join("");
    const list = S.playList.length
      ? S.playList.map((c) => `<li style="margin:6px 0">
          <div class="mono">${esc(c.prop)}: ${esc(c.value)}${c.important ? " !important" : ""}</div>
          <div class="muted mono">${esc(c.selector)}</div>
          <button class="btn ghost" data-action="pg-undo" data-i="${c.index}">Undo</button></li>`).join("")
      : empty("No temporary changes yet.");
    return card("CSS playground", `<p class="muted">Target: <span class="mono">${esc(sel.selector)}</span></p>
      <div class="inline">
        <label class="field" style="margin:0">Property<select id="pgProp" data-pg="prop">${options}</select></label>
        <label class="field" style="margin:0">Value<input type="text" id="pgValue" data-pg="value" value="${esc(S.pg.value)}" placeholder="e.g. 16px"></label>
      </div>
      <label class="inline" style="margin:8px 0"><input type="checkbox" id="pgImp" data-pg="important" ${S.pg.important ? "checked" : ""}> Use !important (overrides stylesheet rules)</label>
      <div class="row"><button class="btn primary" data-action="pg-apply">Apply change</button><button class="btn" data-action="pg-copy">Copy CSS</button><button class="btn danger" data-action="pg-reset">Reset all</button></div>
      <h3 style="margin-top:10px">Changes</h3><ul style="padding-left:0;list-style:none;margin:0">${list}</ul>
      <p class="note">Limitations: changes are inline styles on this element only. Without !important, a stylesheet rule with higher specificity or a !important rule still wins. Changes never edit the site’s files and are lost on reload.</p>`);
  }

  function buildReport() {
    const d = S.diag;
    const counts = { error: 0, warning: 0, info: 0 };
    d.findings.forEach((f) => { counts[f.severity] += 1; });
    return {
      tool: "UI Doctor",
      version: chrome.runtime.getManifest().version,
      generatedAt: new Date().toISOString(),
      page: { url: d.url, title: d.title },
      testedViewport: d.viewport,
      totals: { total: d.findings.length, ...counts },
      findings: d.findings.map((f) => ({
        severity: f.severity, certainty: f.certainty, category: f.category,
        element: { tag: f.tag, selector: f.selector },
        measured: f.measured || null, overflowPx: f.overflow ?? null,
        explanation: f.explanation, likelyCause: f.cause,
        suggestedCss: f.fix, possibleSideEffects: f.sideEffects
      })),
      privacyNote: "Reports may contain the page URL, title, selectors and text or other information from the inspected website. Review before sharing."
    };
  }

  function reportHtml(r) {
    const e = esc;
    const groups = SEVERITIES.map((sev) => {
      const items = r.findings.filter((f) => f.severity === sev);
      if (!items.length) return "";
      return `<h2>${e(sev[0].toUpperCase() + sev.slice(1))} (${items.length})</h2>` + items.map((f) => `
        <div class="f ${e(f.severity)}">
          <p><strong>${e(label(f.category))}</strong> · ${e(f.certainty)}</p>
          <p class="mono">${e(f.element.tag)} · ${e(f.element.selector || "—")}</p>
          ${f.measured ? `<p class="mono">${e(Object.entries(f.measured).map(([k, v]) => `${k}: ${v}`).join(" · "))}</p>` : ""}
          <p>${e(f.explanation)}</p>
          <p><strong>Likely cause:</strong> ${e(f.likelyCause)}</p>
          <p><strong>Suggested CSS:</strong></p><pre>${e(f.suggestedCss)}</pre>
          <p><strong>Possible side effects:</strong> ${e(f.possibleSideEffects)}</p>
        </div>`).join("");
    }).join("");
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'">
<title>UI Doctor report — ${e(r.page.title || r.page.url)}</title>
<style>body{font:14px/1.5 system-ui,sans-serif;max-width:900px;margin:24px auto;padding:0 16px;color:#0F172A}
h1{font-size:22px}.f{border-left:4px solid #94A3B8;padding:8px 12px;margin:10px 0;background:#F8FAFC}
.f.error{border-color:#EF4444}.f.warning{border-color:#F59E0B}.f.info{border-color:#0E7490}
pre{background:#EEF2F9;padding:8px;white-space:pre-wrap;word-break:break-word}.mono{font-family:ui-monospace,monospace;font-size:12px;word-break:break-all}
.warn{background:#FEF3C7;padding:8px 12px;border-radius:8px}</style></head><body>
<h1>UI Doctor report</h1>
<p><strong>Page:</strong> ${e(r.page.title)}<br><span class="mono">${e(r.page.url)}</span></p>
<p><strong>Generated:</strong> ${e(new Date(r.generatedAt).toLocaleString())}<br>
<strong>Tested viewport:</strong> ${e(r.testedViewport.innerWidth)} × ${e(r.testedViewport.innerHeight)} px (content ${e(r.testedViewport.clientWidth)} px)</p>
<p><strong>Totals:</strong> ${e(r.totals.total)} findings — ${e(r.totals.error)} errors, ${e(r.totals.warning)} warnings, ${e(r.totals.info)} info.</p>
<p class="warn">${e(r.privacyNote)}</p>
<p><em>Heuristic findings are potential issues to review, not confirmed defects.</em></p>
${groups || "<p>No findings.</p>"}
<hr><p>Generated by UI Doctor ${e(r.version)} · Developer: Ruslan Sharifov · Local analysis only.</p></body></html>`;
  }

  function viewReports() {
    if (!S.diag) return card("Reports", empty("Run diagnostics first. Reports include findings, selectors, measurements and suggested fixes."));
    const d = S.diag;
    return card("Diagnostic report", kv([
      ["Page", d.title || d.url],
      ["Generated", new Date(d.generatedAt).toLocaleString()],
      ["Tested viewport", `${d.viewport.innerWidth} × ${d.viewport.innerHeight} px`],
      ["Totals", `${d.findings.length} findings (${countSev("error")} errors, ${countSev("warning")} warnings, ${countSev("info")} info)`]
    ]) + `<div class="row">
        <button class="btn primary" data-action="export-json">Export JSON</button>
        <button class="btn" data-action="export-html">Export HTML</button>
        <button class="btn" data-action="copy-summary">Copy summary</button></div>
      <p class="note">Reports may contain page URLs, titles, selectors and text from the inspected website. Review before sharing. No personal data is added.</p>`);
  }

  function viewSettings() {
    const s = S.settings;
    const sel = (name, options, value) => `<select data-setting="${name}">${options.map(([v, t]) => `<option value="${esc(v)}" ${v === value ? "selected" : ""}>${esc(t)}</option>`).join("")}</select>`;
    const presetOpts = PRESETS.map((p) => [p.id, p.label]);
    return card("Appearance", `
      <label class="field">Language ${sel("language", [["en", "English"], ["de", "Deutsch"], ["tr", "Türkçe"], ["fr", "Français"]], s.language || "en")}</label>
      <label class="field">Theme ${sel("theme", [["system", "System"], ["light", "Light"], ["dark", "Dark"]], s.theme)}</label>
      <label class="field">Animations ${sel("motion", [["system", "Follow system"], ["reduce", "Reduce"], ["full", "Full"]], s.motion)}</label>
      <label class="field">Measurement units ${sel("units", [["px", "Pixels (px)"], ["rem", "rem (16px base)"]], s.units)}</label>`)
      + card("Responsive Lab", `<label class="field">Default preset ${sel("defaultPreset", presetOpts, s.defaultPreset)}</label>`)
      + card("Overlay colours", `<div class="grid2">
          <label class="field">Margin <input type="color" data-setting="overlay.margin" value="${esc(s.overlay.margin)}"></label>
          <label class="field">Padding <input type="color" data-setting="overlay.padding" value="${esc(s.overlay.padding)}"></label>
          <label class="field">Content <input type="color" data-setting="overlay.content" value="${esc(s.overlay.content)}"></label></div>`)
      + card("Diagnostic severity filters", SEVERITIES.map((sev) => `<label class="inline" style="margin:4px 0"><input type="checkbox" data-setting="severity.${sev}" ${s.severity[sev] ? "checked" : ""}> ${esc(sev[0].toUpperCase() + sev.slice(1))}</label>`).join(""))
      + card("Reset", `<p class="muted">Restores defaults for appearance, presets, colours and filters. Saved favourites are kept.</p><button class="btn danger" data-action="reset-settings">Reset settings</button>`);
  }

  function viewAbout() {
    const v = chrome.runtime.getManifest().version;
    return card("UI Doctor", `<p class="strong">Inspect. Diagnose. Perfect your UI.</p>
      <p class="muted">Version ${esc(v)} · Developed by Ruslan Sharifov</p>
      <div class="linklist">
        <a href="https://github.com/RuslanSharifov" target="_blank" rel="noopener noreferrer">GitHub profile</a>
        <a href="https://github.com/RuslanSharifov/chrome-ui-gallery" target="_blank" rel="noopener noreferrer">Repository: chrome-ui-gallery</a>
        <a href="https://ruslansharifov.github.io/chrome-ui-gallery/" target="_blank" rel="noopener noreferrer">Chrome UI Gallery</a>
      </div>`)
      + card("Privacy", `<p class="muted">All analysis runs locally in your browser. UI Doctor has no telemetry, analytics or remote AI services, and it does not collect credentials or browsing history. It reads the page only after you start a feature. Settings and recent results are stored in Chrome storage on this device.</p>`);
  }

  const VIEWS = {
    overview: viewOverview, inspector: viewInspector, spacing: viewSpacing, responsive: viewResponsive,
    diagnostics: viewDiagnostics, typography: viewTypography, colors: viewColors,
    playground: viewPlayground, reports: viewReports, settings: viewSettings, about: viewAbout
  };

  function render() {
    const main = $("#content");
    main.innerHTML = VIEWS[S.screen]();
    document.querySelectorAll("#nav .tab").forEach((b) => {
      if (b.dataset.screen === S.screen) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
    });
    setLive(S.snap && S.snap.inspecting ? "Inspecting" : "");
    UD_I18N.apply(document, S.settings.language || "en");
  }

  async function show(screen) {
    S.screen = screen;
    if (screen === "playground") await loadPlayList();
    if (screen === "responsive") await loadTest();
    render();
    $("#content").scrollTop = 0;
  }

  async function loadTest() {
    S.test = await bgCall({ type: "BG_TEST_STATE" }).catch(() => null);
  }

  /* ---------- actions ---------- */
  const ACTIONS = {
    async "toggle-inspect"() {
      try {
        const d = await tabCall({ type: "UD_TOGGLE_INSPECT" });
        toast(d.inspecting ? "Inspecting. Esc to stop." : "Inspection stopped.");
        await refreshSnapshot();
      } catch (e) { toast(e.message); }
    },
    async clear() {
      try { await tabCall({ type: "UD_CLEAR" }); await refreshSnapshot(); } catch (e) { toast(e.message); }
    },
    async "clear-measure"() {
      try { await tabCall({ type: "UD_CLEAR_MEASURE" }); await refreshSnapshot(); } catch (e) { toast(e.message); }
    },
    async "run-diag"() {
      setLive("Running diagnostics…");
      try {
        S.diag = await tabCall({ type: "UD_DIAGNOSE" });
        S.diagTabId = S.tabId;
        await UD.pushRecent({ url: S.diag.url, title: S.diag.title, at: S.diag.generatedAt, errors: countSev("error"), warnings: countSev("warning"), info: countSev("info") });
        await loadRecent();
        toast(`${S.diag.findings.length} findings in ${S.diag.durationMs} ms.`);
        if (S.screen !== "diagnostics") S.screen = "diagnostics";
      } catch (e) { toast(e.message); }
      setLive("");
      render();
    },
    async highlight(el) {
      try {
        await tabCall({ type: "UD_HIGHLIGHT", id: el.dataset.id }, S.diagTabId || S.tabId);
      } catch (e) { toast(e.message); }
    },
    filter(el) {
      const sev = el.dataset.sev;
      S.filters[sev] = !S.filters[sev];
      render();
    },
    copy(el) { copyText(el.dataset.text, "Copied"); },
    "copy-selector"(el) { copyText(el.dataset.text, "Selector copied"); },
    "copy-css"(el) { copyText(el.dataset.text, "Suggested CSS copied"); },
    "copy-hex"(el) { copyText(el.dataset.v, "Colour copied"); },
    "copy-styles"() {
      const sel = S.snap && S.snap.selection;
      if (!sel) return;
      const body = Object.entries(sel.computed).filter(([, v]) => v).map(([k, v]) => `  ${k}: ${v};`).join("\n");
      copyText(`${sel.selector} {\n${body}\n}`, "Computed styles copied");
    },
    "copy-typo"() {
      const s = S.snap;
      if (!s || !s.typography) return;
      const body = TYPO_KEYS.map((k) => `  ${k}: ${s.typography[k]};`).join("\n");
      copyText(`${s.selection.selector} {\n${body}\n}`, "Typography CSS copied");
    },
    async recheck() {
      await refreshSnapshot();
      toast(S.snap && S.snap.typography ? `Clipping: ${S.snap.typography.clip.note}` : "Select a text element first.");
    },
    go(el) { show(el.dataset.screen); },
    async grant() {
      if (!S.url) return toast("Open a web page first.");
      const granted = await chrome.permissions.request({ origins: [UD.originPattern(S.url)] }).catch(() => false);
      if (granted) await refreshSnapshot(); else toast("Access was not granted.");
    },

    /* Responsive Lab */
    orient(el) { S.orientation = el.dataset.o; render(); },
    "apply-preset"(el) {
      const p = PRESETS.find((x) => x.id === el.dataset.id);
      if (p) applySize(S.orientation === "landscape" ? p.h : p.w, S.orientation === "landscape" ? p.w : p.h, p.label);
    },
    "apply-custom"() {
      const w = Number($("#cw").value), h = Number($("#ch").value);
      if (!(w >= 200 && w <= 3840 && h >= 200 && h <= 3000)) return toast("Use 200–3840 px wide and 200–3000 px high.");
      S.customW = w; S.customH = h;
      applySize(w, h, `${w} × ${h}`);
    },
    "save-fav"() {
      const w = Number($("#cw").value), h = Number($("#ch").value);
      if (!(w >= 200 && h >= 200)) return toast("Enter a valid size first.");
      S.customPresets = [...S.customPresets, { label: `${w} × ${h}`, w, h }].slice(-12);
      chrome.storage.local.set({ customPresets: S.customPresets });
      toast("Saved to favourites.");
      render();
    },
    "apply-fav"(el) { const p = S.customPresets[Number(el.dataset.i)]; if (p) applySize(p.w, p.h, p.label); },
    "del-fav"(el) {
      S.customPresets = S.customPresets.filter((_, i) => i !== Number(el.dataset.i));
      chrome.storage.local.set({ customPresets: S.customPresets });
      render();
    },
    async sweep() {
      setLive("Running breakpoint tests…");
      try {
        if (!S.test) await applySize(PRESETS[0].w, PRESETS[0].h, PRESETS[0].label, true);
        S.sweep = await bgCall({ type: "BG_SWEEP", presets: PRESETS, orientation: S.orientation });
        toast("Breakpoint tests finished.");
      } catch (e) { toast(e.message); }
      setLive("");
      render();
    },
    async "test-diag"() {
      try {
        S.diag = await bgCall({ type: "BG_TEST_DIAG" });
        S.diagTabId = S.test ? S.test.tabId : null;
        S.screen = "diagnostics";
        toast(`${S.diag.findings.length} findings in the test window.`);
        render();
      } catch (e) { toast(e.message); }
    },
    async "close-test"() {
      await bgCall({ type: "BG_CLOSE_TEST" }).catch(() => {});
      S.test = null;
      S.sweep = null;
      toast("Test window closed. Your main window was never resized.");
      render();
    },

    /* Playground */
    async "pg-apply"() {
      const prop = $("#pgProp").value, value = S.pg.value, important = S.pg.important;
      try {
        S.playList = await tabCall({ type: "UD_PLAY_APPLY", prop, value, important });
        await refreshSnapshot();
        toast("Change applied (temporary).");
      } catch (e) { toast(e.message); }
    },
    async "pg-undo"(el) {
      try { S.playList = await tabCall({ type: "UD_PLAY_UNDO", index: Number(el.dataset.i) }); render(); }
      catch (e) { toast(e.message); }
    },
    async "pg-reset"() {
      try { S.playList = await tabCall({ type: "UD_PLAY_RESET" }); render(); toast("Temporary changes reset."); }
      catch (e) { toast(e.message); }
    },
    "pg-copy"() {
      const sel = S.snap && S.snap.selection;
      if (!sel || !S.playList.length) return toast("No changes to copy.");
      const body = S.playList.map((c) => `  ${c.prop}: ${c.value}${c.important ? " !important" : ""};`).join("\n");
      copyText(`${sel.selector} {\n${body}\n}`, "CSS copied");
    },

    /* Reports */
    "export-json"() {
      if (!S.diag) return;
      download(`ui-doctor-report-${stamp()}.json`, "application/json", JSON.stringify(buildReport(), null, 2));
    },
    "export-html"() {
      if (!S.diag) return;
      download(`ui-doctor-report-${stamp()}.html`, "text/html", reportHtml(buildReport()));
    },
    "copy-summary"() {
      if (!S.diag) return;
      const r = buildReport();
      const lines = [
        `UI Doctor summary — ${r.page.title || r.page.url}`,
        `${r.generatedAt} · viewport ${r.testedViewport.innerWidth}×${r.testedViewport.innerHeight}`,
        `Findings: ${r.totals.total} (errors ${r.totals.error}, warnings ${r.totals.warning}, info ${r.totals.info})`,
        ...r.findings.filter((f) => f.severity !== "info").slice(0, 10).map((f) => `- [${f.severity}] ${label(f.category)}: ${f.element.selector || "—"}`)
      ];
      copyText(lines.join("\n"), "Summary copied");
    },

    /* Settings */
    async "reset-settings"() {
      S.settings = { ...UD.DEFAULTS };
      await chrome.storage.local.set({ settings: S.settings });
      S.filters = { ...UD.DEFAULTS.severity };
      applyTheme();
      toast("Settings reset to defaults.");
      render();
    }
  };

  async function applySize(w, h, name, quiet = false) {
    const url = S.url;
    if (!url) return toast("Open a web page first.");
    // Permission prompt must stay within the click gesture: call it before any other await.
    const granted = await chrome.permissions.request({ origins: [UD.originPattern(url)] }).catch(() => false);
    if (!granted) return toast("Site access is needed to open the test window.");
    setLive(`Sizing test window to ${name}…`);
    try {
      S.test = await bgCall({ type: "BG_OPEN_TEST", url, width: w, height: h });
      if (!quiet) toast(`Test window: ${S.test.actual.innerWidth} × ${S.test.actual.innerHeight} px${S.test.matches ? "" : " (adjusted)"}.`);
    } catch (e) {
      toast(e.message);
    }
    setLive("");
    if (S.screen === "responsive") render();
  }

  /* ---------- settings persistence ---------- */
  function setPath(obj, path, value) {
    const keys = path.split(".");
    let node = obj;
    keys.slice(0, -1).forEach((k) => { node[k] = { ...(node[k] || {}) }; node = node[k]; });
    node[keys[keys.length - 1]] = value;
  }

  async function onSettingChange(target) {
    const name = target.dataset.setting;
    const value = target.type === "checkbox" ? target.checked : target.value;
    setPath(S.settings, name, value);
    if (name.startsWith("severity.")) S.filters = { ...S.settings.severity };
    await chrome.storage.local.set({ settings: S.settings });
    applyTheme();
    if (name === "language") { render(); return; }
    if (name.startsWith("severity.") && S.screen === "diagnostics") render();
  }

  /* ---------- wiring ---------- */
  function bind() {
    document.addEventListener("click", (e) => {
      const nav = e.target.closest("#nav [data-screen]");
      if (nav) { show(nav.dataset.screen); return; }
      const el = e.target.closest("[data-action]");
      if (!el) return;
      const fn = ACTIONS[el.dataset.action];
      if (fn) fn(el, e);
    });
    document.addEventListener("change", (e) => {
      if (e.target.dataset && e.target.dataset.setting) onSettingChange(e.target);
      if (e.target.id === "pgProp") S.pg.prop = e.target.value;
      if (e.target.dataset && e.target.dataset.pg === "important") S.pg.important = e.target.checked;
    });
    document.addEventListener("input", (e) => {
      const t = e.target;
      if (t.dataset && t.dataset.pg === "value") S.pg.value = t.value;
      if (t.id === "cw") S.customW = Number(t.value) || S.customW;
      if (t.id === "ch") S.customH = Number(t.value) || S.customH;
    });
    chrome.runtime.onMessage.addListener((msg, sender) => {
      if (msg && msg.type === "UD_EVENT" && sender.tab && sender.tab.id === S.tabId) {
        S.snap = msg.payload;
        S.url = msg.payload.url;
        S.error = "";
        if (LIVE.includes(S.screen)) render();
        else setLive(msg.payload.inspecting ? "Inspecting" : "");
      }
    });
    chrome.tabs.onActivated.addListener(async (info) => {
      S.tabId = info.tabId;
      S.diag = null;
      S.sweep = null;
      await refreshSnapshot();
    });
    chrome.tabs.onRemoved.addListener((id) => {
      if (id === S.tabId) { S.snap = null; S.error = "This tab was closed."; render(); }
    });
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "session" && changes.pendingScreen && changes.pendingScreen.newValue) {
        const next = changes.pendingScreen.newValue;
        chrome.storage.session.remove("pendingScreen");
        show(next);
      }
    });
    matchMedia("(prefers-color-scheme: light)").addEventListener("change", () => { if (S.settings.theme === "system") applyTheme(); });
  }

  async function init() {
    S.settings = await UD.getSettings();
    S.filters = { ...S.settings.severity };
    S.pg.prop = PLAY_PROPS[0];
    applyTheme();
    UD_I18N.apply(document, S.settings.language || "en");
    await loadRecent();
    const pending = (await chrome.storage.session.get("pendingScreen")).pendingScreen;
    if (pending) { S.screen = pending; chrome.storage.session.remove("pendingScreen"); }
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    S.tabId = tab ? tab.id : null;
    S.customPresets = (await chrome.storage.local.get("customPresets")).customPresets || [];
    await loadTest();
    bind();
    await refreshSnapshot();
    if (S.screen === "responsive") render();
    if (S.screen !== "overview") await show(S.screen);
  }

  init();
})();

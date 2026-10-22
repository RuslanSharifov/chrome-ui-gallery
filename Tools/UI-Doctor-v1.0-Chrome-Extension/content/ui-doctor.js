/* UI Doctor — page engine (content script).
 * Injected on demand (activeTab / optional host permission). Idempotent.
 * Overlays live in one fixed, pointer-events:none root that is removed on clear.
 * Nothing here edits the page's source; playground changes are inline styles that
 * are restored on undo/reset. All analysis runs locally.
 */
(() => {
  "use strict";
  if (window.__UI_DOCTOR_LOADED__) return;
  window.__UI_DOCTOR_LOADED__ = true;

  const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "LINK", "META", "NOSCRIPT", "TEMPLATE", "BR", "TITLE", "HEAD", "HTML"]);
  const BLOCK_TAGS = new Set(["DIV", "SECTION", "MAIN", "ARTICLE", "FORM", "HEADER", "FOOTER", "NAV", "UL", "OL", "TABLE"]);
  const MEDIA_TAGS = new Set(["IMG", "VIDEO", "CANVAS", "SVG", "IFRAME", "PICTURE", "OBJECT", "EMBED"]);
  const INTERACTIVE = "a[href],button,input:not([type=hidden]),select,textarea,summary,[role=button],[role=link],[role=checkbox],[role=radio],[role=tab],[role=menuitem],[onclick]";
  const MAX_NODES = 8000;
  const MAX_FINDINGS = 300;
  const PLAY_PROPS = ["margin", "padding", "width", "max-width", "min-width", "height", "font-size", "line-height", "letter-spacing", "color", "background-color", "border-radius", "gap", "display", "text-align", "white-space", "overflow-wrap", "flex-wrap", "justify-content", "align-items", "opacity"];
  const INSPECT_PROPS = ["display", "position", "box-sizing", "border-radius", "background-color", "color", "font-family", "font-size", "font-weight", "line-height", "z-index", "overflow-x", "overflow-y", "text-align", "letter-spacing", "white-space", "word-break", "overflow-wrap", "opacity", "transform"];
  const FLEX_PROPS = ["flex-direction", "flex-wrap", "justify-content", "align-items", "gap", "flex-basis", "flex-grow", "flex-shrink"];
  const GRID_PROPS = ["grid-template-columns", "grid-template-rows", "grid-auto-flow", "justify-items", "align-items", "gap"];
  const TYPO_PROPS = ["font-family", "font-size", "font-weight", "line-height", "letter-spacing", "text-align", "text-transform", "text-decoration-line", "color", "white-space", "word-break", "overflow-wrap"];

  const state = {
    inspecting: false,
    selected: null,
    pinned: null,
    hover: null,
    flash: null,
    flashTimer: 0,
    mouse: null,
    raf: 0,
    emitRaf: 0,
    root: null,
    history: [],
    findings: new Map(),
    colors: { margin: "#F59E0B", padding: "#22C55E", content: "#22D3EE", border: "#8B5CF6", hover: "#8B5CF6", pinned: "#E879F9" }
  };

  /* ---------- small helpers ---------- */
  const px = (v) => parseFloat(v) || 0;
  const fx = (v) => Math.round(v * 10) / 10;
  const rectOf = (node) => {
    const r = node.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height, right: r.right, bottom: r.bottom };
  };
  const sides = (cs, base, suffix = "") => ({
    t: px(cs[base + "Top" + suffix]), r: px(cs[base + "Right" + suffix]),
    b: px(cs[base + "Bottom" + suffix]), l: px(cs[base + "Left" + suffix])
  });
  const sidesText = (cs, base) => {
    const s = sides(cs, base);
    return `${fx(s.t)}px ${fx(s.r)}px ${fx(s.b)}px ${fx(s.l)}px`;
  };
  const hasDirectText = (node) => [...node.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
  const longWord = (node) => [...node.childNodes].some((n) => n.nodeType === 3 && /\S{40,}/.test(n.textContent));
  const inHiddenSubtree = (node) => {
    for (let n = node; n && n !== document.documentElement; n = n.parentElement) {
      if (n.hidden || n.getAttribute("aria-hidden") === "true" || (n.tagName === "DIALOG" && !n.open)) return true;
    }
    return false;
  };
  const nearestClipper = (node) => {
    for (let n = node.parentElement; n && n !== document.documentElement; n = n.parentElement) {
      const ov = getComputedStyle(n).overflowX;
      if (/hidden|clip|auto|scroll/.test(ov)) return { el: n, scroll: /auto|scroll/.test(ov) };
    }
    return null;
  };
  const flaggedAncestor = (node, flagged) => {
    for (let n = node.parentElement; n; n = n.parentElement) if (flagged.has(n)) return true;
    return false;
  };

  /* ---------- selectors & descriptions ---------- */
  function selectorOf(node) {
    if (!node || node.nodeType !== 1) return "";
    if (node.id && /^[A-Za-z][\w-]*$/.test(node.id)) {
      const s = "#" + CSS.escape(node.id);
      if (document.querySelectorAll(s).length === 1) return s;
    }
    const parts = [];
    let cur = node;
    while (cur && cur.nodeType === 1 && cur !== document.documentElement && parts.length < 10) {
      let part = cur.tagName.toLowerCase();
      const cls = [...cur.classList].filter((c) => /^[A-Za-z_-][\w-]*$/.test(c)).slice(0, 2);
      if (cls.length) part += "." + cls.map((c) => CSS.escape(c)).join(".");
      const parent = cur.parentElement;
      if (parent) {
        const sibs = [...parent.children].filter((c) => c.tagName === cur.tagName);
        if (sibs.length > 1) part += `:nth-of-type(${sibs.indexOf(cur) + 1})`;
      }
      parts.unshift(part);
      const sel = parts.join(" > ");
      if (document.querySelectorAll(sel).length === 1) return sel;
      cur = parent;
    }
    return parts.join(" > ");
  }

  function describe(node) {
    let s = node.tagName.toLowerCase();
    if (node.id) s += "#" + node.id;
    const cls = [...node.classList].slice(0, 2);
    if (cls.length) s += "." + cls.join(".");
    return s;
  }

  /* ---------- overlay rendering (never changes layout: fixed, pointer-events:none) ---------- */
  function ensureRoot() {
    if (state.root && state.root.isConnected) return state.root;
    const host = document.documentElement;
    if (!host) return null;
    const r = document.createElement("div");
    r.id = "ud-overlay-root";
    r.style.cssText = "all:initial;position:fixed;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:2147483647;";
    host.appendChild(r);
    state.root = r;
    return r;
  }

  function el(tag, css, text) {
    const d = document.createElement(tag);
    d.style.cssText = "all:initial;position:absolute;box-sizing:border-box;pointer-events:none;" + css;
    if (text != null) d.textContent = text;
    return d;
  }
  const fillBox = (r, color, alpha) => el("div",
    `left:${r.left}px;top:${r.top}px;width:${Math.max(0, r.width)}px;height:${Math.max(0, r.height)}px;background:${color}${alpha};`);
  const outlineBox = (r, color, dashed) => el("div",
    `left:${r.left}px;top:${r.top}px;width:${Math.max(0, r.width)}px;height:${Math.max(0, r.height)}px;border:1.5px ${dashed ? "dashed" : "solid"} ${color};`);
  const labelEl = (text, x, y, bg, fg) => el("div",
    `left:${x}px;top:${y}px;background:${bg};color:${fg};font:600 11px/1.35 ui-monospace,Menlo,Consolas,monospace;padding:2px 6px;border-radius:4px;white-space:pre;`, text);

  function tooltip(node, add) {
    const r = rectOf(node);
    const cs = getComputedStyle(node);
    const text = `${describe(node)}\n${fx(r.width)} × ${fx(r.height)} px · x ${Math.round(r.left)}, y ${Math.round(r.top)}\n${cs.display} · position: ${cs.position}`;
    const left = Math.min(Math.max(4, r.left), Math.max(4, window.innerWidth - 260));
    const top = r.top > 70 ? r.top - 62 : Math.min(window.innerHeight - 64, r.bottom + 6);
    add(labelEl(text, left, Math.max(4, top), "#0B1020", "#F8FAFC"));
  }

  function boxModel(node, add) {
    const C = state.colors;
    const cs = getComputedStyle(node);
    const r = rectOf(node);
    const m = sides(cs, "margin");
    const p = sides(cs, "padding");
    const b = sides(cs, "border", "Width");
    add(fillBox({ left: r.left - m.l, top: r.top - m.t, width: r.width + m.l + m.r, height: r.height + m.t + m.b }, C.margin, "33"));
    const pad = { left: r.left + b.l, top: r.top + b.t, width: r.width - b.l - b.r, height: r.height - b.t - b.b };
    add(fillBox(pad, C.padding, "3D"));
    add(fillBox({ left: pad.left + p.l, top: pad.top + p.t, width: pad.width - p.l - p.r, height: pad.height - p.t - p.b }, C.content, "4D"));
    add(outlineBox(r, C.border, false));
  }

  function spacingBetween(a, b) {
    const out = { overlap: false, horizontal: null, vertical: null };
    const yA = Math.max(a.top, b.top), yB = Math.min(a.bottom, b.bottom);
    const xA = Math.max(a.left, b.left), xB = Math.min(a.right, b.right);
    const yMid = yB > yA ? (yA + yB) / 2 : (a.top + a.bottom + b.top + b.bottom) / 4;
    const xMid = xB > xA ? (xA + xB) / 2 : (a.left + a.right + b.left + b.right) / 4;
    if (b.left >= a.right) out.horizontal = { gap: b.left - a.right, x1: a.right, x2: b.left, y: yMid };
    else if (a.left >= b.right) out.horizontal = { gap: a.left - b.right, x1: b.right, x2: a.left, y: yMid };
    if (b.top >= a.bottom) out.vertical = { gap: b.top - a.bottom, y1: a.bottom, y2: b.top, x: xMid };
    else if (a.top >= b.bottom) out.vertical = { gap: a.top - b.bottom, y1: b.bottom, y2: a.top, x: xMid };
    out.overlap = !out.horizontal && !out.vertical;
    return out;
  }

  function spacingLines(add) {
    const C = state.colors;
    const s = spacingBetween(rectOf(state.selected), rectOf(state.pinned));
    if (s.horizontal) {
      const h = s.horizontal;
      add(el("div", `left:${h.x1}px;top:${h.y}px;width:${h.x2 - h.x1}px;height:0;border-top:1px dashed ${C.pinned};`));
      add(labelEl(`↔ ${fx(h.gap)} px`, (h.x1 + h.x2) / 2 - 24, h.y - 18, C.pinned, "#0B1020"));
    }
    if (s.vertical) {
      const v = s.vertical;
      add(el("div", `left:${v.x}px;top:${v.y1}px;width:0;height:${v.y2 - v.y1}px;border-left:1px dashed ${C.pinned};`));
      add(labelEl(`↕ ${fx(v.gap)} px`, v.x + 6, (v.y1 + v.y2) / 2 - 8, C.pinned, "#0B1020"));
    }
  }

  function render() {
    const root = ensureRoot();
    if (!root) return;
    root.replaceChildren();
    const add = (node) => root.appendChild(node);
    const C = state.colors;
    if (state.inspecting && state.hover && state.hover.isConnected && state.hover !== state.selected) {
      add(outlineBox(rectOf(state.hover), C.hover, false));
      tooltip(state.hover, add);
    }
    if (state.flash && state.flash.isConnected) add(outlineBox(rectOf(state.flash), "#F59E0B", true));
    if (state.pinned && state.pinned.isConnected) add(outlineBox(rectOf(state.pinned), C.pinned, true));
    if (state.selected && state.selected.isConnected) {
      boxModel(state.selected, add);
      tooltip(state.selected, add);
      if (state.pinned && state.pinned.isConnected) spacingLines(add);
    }
  }

  function scheduleRender(refreshHover) {
    if (state.raf) return;
    state.raf = requestAnimationFrame(() => {
      state.raf = 0;
      if (refreshHover && state.inspecting && state.mouse) {
        const t = document.elementFromPoint(state.mouse.x, state.mouse.y);
        if (t && !t.closest("#ud-overlay-root")) state.hover = t;
      }
      render();
    });
  }

  /* ---------- inspection ---------- */
  function onMove(e) {
    state.mouse = { x: e.clientX, y: e.clientY };
    scheduleRender(true);
  }
  function onBlock(e) {
    if (!state.inspecting) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    if (e.type === "click" && e.target && !e.target.closest("#ud-overlay-root")) select(e.target, e.shiftKey);
  }
  function onKey(e) {
    if (state.inspecting && e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      stopInspect();
    }
  }
  const BLOCK_EVENTS = ["mousedown", "mouseup", "pointerdown", "pointerup", "click", "auxclick", "contextmenu"];

  function startInspect() {
    if (state.inspecting) return;
    state.inspecting = true;
    window.addEventListener("mousemove", onMove, { capture: true, passive: true });
    BLOCK_EVENTS.forEach((t) => window.addEventListener(t, onBlock, true));
    window.addEventListener("keydown", onKey, true);
    emit();
  }
  function stopInspect() {
    if (!state.inspecting) return;
    state.inspecting = false;
    window.removeEventListener("mousemove", onMove, { capture: true });
    BLOCK_EVENTS.forEach((t) => window.removeEventListener(t, onBlock, true));
    window.removeEventListener("keydown", onKey, true);
    state.hover = null;
    state.mouse = null;
    render();
    emit();
  }
  function select(node, pin) {
    if (pin && state.selected && node !== state.selected) state.pinned = node;
    else { state.selected = node; state.pinned = null; }
    render();
    emit();
  }
  function clearOverlays() {
    state.selected = null;
    state.pinned = null;
    state.hover = null;
    state.flash = null;
    render();
    emit();
  }
  function clearMeasurements() {
    state.pinned = null;
    render();
    emit();
  }

  /* ---------- inspect data ---------- */
  function inspectData(node) {
    const cs = getComputedStyle(node);
    const r = rectOf(node);
    const computed = {};
    INSPECT_PROPS.forEach((p) => { computed[p] = cs.getPropertyValue(p); });
    computed["margin"] = sidesText(cs, "margin");
    computed["padding"] = sidesText(cs, "padding");
    const bw = sides(cs, "border", "Width");
    computed["border-width"] = `${fx(bw.t)}px ${fx(bw.r)}px ${fx(bw.b)}px ${fx(bw.l)}px`;
    computed["border-style"] = cs.borderTopStyle;
    computed["border-color"] = cs.borderTopColor;
    if (/flex/.test(cs.display)) FLEX_PROPS.forEach((p) => { computed[p] = cs.getPropertyValue(p); });
    if (/grid/.test(cs.display)) GRID_PROPS.forEach((p) => { computed[p] = cs.getPropertyValue(p); });
    return {
      tag: node.tagName.toLowerCase(),
      id: node.id || "",
      classes: [...node.classList].slice(0, 8),
      selector: selectorOf(node),
      rect: {
        x: fx(r.left), y: fx(r.top), width: fx(r.width), height: fx(r.height),
        pageX: Math.round(r.left + window.scrollX), pageY: Math.round(r.top + window.scrollY)
      },
      computed
    };
  }

  function clipInfo(node) {
    const cs = getComputedStyle(node);
    if (!hasDirectText(node)) return { checked: false, clipped: false, ellipsis: false, note: "No direct text on this element." };
    const hiddenX = /hidden|clip/.test(cs.overflowX);
    const hiddenY = /hidden|clip/.test(cs.overflowY);
    const overX = node.scrollWidth - node.clientWidth > 1;
    const overY = node.scrollHeight - node.clientHeight > 1;
    const ellipsis = cs.textOverflow === "ellipsis";
    const clipped = (hiddenX && overX) || (hiddenY && overY);
    let note = "No clipping detected.";
    if (clipped) note = ellipsis ? "Text is truncated with an ellipsis (usually intentional)." : "Text overflows a clipping box and is hidden. Consider wrapping or a taller container.";
    return { checked: true, clipped, ellipsis, note };
  }

  function typographyData(node) {
    const cs = getComputedStyle(node);
    const out = {};
    TYPO_PROPS.forEach((p) => { out[p] = cs.getPropertyValue(p); });
    out.clip = clipInfo(node);
    return out;
  }

  /* ---------- contrast (WCAG 2.x relative luminance, alpha compositing) ---------- */
  function parseRgb(str) {
    const m = /rgba?\(([^)]+)\)/.exec(str || "");
    if (!m) return null;
    const p = m[1].split(/[\s,\/]+/).filter(Boolean).map(Number);
    if (p.length < 3 || p.slice(0, 3).some((v) => Number.isNaN(v))) return null;
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  }
  const blend = (top, bottom) => ({
    r: top.r * top.a + bottom.r * (1 - top.a),
    g: top.g * top.a + bottom.g * (1 - top.a),
    b: top.b * top.a + bottom.b * (1 - top.a),
    a: 1
  });
  const luminance = (c) => {
    const ch = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * ch(c.r) + 0.7152 * ch(c.g) + 0.0722 * ch(c.b);
  };
  const toHex = (c) => "#" + [c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("").toUpperCase();
  const toRgb = (c) => `rgb(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)})`;

  function effectiveBackground(node) {
    const layers = [];
    let opaqueFound = false;
    for (let n = node; n && n.nodeType === 1; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage && cs.backgroundImage !== "none") {
        return { unable: true, reason: `Background image or gradient on <${n.tagName.toLowerCase()}>; the effective background cannot be determined reliably.` };
      }
      if (px(cs.opacity) < 1) {
        return { unable: true, reason: `Opacity below 1 on <${n.tagName.toLowerCase()}> blends with layers that cannot be measured reliably.` };
      }
      const c = parseRgb(cs.backgroundColor);
      if (c && c.a > 0) {
        layers.push(c);
        if (c.a >= 1) { opaqueFound = true; break; }
      }
    }
    let base = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = layers.length - 1; i >= 0; i--) base = blend(layers[i], base);
    return { unable: false, color: base, assumedCanvas: !opaqueFound };
  }

  function contrastData(node) {
    const cs = getComputedStyle(node);
    const fg0 = parseRgb(cs.color);
    if (!fg0) return { unable: true, reason: "The text colour could not be read as an RGB value." };
    const bgRes = effectiveBackground(node);
    if (bgRes.unable) return { unable: true, reason: bgRes.reason };
    const bg = bgRes.color;
    const fg = blend(fg0, bg);
    const L1 = luminance(fg), L2 = luminance(bg);
    const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const size = px(cs.fontSize);
    const weight = parseInt(cs.fontWeight, 10) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const aaT = large ? 3 : 4.5;
    const aaaT = large ? 4.5 : 7;
    return {
      unable: false,
      text: { hex: toHex(fg), rgb: toRgb(fg) },
      background: { hex: toHex(bg), rgb: toRgb(bg) },
      ratio: Math.round(ratio * 100) / 100,
      large,
      aa: { threshold: aaT, pass: ratio >= aaT },
      aaa: { threshold: aaaT, pass: ratio >= aaaT },
      assumedCanvas: bgRes.assumedCanvas,
      note: "Ratio is calculated from the computed colours of this element and its opaque ancestors. This is a single-element check, not a complete accessibility audit."
    };
  }

  /* ---------- snapshot & events ---------- */
  function viewportInfo() {
    return {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      clientWidth: document.documentElement.clientWidth,
      clientHeight: document.documentElement.clientHeight,
      dpr: window.devicePixelRatio
    };
  }

  function spacingReport(a, b) {
    const s = spacingBetween(rectOf(a), rectOf(b));
    const ca = getComputedStyle(a), cb = getComputedStyle(b);
    const rb = rectOf(b);
    return {
      bounding: {
        overlap: s.overlap,
        horizontalGap: s.horizontal ? fx(s.horizontal.gap) : null,
        verticalGap: s.vertical ? fx(s.vertical.gap) : null
      },
      css: {
        selectedMargin: sidesText(ca, "margin"), selectedPadding: sidesText(ca, "padding"),
        pinnedMargin: sidesText(cb, "margin"), pinnedPadding: sidesText(cb, "padding")
      },
      pinnedSize: { width: fx(rb.width), height: fx(rb.height) },
      note: "Bounding gaps are measured between border boxes at the current scroll position. CSS margins are the declared values; collapsing margins, transforms and zoom can make them differ from the visual gap."
    };
  }

  function snapshot() {
    const alive = (n) => !!(n && n.isConnected);
    const snap = {
      url: location.href,
      title: document.title,
      viewport: viewportInfo(),
      inspecting: state.inspecting,
      selection: null, pinned: null, typography: null, pinnedTypography: null,
      contrast: null, spacing: null,
      playgroundCount: state.history.length
    };
    if (alive(state.selected)) {
      snap.selection = inspectData(state.selected);
      snap.typography = typographyData(state.selected);
      snap.contrast = contrastData(state.selected);
    }
    if (alive(state.pinned)) {
      snap.pinned = inspectData(state.pinned);
      snap.pinnedTypography = typographyData(state.pinned);
    }
    if (alive(state.selected) && alive(state.pinned)) snap.spacing = spacingReport(state.selected, state.pinned);
    return snap;
  }

  function emit() {
    if (state.emitRaf) return;
    state.emitRaf = requestAnimationFrame(() => {
      state.emitRaf = 0;
      try {
        chrome.runtime.sendMessage({ type: "UD_EVENT", payload: snapshot() }).catch(() => {});
      } catch (e) { /* extension context gone: ignore */ }
    });
  }

  /* ---------- diagnostics engine ---------- */
  function causeOf(node, cs, vw) {
    const parent = node.parentElement;
    const pcs = parent ? getComputedStyle(parent) : null;
    const minW = cs.minWidth === "auto" ? 0 : px(cs.minWidth);
    const width = px(cs.width);
    if (MEDIA_TAGS.has(node.tagName)) {
      return { cause: "Oversized image or media element", fix: "img, video, iframe, svg {\n  max-width: 100%;\n  height: auto;\n}", side: "Media scales down with its container. Fixed-aspect layouts may need aspect-ratio or object-fit." };
    }
    if (pcs && /grid/.test(pcs.display)) {
      return { cause: "Grid track exceeds the available space", fix: ".grid-parent {\n  grid-template-columns: minmax(0, 1fr);\n}", side: "Tracks become narrower, so long content must wrap. Check each track's minimum size." };
    }
    if (pcs && /flex/.test(pcs.display) && cs.minWidth === "auto") {
      return { cause: "Flex child that cannot shrink", fix: ".flex-child {\n  min-width: 0;\n}", side: "The item may now shrink below its content width; long text may need wrapping." };
    }
    if (/nowrap|pre/.test(cs.whiteSpace) && hasDirectText(node)) {
      return { cause: "Non-wrapping text", fix: ".content {\n  white-space: normal;\n}", side: "Text wraps onto more lines, which can change the element's height." };
    }
    if (longWord(node)) {
      return { cause: "Long unbroken string", fix: ".content {\n  overflow-wrap: anywhere;\n}", side: "Words break at arbitrary points, which can look odd in headings or code." };
    }
    if (minW > vw * 0.9) {
      return { cause: "Large minimum width", fix: ".element {\n  min-width: 0;\n  max-width: 100%;\n}", side: "The element can shrink, so its content may wrap or clip. Confirm it still fits." };
    }
    if ((node.style.width && px(node.style.width) > vw) || width > vw) {
      return { cause: "Fixed width larger than the viewport", fix: ".element {\n  width: 100%;\n  max-width: 1200px;\n}", side: "The element becomes fluid, which changes the design at larger sizes." };
    }
    return { cause: "Element wider than the viewport", fix: ".element {\n  max-width: 100%;\n}", side: "Content may be squeezed. Check that text and images inside still fit." };
  }

  function runDiagnostics() {
    const t0 = performance.now();
    const vw = document.documentElement.clientWidth || window.innerWidth;
    state.findings.clear();
    const findings = [];
    const flagged = new Set();
    let ignoredFixed = 0;
    let scanned = 0;

    const push = (f) => {
      if (findings.length >= MAX_FINDINGS) return;
      const id = "f" + (findings.length + 1);
      if (f.element) state.findings.set(id, f.element);
      const { element, ...rest } = f;
      findings.push({ id, ...rest });
    };

    const docScroll = document.documentElement.scrollWidth;
    if (docScroll - vw > 1) {
      push({
        severity: "error", certainty: "measured", category: "page-horizontal-scroll",
        tag: "html", selector: "html", element: document.documentElement,
        measured: { scrollWidth: docScroll, viewportWidth: vw }, overflow: docScroll - vw,
        cause: "Page content is wider than the viewport",
        explanation: `The document is ${docScroll} px wide inside a ${vw} px viewport, so users can scroll sideways. The elements below are the likely causes.`,
        fix: "Constrain the widest element listed below (see its suggested fix).",
        sideEffects: "None on its own; this is a symptom listed for context."
      });
    }

    const nodes = document.body ? document.body.getElementsByTagName("*") : [];
    for (const node of nodes) {
      if (++scanned > MAX_NODES) break;
      if (SKIP_TAGS.has(node.tagName) || node.closest("#ud-overlay-root")) continue;
      const cs = getComputedStyle(node);
      if (cs.display === "none" || cs.display === "contents" || cs.visibility === "hidden") continue;
      if (inHiddenSubtree(node)) continue;
      const r = node.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;

      // 1) Outside the viewport (horizontal overflow, either edge)
      const over = Math.max(r.right - vw, -r.left);
      if (over > 1) {
        if (cs.position === "fixed" || cs.transform !== "none") {
          ignoredFixed++;
        } else if (!flaggedAncestor(node, flagged)) {
          const clipper = nearestClipper(node);
          if (!(clipper && clipper.scroll)) {
            const c = causeOf(node, cs, vw);
            const potential = !!clipper || cs.position === "absolute";
            const severity = !potential && over > 2 ? "error" : "warning";
            const note = clipper ? " It is also inside a clipping container, so part of it is hidden." : "";
            flagged.add(node);
            push({
              severity, certainty: potential ? "potential" : "measured",
              category: r.left < 0 && r.right <= vw ? "outside-viewport" : "horizontal-overflow",
              tag: node.tagName.toLowerCase(), selector: selectorOf(node), element: node,
              measured: { width: fx(r.width), height: fx(r.height), left: fx(r.left), right: fx(r.right) },
              overflow: fx(over), viewportWidth: vw,
              cause: c.cause,
              explanation: `This element extends ${fx(over)} px beyond the ${vw} px viewport.${note}`,
              fix: c.fix, sideEffects: c.side
            });
          }
        }
      }

      // 2) Clipped text
      if (hasDirectText(node) && !flagged.has(node)) {
        const ci = clipInfo(node);
        if (ci.clipped && !ci.ellipsis) {
          push({
            severity: "warning", certainty: "measured", category: "clipped-text",
            tag: node.tagName.toLowerCase(), selector: selectorOf(node), element: node,
            measured: { width: fx(r.width), height: fx(r.height), scrollWidth: node.scrollWidth, scrollHeight: node.scrollHeight },
            cause: "Text overflows a clipping box",
            explanation: "Text is larger than its box and overflow is hidden, so some of it is not visible.",
            fix: ".content {\n  min-height: auto;\n  overflow-wrap: anywhere;\n}",
            sideEffects: "Taller boxes change the layout; consider line-clamp for intentional truncation."
          });
        }
      }

      // 3) Images larger than their container
      if (node.tagName === "IMG" && node.parentElement) {
        const pw = node.parentElement.clientWidth;
        if (pw > 0 && r.width > pw + 2 && cs.position !== "absolute") {
          push({
            severity: "warning", certainty: "measured", category: "image-exceeds-container",
            tag: "img", selector: selectorOf(node), element: node,
            measured: { width: fx(r.width), containerWidth: pw }, overflow: fx(r.width - pw),
            cause: "Image is wider than its container",
            explanation: `The image is ${fx(r.width)} px wide but its container is ${pw} px wide.`,
            fix: "img {\n  max-width: 100%;\n  height: auto;\n}",
            sideEffects: "The image shrinks; fixed-size crops may need object-fit: cover."
          });
        }
      }

      // 4) Fixed-width block containers wider than their parent (inline px width only)
      if (BLOCK_TAGS.has(node.tagName) && node.parentElement && node.style.width.endsWith("px")) {
        const pw = node.parentElement.clientWidth;
        if (pw > 0 && r.width > pw + 2) {
          push({
            severity: "warning", certainty: "potential", category: "oversized-fixed-container",
            tag: node.tagName.toLowerCase(), selector: selectorOf(node), element: node,
            measured: { width: fx(r.width), parentWidth: pw }, overflow: fx(r.width - pw),
            cause: "Fixed-width container is wider than its parent",
            explanation: "An inline pixel width makes this container wider than the space its parent provides. It may overlap neighbours or force sideways scrolling.",
            fix: ".container {\n  width: 100%;\n  max-width: 1200px;\n  margin-inline: auto;\n}",
            sideEffects: "The container becomes fluid; intentional full-bleed layouts may need a different fix."
          });
        }
      }
    }

    // 5) Interactive elements: small targets and overlaps
    const ints = [];
    document.querySelectorAll(INTERACTIVE).forEach((n) => {
      if (ints.length >= 300 || n.closest("#ud-overlay-root") || inHiddenSubtree(n)) return;
      const cs = getComputedStyle(n);
      if (cs.display === "none" || cs.visibility === "hidden") return;
      const r = rectOf(n);
      if (r.width > 0 && r.height > 0) ints.push({ n, r });
    });
    for (const o of ints) {
      if (o.r.width < 24 || o.r.height < 24) {
        push({
          severity: "warning", certainty: "heuristic", category: "small-target",
          tag: o.n.tagName.toLowerCase(), selector: selectorOf(o.n), element: o.n,
          measured: { width: fx(o.r.width), height: fx(o.r.height) },
          cause: "Interactive element is smaller than 24 × 24 CSS px",
          explanation: `This control is ${fx(o.r.width)} × ${fx(o.r.height)} px. WCAG 2.2 (SC 2.5.8) suggests at least 24 × 24 px unless an exception applies, so treat this as a heuristic signal.`,
          fix: "button, a, [role=button] {\n  min-width: 24px;\n  min-height: 24px;\n}",
          sideEffects: "Larger hit areas can change spacing and visual density."
        });
      }
    }
    let pairs = 0;
    for (let i = 0; i < ints.length && pairs < 60; i++) {
      for (let j = i + 1; j < ints.length && pairs < 60; j++) {
        const a = ints[i].r, b = ints[j].r;
        const ix = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        const iy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (ix > 4 && iy > 4 && !ints[i].n.contains(ints[j].n) && !ints[j].n.contains(ints[i].n)) {
          pairs++;
          push({
            severity: "info", certainty: "heuristic", category: "possible-overlap",
            tag: ints[i].n.tagName.toLowerCase(), selector: selectorOf(ints[i].n), element: ints[i].n,
            measured: { overlapX: fx(ix), overlapY: fx(iy) },
            cause: "Two interactive elements overlap",
            explanation: `This control overlaps ${selectorOf(ints[j].n) || "another control"} by ${fx(ix)} × ${fx(iy)} px. Many designs overlap on purpose, so verify it is intended.`,
            fix: "Check z-index, position and margins on the two controls.",
            sideEffects: "Changing positions can affect other layouts."
          });
        }
      }
    }

    // 6) Alignment inconsistencies among same-tag siblings
    const seen = new Set();
    let checks = 0;
    for (const o of ints) {
      const p = o.n.parentElement;
      if (!p || seen.has(p) || checks > 150) continue;
      seen.add(p);
      checks++;
    }
    const parents = [...document.querySelectorAll("main, section, div, ul, ol, nav, form")].filter((p) => p.children.length >= 3).slice(0, 400);
    let aligns = 0;
    for (const p of parents) {
      if (aligns >= 30) break;
      const kids = [...p.children];
      if (!kids.length) continue;
      const tag = kids[0].tagName;
      const items = kids.filter((k) => k.tagName === tag && getComputedStyle(k).display === "block")
        .map((k) => ({ k, left: k.getBoundingClientRect().left, w: k.getBoundingClientRect().width }))
        .filter((o) => o.w > 0);
      if (items.length < 3) continue;
      const lefts = items.map((o) => Math.round(o.left));
      const distinct = [...new Set(lefts)];
      const spread = Math.max(...lefts) - Math.min(...lefts);
      if (distinct.length > 1 && spread > 0 && spread <= 12) {
        aligns++;
        const counts = {};
        lefts.forEach((v) => { counts[v] = (counts[v] || 0) + 1; });
        const mode = Number(Object.keys(counts).sort((x, y) => counts[y] - counts[x])[0]);
        const outlier = items.find((o) => Math.round(o.left) !== mode) || items[0];
        push({
          severity: "info", certainty: "heuristic", category: "alignment",
          tag: outlier.k.tagName.toLowerCase(), selector: selectorOf(outlier.k), element: outlier.k,
          measured: { spreadPx: spread, siblings: items.length },
          cause: "Sibling elements start at slightly different x positions",
          explanation: `${items.length} sibling elements start between ${spread} px apart. This is often an unintended misalignment, but padding or intentional offsets can cause it.`,
          fix: "Compare padding, margin and width on these siblings; a shared container width often resolves it.",
          sideEffects: "Aligning items can change their visual rhythm."
        });
      }
    }

    if (ignoredFixed > 0) {
      push({
        severity: "info", certainty: "heuristic", category: "ignored-off-screen",
        tag: "-", selector: "", element: null,
        measured: { count: ignoredFixed },
        cause: "Off-screen fixed or transformed elements were ignored",
        explanation: `${ignoredFixed} fixed or transformed element(s) extend past the viewport. These are often drawers, menus or animations, so they are not reported as overflow.`,
        fix: "No change suggested.", sideEffects: "None."
      });
    }

    return {
      url: location.href,
      title: document.title,
      generatedAt: new Date().toISOString(),
      durationMs: Math.round(performance.now() - t0),
      scanned,
      viewport: { ...viewportInfo(), scrollWidth: docScroll },
      findings
    };
  }

  function flashElement(node) {
    state.flash = node;
    clearTimeout(state.flashTimer);
    state.flashTimer = setTimeout(() => { state.flash = null; render(); }, 2500);
    render();
  }
  function highlightFinding(id) {
    const node = state.findings.get(id);
    if (!node || !node.isConnected) throw new Error("This element is no longer on the page. Run diagnostics again.");
    node.scrollIntoView({ block: "center", inline: "center", behavior: "instant" });
    setTimeout(() => flashElement(node), 350);
    return { ok: true };
  }

  /* ---------- playground (inline style overrides, reversible) ---------- */
  function restoreEntry(entry) {
    if (!entry.el.isConnected) return;
    if (entry.prevValue) entry.el.style.setProperty(entry.prop, entry.prevValue, entry.prevPriority);
    else entry.el.style.removeProperty(entry.prop);
  }
  function playList() {
    return state.history.map((h, i) => ({
      index: i,
      selector: h.el.isConnected ? selectorOf(h.el) : "(element removed)",
      prop: h.prop,
      value: h.value,
      important: h.important
    }));
  }
  function playApply(prop, value, important) {
    const node = state.selected;
    if (!node || !node.isConnected) throw new Error("Select an element in the inspector first.");
    if (!PLAY_PROPS.includes(prop)) throw new Error("That property is not supported in the playground.");
    const v = String(value == null ? "" : value).trim();
    if (!v || v.length > 160 || !/^[A-Za-z0-9\s#.,%()\/+\-]+$/.test(v)) {
      throw new Error("Value is empty or contains unsupported characters.");
    }
    const probe = document.createElement("div").style;
    probe.setProperty(prop, v);
    if (!probe.getPropertyValue(prop)) throw new Error(`The browser rejected "${v}" for ${prop}.`);
    const entry = {
      el: node, prop,
      prevValue: node.style.getPropertyValue(prop),
      prevPriority: node.style.getPropertyPriority(prop),
      value: v, important: !!important
    };
    node.style.setProperty(prop, v, entry.important ? "important" : "");
    state.history.push(entry);
    render();
    return playList();
  }
  function playUndo(index) {
    const entry = state.history[index];
    if (!entry) throw new Error("That change no longer exists.");
    const later = state.history.slice(index + 1).some((h) => h.el === entry.el && h.prop === entry.prop);
    if (later) throw new Error("Undo the later change to this property first.");
    state.history.splice(index, 1);
    restoreEntry(entry);
    render();
    return playList();
  }
  function playReset() {
    for (let i = state.history.length - 1; i >= 0; i--) restoreEntry(state.history[i]);
    state.history = [];
    render();
    return playList();
  }

  /* ---------- messaging ---------- */
  function highlightFromMsg(id) { return highlightFinding(id); }

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    let out;
    try {
      switch (msg && msg.type) {
        case "UD_PING": out = { ok: true, data: { url: location.href, title: document.title, inspecting: state.inspecting } }; break;
        case "UD_GET_VIEWPORT": out = { ok: true, data: viewportInfo() }; break;
        case "UD_TOGGLE_INSPECT": state.inspecting ? stopInspect() : startInspect(); out = { ok: true, data: { inspecting: state.inspecting } }; break;
        case "UD_SET_INSPECT": msg.on ? startInspect() : stopInspect(); out = { ok: true, data: { inspecting: state.inspecting } }; break;
        case "UD_CLEAR": clearOverlays(); out = { ok: true }; break;
        case "UD_CLEAR_MEASURE": clearMeasurements(); out = { ok: true }; break;
        case "UD_SNAPSHOT": out = { ok: true, data: snapshot() }; break;
        case "UD_DIAGNOSE": out = { ok: true, data: runDiagnostics() }; break;
        case "UD_HIGHLIGHT": out = { ok: true, data: highlightFromMsg(msg.id) }; break;
        case "UD_PLAY_LIST": out = { ok: true, data: playList() }; break;
        case "UD_PLAY_APPLY": out = { ok: true, data: playApply(msg.prop, msg.value, msg.important) }; emit(); break;
        case "UD_PLAY_UNDO": out = { ok: true, data: playUndo(msg.index) }; emit(); break;
        case "UD_PLAY_RESET": out = { ok: true, data: playReset() }; emit(); break;
        default: out = { ok: false, error: "Unknown message." };
      }
    } catch (err) {
      out = { ok: false, error: String((err && err.message) || err) };
    }
    sendResponse(out);
    return false;
  });

  /* ---------- live setup ---------- */
  const onScroll = () => { if (state.selected || state.pinned || state.hover || state.flash) scheduleRender(true); };
  window.addEventListener("scroll", onScroll, { capture: true, passive: true });
  window.addEventListener("resize", onScroll, { passive: true });

  try {
    chrome.storage.local.get("settings").then(({ settings }) => {
      if (settings && settings.overlay) Object.assign(state.colors, settings.overlay);
    });
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "local" && changes.settings && changes.settings.newValue && changes.settings.newValue.overlay) {
        Object.assign(state.colors, changes.settings.newValue.overlay);
        render();
      }
    });
  } catch (e) { /* storage unavailable: keep defaults */ }
})();

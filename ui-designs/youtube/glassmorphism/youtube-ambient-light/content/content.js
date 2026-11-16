/* YouTube Ambient Light: content script
   Ambient glow, neumorphic settings window (dark/light), right panel tabs,
   focus mode (video centred, or video left + synced lyrics right),
   lyrics from YouTube's own caption track (word timings), responsive layout, safety checks, factory reset. */
(() => {
  "use strict";

  const DEFAULTS = {
    ambientOn: true,
    ambientBlur: 60,
    ambientSpread: 120,
    ambientIntensity: 0.8,
    ambientGap: 40,        // margin around the video: applies ONLY in focus mode
    neonOn: false,
    videoOn: true,
    captions: false,
    eqOn: false,
    eqBands: [0, 0, 0, 0, 0],
    focusOn: false,
    focusLyrics: false,
    cardTransparency: 50,  // % see-through for info cards and the comments panel
    textShadow: 30,        // % strength of the text shadow inside those cards
    theme: "dark",         // settings window: "dark" | "light"
    lyrFont: "sans",       // sans | serif | mono | display
    lyrAlign: "left",      // left | center | right
    lyrSize: 100,          // % of the default lyric size
    lyrWeight: 600,
    lyrLine: 1.4,          // line height
    lyrTop: 42,            // where the active line sits (% of the lyrics column)
    lyrPad: 0,             // side inset in px
    lyrFx: "typewriter",   // text animation: none | typewriter | drop | rise | scatter | spin | blur | zoom
    lyrFxSpeed: 100        // % (100 = normal)
  };
  const EQ_FREQS = [60, 250, 1000, 4000, 12000];
  const EQ_LABELS = ["60 Hz", "250 Hz", "1 kHz", "4 kHz", "12 kHz"];
  const EQ_SHORT = ["60", "250", "1k", "4k", "12k"];
  const PRESETS = { "Flat": [0,0,0,0,0], "Bass": [6,4,0,-1,-2], "Vokal": [-2,0,3,4,1], "Kino": [4,2,0,3,5] };
  const LYR_FONTS = {
    sans: "Roboto, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    mono: "'Courier New', Consolas, monospace",
    display: "Impact, 'Arial Narrow', sans-serif"
  };
  const LYR_FONT_NAMES = [["sans", "Sans"], ["serif", "Serif"], ["mono", "Mono"], ["display", "Display"]];
  const LYR_ALIGN = [["left", "Sol"], ["center", "Mərkəz"], ["right", "Sağ"]];
  const FX_MODES = [
    ["none", "Yox"], ["typewriter", "Hərf-hərf"], ["drop", "Yuxarıdan düşmə"], ["rise", "Aşağıdan qalxma"],
    ["scatter", "Hər tərəfdən"], ["spin", "Dönərək gəlmə"], ["blur", "Bulanıqdan"], ["zoom", "Böyüyərək"]
  ];
  const FX_LABEL = Object.fromEntries(FX_MODES);
  // Splits text into letter spans. Each letter gets its index (--i) for stagger, and random offsets for the scatter effect.
  function splitChars(el, text, base = 0) {
    let n = base;
    Array.from(text).forEach(ch => {
      const s = document.createElement("span");
      s.className = "yal-ch";
      s.textContent = ch === " " ? "\u00a0" : ch;
      s.style.setProperty("--i", n);
      s.style.setProperty("--dx", Math.round((Math.random() * 2 - 1) * 160) + "px");
      s.style.setProperty("--dy", Math.round((Math.random() * 2 - 1) * 110) + "px");
      s.style.setProperty("--rot", Math.round((Math.random() * 2 - 1) * 140) + "deg");
      el.appendChild(s);
      n++;
    });
    return n;
  }
  // The animation class goes on the element that shows the text; CSS reads it as --yal-anim
  function setFxClass(el) {
    FX_MODES.forEach(([id]) => el.classList.remove("fx-" + id));
    el.classList.add("fx-" + settings.lyrFx);
  }
  const ICON_AMBIENT = `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
    <rect x="3" y="5" width="18" height="11" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/>
    <path d="M8 20h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="12" cy="10.5" r="2.6" fill="currentColor" opacity=".85"/></svg>`;
  const ICON_FOCUS = `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
    <path d="M4 9V5h4M20 9V5h-4M4 15v4h4M20 15v4h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <circle cx="12" cy="12" r="2.6" fill="currentColor"/></svg>`;
  const MUSIC_SVG = `<svg class="yal-note" viewBox="0 0 24 24" aria-label="musiqi" role="img">
    <path d="M9.6 17V5.4M19.4 15V3.4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M9.6 4.4L19.4 2.4V6.2L9.6 8.2Z" fill="currentColor"/>
    <ellipse cx="7" cy="17.2" rx="3.1" ry="2.4" transform="rotate(-20 7 17.2)" fill="currentColor"/>
    <ellipse cx="16.8" cy="15.2" rx="3.1" ry="2.4" transform="rotate(-20 16.8 15.2)" fill="currentColor"/></svg>`;
  const ICON_KOFI = `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <path d="M4 8h13v6.5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8z" fill="currentColor"/>
    <path d="M17 9.5h1.6a2.9 2.9 0 0 1 0 5.8H17" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M8 2.8c-.8 1 .8 1.6 0 2.8M11.5 2.8c-.8 1 .8 1.6 0 2.8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
  const ICON_SUN = `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
    <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.3 5.3l1.7 1.7M17 17l1.7 1.7M5.3 18.7L7 17M17 7l1.7-1.7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
  const ICON_MOON = `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
    <path d="M20 14.6A8 8 0 0 1 9.4 4 8 8 0 1 0 20 14.6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`;
  const ICON_CLOSE = `<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`;

  let settings = { ...DEFAULTS };
  let video = null, audioCtx = null, eqNodes = null;
  let btn = null, focusBtn = null, root = null, resetBtn = null, lastUrl = location.href;
  const eqByVideo = new WeakMap();
  const lyr = { lines: [], idx: -1, key: null, loadId: 0, mode: null, live: null };

  const load = () => new Promise(res =>
    chrome.storage.sync.get(DEFAULTS, i => { settings = { ...DEFAULTS, ...i }; res(); }));
  const videoKey = () => new URL(location.href).searchParams.get("v");

  /* ---------- Saving: memory is updated at once, storage writes are batched.
     (chrome.storage.sync allows only ~120 writes/min; sliders fire dozens per second.) ---------- */
  let pendingSave = {}, saveTimer = null;
  function flushSave() {
    clearTimeout(saveTimer); saveTimer = null;
    if (!Object.keys(pendingSave).length) return;
    const patch = pendingSave; pendingSave = {};
    try { chrome.storage.sync.set(patch); } catch (_) { /* extension was reloaded */ }
  }
  function save(patch) {
    settings = { ...settings, ...patch };
    pendingSave = { ...pendingSave, ...patch };
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flushSave, 400);
  }
  window.addEventListener("pagehide", flushSave);

  /* ---------- Factory reset ---------- */
  function factoryReset() {
    pendingSave = {}; clearTimeout(saveTimer);
    try { chrome.storage.sync.clear(() => chrome.storage.sync.set(DEFAULTS, () => location.reload())); }
    catch (_) { location.reload(); }
  }

  /* ---------- Theme (settings window) ---------- */
  function applyTheme() {
    document.documentElement.dataset.yalTheme = settings.theme === "light" ? "light" : "dark";
    if (!root) return;
    const b = root.querySelector(".yal-theme");
    if (b) {
      const light = settings.theme === "light";
      b.innerHTML = light ? ICON_MOON : ICON_SUN;
      b.title = light ? "Tünd rejim" : "İşıqlı rejim";
      b.setAttribute("aria-label", b.title);
    }
  }

  /* ---------- Ambient glow ---------- */
  const ambient = document.createElement("div");
  ambient.id = "yal-ambient";
  const canvas = document.createElement("canvas");
  canvas.width = 160; canvas.height = 90;
  const cctx = canvas.getContext("2d");
  cctx.imageSmoothingQuality = "low";
  ambient.appendChild(canvas);

  // Draws one frame. Skipped while paused / fullscreen / hidden unless forced (seek, play, settings change).
  function paint(force) {
    if (!video || !settings.ambientOn || video.readyState < 2) return;
    if (document.hidden || document.fullscreenElement) return;
    if (force !== true && video.paused) return;
    try { cctx.drawImage(video, 0, 0, canvas.width, canvas.height); } catch (_) {}
  }

  function applyAmbient() {
    ambient.style.display = settings.ambientOn ? "block" : "none";
    ambient.style.setProperty("--yal-blur", settings.ambientBlur + "px");
    ambient.style.setProperty("--yal-scale", settings.ambientSpread / 100);
    ambient.style.setProperty("--yal-opacity", settings.ambientIntensity);
    document.documentElement.classList.toggle("yal-on", settings.ambientOn);
    document.documentElement.classList.toggle("yal-led", settings.neonOn);
    paint(true);
  }

  /* ---------- Responsive focus layout (sizes recomputed from the viewport) ---------- */
  function applyLayout() {
    const vw = window.innerWidth, vh = window.innerHeight, g = settings.ambientGap;
    const availW = settings.focusLyrics ? vw / 2 - 2 * g : vw - 2 * g;
    const availH = vh - 2 * g;
    let w = Math.min(availW, availH * 16 / 9);
    w = Math.max(160, w);
    const h = w * 9 / 16;
    const left = settings.focusLyrics ? g : (vw - w) / 2;
    const top = (vh - h) / 2;
    const s = document.documentElement.style;
    s.setProperty("--yal-vid-w", w + "px");
    s.setProperty("--yal-vid-h", h + "px");
    s.setProperty("--yal-vid-left", left + "px");
    s.setProperty("--yal-vid-top", top + "px");
    s.setProperty("--yal-gap", g + "px");
  }

  /* ---------- Equalizer ----------
     createMediaElementSource() re-routes the sound through an AudioContext. If that context is still
     "suspended" (no user gesture yet) the video would be silent, so the EQ is only wired after a gesture. */
  const userActivated = () => !navigator.userActivation || navigator.userActivation.hasBeenActive;
  let eqRetryArmed = false;
  function armEqRetry() {
    if (eqRetryArmed) return;
    eqRetryArmed = true;
    const go = () => {
      document.removeEventListener("pointerdown", go, true);
      document.removeEventListener("keydown", go, true);
      eqRetryArmed = false;
      setTimeout(applyEq, 0);
    };
    document.addEventListener("pointerdown", go, true);
    document.addEventListener("keydown", go, true);
  }

  function ensureEq() {
    if (!video) return;
    if (eqByVideo.has(video)) { eqNodes = eqByVideo.get(video); return; }
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const src = audioCtx.createMediaElementSource(video);
      const bands = EQ_FREQS.map(f => {
        const b = audioCtx.createBiquadFilter();
        b.type = "peaking"; b.frequency.value = f; b.Q.value = 1.1;
        return b;
      });
      let node = src;
      bands.forEach(b => { node.connect(b); node = b; });
      node.connect(audioCtx.destination);
      eqByVideo.set(video, bands);
      eqNodes = bands;
    } catch (e) { console.warn("[YAL] Ekvalayzer qoşulmadı:", e); }
  }

  function applyEq() {
    if (settings.eqOn && video && !eqByVideo.has(video)) {
      if (!userActivated()) { armEqRetry(); return; }
      ensureEq();
    }
    if (video && eqByVideo.has(video)) eqNodes = eqByVideo.get(video);
    if (settings.eqOn && audioCtx && audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
    if (eqNodes) eqNodes.forEach((b, i) => { b.gain.value = settings.eqOn ? (settings.eqBands[i] ?? 0) : 0; });
  }

  /* ---------- Video picture, captions button, transcript ---------- */
  function applyVideoOn() {
    document.documentElement.classList.toggle("yal-audio-only", !settings.videoOn);
  }

  // The CC button is only clicked when OUR wish changes, so a caption state the user set by hand is never overridden.
  let ccWanted = null;
  function applyCaptions() {
    const want = settings.captions || (settings.focusOn && settings.focusLyrics && lyr.mode === "live");
    if (want === ccWanted) return;
    if (ccWanted === null && !want) { ccWanted = false; return; }
    const cc = document.querySelector(".ytp-subtitles-button");
    if (!cc) return;
    const pressed = cc.getAttribute("aria-pressed") === "true";
    if (want !== pressed) cc.click();
    ccWanted = want;
  }

  function openTranscript() {
    const b = [...document.querySelectorAll("button")]
      .find(x => /transcript|transkript/i.test(x.getAttribute("aria-label") || x.textContent || ""));
    setStatus(b ? "Transkript açıldı." : "Bu videoda transkript tapılmadı.");
    if (b) b.click();
  }

  /* ---------- Right panel: card with tabs ---------- */
  function mountSide() {
    const secondary = document.querySelector("#secondary");
    const inner = secondary && (secondary.querySelector("#secondary-inner") || secondary);
    if (!inner) return;
    let wrap = document.getElementById("yal-side");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.id = "yal-side";
      wrap.innerHTML = `
        <div class="yal-tabs">
          <button type="button" data-tab="comments" class="on">Şərhlər</button>
          <button type="button" data-tab="recs">Tövsiyələr</button>
        </div>
        <div class="yal-slot" id="yal-comments-slot"></div>
        <div class="yal-slot" id="yal-rec-slot" hidden></div>`;
      wrap.querySelector(".yal-tabs").addEventListener("click", e => {
        const b = e.target.closest("button");
        if (!b) return;
        const isComments = b.dataset.tab === "comments";
        wrap.querySelectorAll(".yal-tabs button").forEach(x => x.classList.toggle("on", x === b));
        wrap.querySelector("#yal-comments-slot").hidden = !isComments;
        wrap.querySelector("#yal-rec-slot").hidden = isComments;
      });
      inner.insertBefore(wrap, inner.firstChild);
    }
    const commentsSlot = wrap.querySelector("#yal-comments-slot");
    const recSlot = wrap.querySelector("#yal-rec-slot");
    const comments = document.querySelector("ytd-comments#comments");
    if (comments && comments.parentElement !== commentsSlot) commentsSlot.appendChild(comments);
    const playlist = secondary.querySelector("ytd-playlist-panel");
    if (playlist && playlist.parentElement !== recSlot) recSlot.appendChild(playlist);
    const related = secondary.querySelector("#related");
    if (related && related.parentElement !== recSlot) recSlot.appendChild(related);
  }

  /* ---------- Player bar buttons ---------- */
  function mountButtons() {
    const right = document.querySelector(".ytp-right-controls");
    if (!right) return;
    let changed = false;
    btn = right.querySelector(".yal-ctrl");
    if (!btn) {
      btn = document.createElement("button");
      btn.className = "ytp-button yal-ctrl";
      btn.title = "Ambient işıq ayarları";
      btn.setAttribute("aria-label", "Ambient işıq ayarları");
      btn.innerHTML = ICON_AMBIENT;
      btn.addEventListener("click", e => { e.stopPropagation(); toggleWindow(); });
      // .after() works wherever YouTube nests the gear (older and newer player layouts)
      const gear = right.querySelector(".ytp-settings-button");
      const cc = right.querySelector(".ytp-subtitles-button");
      if (gear) gear.after(btn); else if (cc) cc.after(btn); else right.prepend(btn);
      changed = true;
    }
    focusBtn = right.querySelector(".yal-focus-ctrl");
    if (!focusBtn) {
      focusBtn = document.createElement("button");
      focusBtn.className = "ytp-button yal-focus-ctrl";
      focusBtn.title = "Fokus rejimi";
      focusBtn.setAttribute("aria-label", "Fokus rejimi");
      focusBtn.innerHTML = ICON_FOCUS;
      focusBtn.addEventListener("click", e => {
        e.stopPropagation();
        save({ focusOn: !settings.focusOn });
        applyAll();
      });
      btn.after(focusBtn);
      changed = true;
    }
    if (changed) { focusBtn.classList.toggle("on", settings.focusOn); syncUI(); }
  }

  /* ---------- Card transparency and text shadow: CSS variables from saved settings ---------- */
  function applyCards() {
    const st = document.documentElement.style;
    st.setProperty("--yal-card-a", String(1 - settings.cardTransparency / 100));
    st.setProperty("--yal-shadow-a", String(settings.textShadow / 100 * 0.9));
  }

  /* ---------- Lyric style: plain CSS variables, set from saved settings ---------- */
  function applyLyrics() {
    const st = document.documentElement.style;
    st.setProperty("--yal-lyr-font", LYR_FONTS[settings.lyrFont] || LYR_FONTS.sans);
    st.setProperty("--yal-lyr-align", settings.lyrAlign);
    st.setProperty("--yal-lyr-size", String(settings.lyrSize / 100));
    st.setProperty("--yal-lyr-weight", String(settings.lyrWeight));
    st.setProperty("--yal-lyr-line", String(settings.lyrLine));
    st.setProperty("--yal-lyr-pad", settings.lyrPad + "px");
    st.setProperty("--yal-lyr-top", settings.lyrTop + "%");
    st.setProperty("--yal-fx-step", (40 * settings.lyrFxSpeed / 100) + "ms");
    const box = document.getElementById("yal-lyrics");
    if (box) setFxClass(box);
    const pv = root && root.querySelector(".yal-preview");
    if (pv) setFxClass(pv);
    recenter();
  }

  function recenter() {
    if (lyr.mode === "timed" && lyr.lines[lyr.idx]) centerOn(lyr.lines[lyr.idx].el);
    else if (lyr.mode === "live" && lyr.live && lyr.live.group) {
      const ls = lyr.live.group.querySelectorAll(".yal-line");
      if (ls.length) centerOn(ls[ls.length - 1]);
    }
  }

  /* ---------- Focus mode: hide siblings along the player's ancestor path ---------- */
  const FOCUS_ATTR = "data-yal-hidden";
  const KEEP_SKIP = new Set(["SCRIPT", "STYLE", "LINK", "TEMPLATE", "SVG", "NOSCRIPT"]);
  const isOurs = el => (el.id && el.id.startsWith("yal-")) || KEEP_SKIP.has(el.tagName);

  function applyFocusDom() {
    if (!settings.focusOn) {
      document.querySelectorAll("[" + FOCUS_ATTR + "]").forEach(el => el.removeAttribute(FOCUS_ATTR));
      return;
    }
    const player = document.querySelector("#movie_player");
    if (!player) return;
    const keep = new Set();
    for (let n = player; n && n !== document.documentElement; n = n.parentElement) keep.add(n);
    keep.add(document.documentElement);
    keep.forEach(n => {
      const parent = n.parentElement;
      if (!parent) return;
      for (const c of parent.children) {
        if (!keep.has(c) && !isOurs(c) && !c.hasAttribute(FOCUS_ATTR)) c.setAttribute(FOCUS_ATTR, "");
      }
    });
  }

  /* ---------- Lyrics layer ---------- */
  function buildFocusLayers() {
    const lyrics = document.createElement("div");
    lyrics.id = "yal-lyrics";
    lyrics.innerHTML = `<div id="yal-track"></div>`;
    document.body.appendChild(lyrics);
  }

  const MUSIC_TAG = /^\[\s*(?:musiqi|music|müzik|muzik|applause|alqış|alqis|laughter|gülüş|gulus)[^\]]*\]$/i;
  const MUSIC_SYMBOL = /^[♪♫♬]+$/;
  // Everything inside [ ] is never shown as text (also an unclosed [ at the end of a caption)
  const stripBrackets = s => s.replace(/\[[^\]]*(\]|$)/g, " ").replace(/\s+/g, " ").trim();

  // Picks the caption track: the one YouTube has selected, else Azerbaijani, English, or the first one
  function pickTrack(player, tracks) {
    let sel = null;
    try { sel = player.getOption("captions", "track"); } catch (_) {}
    const lang = sel && sel.languageCode;
    return tracks.find(t => lang && t.languageCode === lang && t.kind !== "asr")
        || tracks.find(t => lang && t.languageCode === lang)
        || tracks.find(t => t.languageCode === "az")
        || tracks.find(t => t.languageCode === "en")
        || tracks[0];
  }

  // json3 caption file -> flat list of words with exact start times (seconds)
  function parseWords(json) {
    const words = [];
    let lastT = -1;
    (json.events || []).forEach(ev => {
      if (!ev.segs) return;
      const base = ev.tStartMs || 0;
      ev.segs.forEach(seg => {
        const t = (base + (seg.tOffsetMs || 0)) / 1000;
        (seg.utf8 || "").replace(/\n/g, " ").split(" ").filter(x => x.trim()).forEach(w => {
          if (t < lastT - 0.05) return; // rolling auto-caption repeats of older words
          lastT = Math.max(lastT, t);
          words.push({ t, w });
        });
      });
    });
    return words;
  }

  // Words -> clean display lines: break at . ! ? ; …, at 5 words, and after a pause; music becomes its own line
  function buildLines(words) {
    const lines = [];
    let cur = null, tag = null;
    const close = () => { if (cur && cur.words.length) lines.push(cur); cur = null; };
    const music = t => { close(); lines.push({ music: true, start: t, end: t + 1.5, words: [] }); };
    words.forEach(item => {
      const { t, w } = item;
      // [ ... ] may span several words: it is read and judged, but never shown as text
      if (tag || w.startsWith("[")) {
        tag = tag ? { t: tag.t, n: tag.n + 1, text: tag.text + " " + w } : { t, n: 1, text: w };
        if (tag.text.includes("]")) {
          if (MUSIC_TAG.test(tag.text)) music(tag.t);
          tag = null;
        } else if (tag.n > 8) tag = null; // never closed: drop the fragment
        return;
      }
      if (MUSIC_SYMBOL.test(w)) { music(t); return; }
      if (cur && cur.words.length >= 3 && t - cur.words[cur.words.length - 1].t > 1.2) close();
      if (!cur) cur = { start: t, words: [] };
      cur.words.push(item);
      if (/[.!?;…]$/.test(w) || cur.words.length >= 5) close();
    });
    close();
    lines.forEach((l, i) => {
      if (!l.end) l.end = lines[i + 1] ? lines[i + 1].start : l.words[l.words.length - 1].t + 1.5;
    });
    return lines;
  }

  function renderLines(lines) {
    const track = document.getElementById("yal-track");
    if (!track) return;
    track.innerHTML = "";
    lines.forEach(l => {
      const d = document.createElement("div");
      d.className = "yal-line";
      if (l.music) {
        d.classList.add("yal-music");
        d.innerHTML = MUSIC_SVG;
      } else {
        let fxIdx = 0;
        l.words.forEach((it, j) => {
          if (j) d.appendChild(document.createTextNode(" "));
          const s = document.createElement("span");
          s.className = "yal-w";
          fxIdx = splitChars(s, it.w, fxIdx);
          d.appendChild(s);
          it.el = s;
        });
      }
      track.appendChild(d);
      l.el = d;
    });
  }

  function centerOn(el) {
    const box = document.getElementById("yal-lyrics");
    const track = document.getElementById("yal-track");
    if (!box || !track || !el) return;
    const y = box.clientHeight * settings.lyrTop / 100 - (el.offsetTop + el.offsetHeight / 2);
    track.style.transform = `translateY(${y}px)`;
  }

  // Runs every ~100ms: the active line follows video.currentTime exactly
  function updateLyrics() {
    const lines = lyr.lines;
    if (!lines.length || !video || !settings.focusLyrics || !settings.focusOn) return;
    const now = video.currentTime;
    let idx = lyr.idx < 0 ? 0 : lyr.idx;
    while (idx + 1 < lines.length && lines[idx + 1].start <= now) idx++;
    while (idx > 0 && lines[idx].start > now) idx--;

    if (idx !== lyr.idx) {
      lines.forEach((l, i) => {
        l.el.classList.toggle("now", i === idx);
        l.el.classList.toggle("past", i < idx);
        l.el.classList.toggle("next", i > idx);
        if (!l.music) l.words.forEach(it => it.el.classList.toggle("spk", i < idx));
      });
      lyr.idx = idx;
      centerOn(lines[idx].el);
    }

    const line = lines[idx];
    if (!line.music) {
      let cw = -1;
      line.words.forEach((it, j) => {
        const on = it.t <= now;
        it.el.classList.toggle("spk", on);
        if (on) cw = j;
      });
      line.words.forEach((it, j) => it.el.classList.toggle("cw", j === cw));
    }
  }

  function clearTrack() {
    const track = document.getElementById("yal-track");
    if (track) track.innerHTML = "";
  }

  // Old video's lines leave at once when the page starts to change video
  function resetLyrics() {
    lyr.loadId++; lyr.key = null; lyr.lines = []; lyr.idx = -1; lyr.mode = null; lyr.live = null;
    clearTrack();
  }

  // Loads lyrics for the CURRENT video only. Stale responses are ignored.
  // Source 1: YouTube caption file with word timings (synced).
  // Source 2 (fallback): live captions read from the player's caption text (no timings).
  async function loadLyrics(attempt = 0) {
    const key = videoKey();
    const id = ++lyr.loadId;
    lyr.key = key;
    lyr.lines = []; lyr.idx = -1; lyr.mode = null; lyr.live = null;
    clearTrack();

    const player = document.querySelector("#movie_player");
    let pr = null;
    try { pr = player && player.getPlayerResponse ? player.getPlayerResponse() : null; } catch (_) {}
    if (pr && pr.videoDetails && pr.videoDetails.videoId !== key) {
      if (attempt < 6) setTimeout(() => { if (id === lyr.loadId) loadLyrics(attempt + 1); }, 700);
      return;
    }

    const tracks = (pr && pr.captions && pr.captions.playerCaptionsTracklistRenderer &&
                    pr.captions.playerCaptionsTracklistRenderer.captionTracks) || [];
    if (tracks.length && player) {
      try {
        const u = new URL(pickTrack(player, tracks).baseUrl);
        u.searchParams.set("fmt", "json3");
        const txt = await (await fetch(u.toString())).text();
        if (id !== lyr.loadId || key !== videoKey()) return;
        const json = txt ? JSON.parse(txt) : null;
        const words = json ? parseWords(json) : [];
        if (words.length) {
          lyr.mode = "timed";
          lyr.lines = buildLines(words);
          renderLines(lyr.lines);
          updateLyrics();
          setStatus("Sözlər: sinxron alt yazı.");
          return;
        }
      } catch (e) { console.warn("[YAL] Alt yazı faylı alınmadı:", e); }
    }

    if (id !== lyr.loadId || key !== videoKey()) return;
    lyr.mode = "live";
    lyr.live = { raw: "", group: null, stale: readLiveCaption() };
    setStatus("Sözlər: canlı alt yazı (vaxt faylı alınmadı).");
    applyAll(); // turns CC on so the caption text appears in the player
  }

  // Live mode: reads the caption text that YouTube renders and shows clean lines
  function readLiveCaption() {
    const segs = document.querySelectorAll(".ytp-caption-segment");
    let t = segs.length ? [...segs].map(x => x.textContent).join(" ") : "";
    if (!t) {
      const w = document.querySelector(".ytp-caption-window-container");
      t = w ? w.textContent : "";
    }
    return stripBrackets(t);
  }

  // Splits a clause into display lines of at most 5 words (was referenced but never defined: live-caption mode crashed)
  function splitWords(ws) {
    const out = [];
    for (let i = 0; i < ws.length; i += 5) out.push(ws.slice(i, i + 5).join(" "));
    return out;
  }

  function liveLinesOf(raw) {
    const out = [];
    raw.split(/(?<=[.!?;…])\s+/).forEach(clause => {
      const ws = clause.split(" ").filter(Boolean);
      if (ws.length) splitWords(ws).forEach(x => out.push(x));
    });
    return out;
  }

  function setLiveGroup(raw, isNew) {
    const track = document.getElementById("yal-track");
    if (!track) return;
    const L = lyr.live;
    const g = document.createElement("div");
    g.className = "yal-group live";
    const parts = liveLinesOf(raw);
    parts.forEach(tx => {
      const d = document.createElement("div");
      d.className = "yal-line";
      splitChars(d, tx, 0);
      g.appendChild(d);
    });
    // letters already shown in this caption run stay as they are; only new letters animate
    const shown = g.querySelectorAll(".yal-ch");
    if (!isNew && L.count) shown.forEach((c, i) => { if (i < L.count) c.classList.add("yal-done"); });
    L.count = shown.length;
    if (isNew) {
      if (L.group) L.group.classList.replace("live", "done");
      track.appendChild(g);
      while (track.children.length > 6) track.firstElementChild.remove();
    } else if (L.group && L.group.parentNode) {
      L.group.replaceWith(g);
    } else {
      track.appendChild(g);
    }
    L.group = g;
    const lines = g.querySelectorAll(".yal-line");
    lines.forEach((d, i) => {
      d.classList.toggle("now", i === lines.length - 1);
      d.classList.toggle("past", i < lines.length - 1);
    });
    if (lines.length) centerOn(lines[lines.length - 1]);
  }

  function tickLive() {
    if (lyr.mode !== "live" || !lyr.live) return;
    const L = lyr.live;
    const t = readLiveCaption();
    if (!t || t === L.raw || t === L.stale) return;
    if (L.raw && (t.startsWith(L.raw) || L.raw.startsWith(t))) {
      if (t.length > L.raw.length) { L.raw = t; setLiveGroup(t, false); }
    } else {
      L.raw = t;
      setLiveGroup(t, true);
    }
  }

  function ensureLyrics() {
    if (settings.focusOn && settings.focusLyrics && lyr.key !== videoKey()) loadLyrics();
  }

  /* ---------- Safety: auto-exit focus if the player collapses ---------- */
  let safetyTimer = null;
  function scheduleSafety() {
    clearTimeout(safetyTimer);
    if (settings.focusOn) safetyTimer = setTimeout(focusSafety, 700);
  }
  function focusSafety() {
    const p = document.querySelector("#movie_player");
    const r = p && p.getBoundingClientRect();
    const ok = r && r.width > 120 && r.height > 60;
    if (!ok && settings.focusOn) {
      save({ focusOn: false, focusLyrics: false });
      applyAll();
      setStatus("Fokus rejimi avtomatik söndürüldü. Problem davam edərsə ↺ düyməsinə basın.");
    }
  }

  function applyFocus() {
    const h = document.documentElement;
    h.classList.toggle("yal-focus", settings.focusOn);
    h.classList.toggle("yal-focus-lyrics", settings.focusOn && settings.focusLyrics);
    if (focusBtn) focusBtn.classList.toggle("on", settings.focusOn);
    applyLayout();
    applyFocusDom();
    ensureLyrics();
    scheduleSafety();
  }

  /* ---------- Settings window (neumorphic, dark/light) ---------- */
  const slider = (k, label, min, max, step, cls = "") => `
    <div class="yal-row yal-slider ${cls}">
      <div class="yal-top"><span>${label}</span><output data-out="${k}"></output></div>
      <input type="range" data-k="${k}" min="${min}" max="${max}" step="${step}" aria-label="${label}">
    </div>`;
  const toggle = (k, label, cls = "") => `
    <label class="yal-row ${cls}"><span>${label}</span>
      <span class="yal-sw"><input type="checkbox" data-k="${k}"><i></i></span>
    </label>`;

  function buildWindow() {
    root = document.createElement("div");
    root.id = "yal-window";
    root.dataset.tab = "light";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-label", "Ambient Light ayarları");
    const fontChips = LYR_FONT_NAMES.map(([id, name]) =>
      `<button type="button" class="yal-chip" data-lyr-font="${id}" style="font-family:${LYR_FONTS[id]}">${name}</button>`).join("");
    const alignChips = LYR_ALIGN.map(([id, name]) =>
      `<button type="button" class="yal-chip" data-lyr-align="${id}">${name}</button>`).join("");

    root.innerHTML = `
      <div class="yal-head">
        <div class="yal-title"><i></i><span>Ambient Light</span><small>Ayarlar</small></div>
        <div class="yal-head-actions">
          <button class="yal-ib yal-theme" type="button" data-action="theme"></button>
          <button class="yal-ib yal-x" type="button" data-action="close" aria-label="Bağla" title="Bağla">${ICON_CLOSE}</button>
        </div>
      </div>

      <div class="yal-body">
        <section class="yal-card">
          <h3>İşıq</h3>
          ${toggle("ambientOn", "Ambient işıq")}
          ${slider("ambientBlur", "Bulanıqlıq", 10, 150, 1)}
          ${slider("ambientSpread", "Yayılma", 100, 200, 5)}
          ${slider("ambientIntensity", "İntensivlik", 10, 100, 5)}
          ${toggle("neonOn", "Video kənarında parıltı")}
          ${slider("cardTransparency", "Kartların şəffaflığı", 0, 100, 5)}
          ${slider("textShadow", "Yazı kölgəsi", 0, 100, 5)}
        </section>

        <section class="yal-card">
          <h3>Rejim</h3>
          ${toggle("videoOn", "Videonu göstər")}
          ${toggle("captions", "Altyazı")}
          ${toggle("focusOn", "Fokus rejimi")}
          ${toggle("focusLyrics", "Fokusda sözlər", "yal-needs-focus")}
          ${slider("ambientGap", "Fokus boşluğu", 0, 200, 5, "yal-needs-focus")}
          <div class="yal-chips"><button type="button" class="yal-btn" data-action="transcript">Transkripti aç</button></div>
        </section>

        <section class="yal-card yal-wide">
          <h3>Səs</h3>
          ${toggle("eqOn", "Ekvalayzer")}
          <div class="yal-eq">
            ${EQ_FREQS.map((_, i) => `
              <div class="yal-eqcol">
                <output data-bout="${i}"></output>
                <div class="yal-eqtrack"><input type="range" data-band="${i}" min="-12" max="12" step="1" aria-label="${EQ_LABELS[i]}"></div>
                <span>${EQ_SHORT[i]}</span>
              </div>`).join("")}
          </div>
          <div class="yal-chips">
            ${Object.keys(PRESETS).map(p => `<button type="button" class="yal-chip" data-preset="${p}">${p}</button>`).join("")}
          </div>
        </section>

        <section class="yal-card yal-wide yal-lyr">
          <h3>Sözlər</h3>
          <div class="yal-preview" title="Üzərinə gətirin">
            <div class="yal-line now">ABC123</div>
          </div>
          <div class="yal-group-label">Şrift</div>
          <div class="yal-chips">${fontChips}</div>
          <div class="yal-group-label">Düzülüş</div>
          <div class="yal-chips">${alignChips}</div>
          <div class="yal-group-label">Animasiya</div>
          <div class="yal-chips"><button type="button" class="yal-chip yal-fxbtn" data-action="fxopen"></button></div>
          ${slider("lyrFxSpeed", "Animasiya sürəti", 40, 200, 10)}
          ${slider("lyrSize", "Ölçü", 60, 160, 5)}
          ${slider("lyrWeight", "Qalınlıq", 400, 900, 100)}
          ${slider("lyrLine", "Sətir aralığı", 1.1, 2.2, 0.05)}
          ${slider("lyrTop", "Aktiv sətirin yeri", 20, 70, 1)}
          ${slider("lyrPad", "Kənar boşluq", 0, 160, 4)}
        </section>
        <section class="yal-card yal-wide yal-kofi-card">
          <div>
            <h3>Dəstək</h3>
            <p>Layihənin inkişafına dəstək olmaq istəyirsən? Ko-fi səhifəsindən bir fincan qəhvə ilə dəstək ola bilərsən.</p>
          </div>
          <a class="yal-kofi" href="https://ko-fi.com/ruslansharifov" target="_blank" rel="noopener noreferrer">${ICON_KOFI}<span>Ko-fi-də dəstək ol</span></a>
        </section>
      </div>

      <div class="yal-fxpop" id="yal-fxpop">
        <div class="yal-fxcard" role="dialog" aria-label="Animasiya seç">
          <div class="yal-fxhead">
            <span>Animasiya seç</span>
            <button class="yal-ib yal-x" type="button" data-action="fxclose" aria-label="Bağla" title="Bağla">${ICON_CLOSE}</button>
          </div>
          <div class="yal-fxgrid">
            ${FX_MODES.map(([id, name]) => `
              <button type="button" class="yal-fxtile fx-${id}" data-fx="${id}">
                <span class="yal-fxname">${name}</span>
                <span class="yal-fxsample"><span class="yal-line now">ABC123</span></span>
              </button>`).join("")}
          </div>
          <p class="yal-fxhint">Üzərinə gətirin — animasiya oynayacaq. Klik edəndə seçilir.</p>
        </div>
      </div>

      <div class="yal-foot">
        <div class="yal-status" role="status"></div>
        <button type="button" class="yal-ghost" data-action="reset" title="Bütün ayarları sıfırla">Sıfırla</button>
      </div>`;

    splitChars(root.querySelector(".yal-preview .yal-line"), "ABC123");
    root.querySelectorAll(".yal-fxtile .yal-line").forEach(el => splitChars(el, "ABC123"));

    root.addEventListener("input", e => {
      const t = e.target;
      if (t.type !== "range") return;
      paintRange(t);
      if (t.dataset.band !== undefined) {
        const bands = [...settings.eqBands];
        bands[+t.dataset.band] = +t.value;
        save({ eqBands: bands });
        applyEq(); syncUI();
      } else {
        const k = t.dataset.k;
        save({ [k]: k === "ambientIntensity" ? +t.value / 100 : +t.value });
        if (k === "ambientGap") applyLayout();
        else if (k.startsWith("lyr")) applyLyrics();
        else if (k === "cardTransparency" || k === "textShadow") applyCards();
        else applyAmbient();
        updateOut(k);
      }
    });

    root.addEventListener("change", e => {
      const t = e.target;
      if (t.type === "checkbox") { save({ [t.dataset.k]: t.checked }); applyAll(); }
      if (t.type === "range") flushSave(); // a slider released = written to storage at once
    });

    root.addEventListener("click", e => {
      if (e.target.classList.contains("yal-fxpop")) { root.classList.remove("yal-fx-open"); return; }
      const tile = e.target.closest("[data-fx]");
      if (tile) {
        save({ lyrFx: tile.dataset.fx }); flushSave(); applyLyrics(); syncUI();
        root.classList.remove("yal-fx-open");
        return;
      }
      const lf = e.target.closest("[data-lyr-font]");
      if (lf) { save({ lyrFont: lf.dataset.lyrFont }); flushSave(); applyLyrics(); syncUI(); return; }
      const la = e.target.closest("[data-lyr-align]");
      if (la) { save({ lyrAlign: la.dataset.lyrAlign }); flushSave(); applyLyrics(); syncUI(); return; }
      const chip = e.target.closest("[data-preset]");
      if (chip) { save({ eqBands: [...PRESETS[chip.dataset.preset]], eqOn: true }); applyAll(); return; }
      const act = e.target.closest("[data-action]");
      if (!act) return;
      const a = act.dataset.action;
      if (a === "close") closeWindow();
      else if (a === "theme") { save({ theme: settings.theme === "light" ? "dark" : "light" }); applyTheme(); }
      else if (a === "transcript") openTranscript();
      else if (a === "fxopen") root.classList.add("yal-fx-open");
      else if (a === "fxclose") root.classList.remove("yal-fx-open");
      else if (a === "reset") {
        // two-step: first click arms, second click (within 3 s) resets
        if (act.dataset.armed) { factoryReset(); return; }
        act.dataset.armed = "1"; act.textContent = "Əminsiniz?"; act.classList.add("armed");
        setTimeout(() => { delete act.dataset.armed; act.textContent = "Sıfırla"; act.classList.remove("armed"); }, 3000);
      }
    });

    // keep YouTube hotkeys (space, arrows, f, m …) from firing while the window has focus
    root.addEventListener("keydown", e => {
      if (e.key === "Escape") { if (root.classList.contains("yal-fx-open")) root.classList.remove("yal-fx-open"); else closeWindow(); }
      e.stopPropagation();
    });

    document.body.appendChild(root);
    applyTheme();
  }

  function buildResetButton() {
    resetBtn = document.createElement("button");
    resetBtn.id = "yal-reset";
    resetBtn.type = "button";
    resetBtn.title = "Fabrika ayarları: hamısını sıfırla";
    resetBtn.setAttribute("aria-label", "Fabrika ayarları");
    resetBtn.textContent = "↺";
    resetBtn.addEventListener("click", factoryReset);
    document.body.appendChild(resetBtn); // visible only in focus mode (see CSS)
  }

  function setStatus(msg) {
    if (!root) return;
    const s = root.querySelector(".yal-status");
    s.textContent = msg; s.title = msg;
  }

  function fmt(k, v) {
    if (k === "ambientBlur") return v + " px";
    if (k === "ambientSpread") return v + "%";
    if (k === "ambientIntensity") return Math.round(v * 100) + "%";
    if (k === "ambientGap") return v + " px";
    if (k === "lyrSize" || k === "lyrTop") return v + "%";
    if (k === "lyrPad") return v + " px";
    if (k === "lyrFxSpeed") return v + "%";
    if (k === "cardTransparency" || k === "textShadow") return v + "%";
    if (k === "lyrLine") return Number(v).toFixed(2);
    return v;
  }

  // fills the left part of a slider track (CSS reads --p)
  function paintRange(el) {
    const min = +el.min, max = +el.max;
    el.style.setProperty("--p", (max > min ? ((+el.value - min) / (max - min)) * 100 : 0) + "%");
  }

  function updateOut(k) {
    const out = root && root.querySelector(`output[data-out="${k}"]`);
    if (out) out.textContent = fmt(k, settings[k]);
  }

  function syncUI() {
    if (!root) return;
    root.querySelectorAll("[data-k]").forEach(el => {
      const k = el.dataset.k;
      if (el.type === "checkbox") el.checked = !!settings[k];
      else { el.value = k === "ambientIntensity" ? Math.round(settings[k] * 100) : settings[k]; paintRange(el); }
      updateOut(k);
    });
    const bands = Array.isArray(settings.eqBands) ? settings.eqBands : DEFAULTS.eqBands;
    root.querySelectorAll("[data-band]").forEach(el => {
      const i = +el.dataset.band;
      const v = Number(bands[i]) || 0;
      el.value = v; paintRange(el);
      root.querySelector(`output[data-bout="${i}"]`).textContent = (v > 0 ? "+" : "") + v;
    });
    root.querySelectorAll("[data-preset]").forEach(c =>
      c.classList.toggle("on", !!settings.eqOn && PRESETS[c.dataset.preset].every((v, i) => v === (Number(bands[i]) || 0))));
    root.querySelectorAll("[data-lyr-font]").forEach(c => c.classList.toggle("on", c.dataset.lyrFont === settings.lyrFont));
    root.querySelectorAll("[data-lyr-align]").forEach(c => c.classList.toggle("on", c.dataset.lyrAlign === settings.lyrAlign));
    const fxb = root.querySelector(".yal-fxbtn");
    if (fxb) fxb.textContent = "Animasiya: " + FX_LABEL[settings.lyrFx] + "  ▸";
    root.querySelectorAll("[data-fx]").forEach(t => t.classList.toggle("on", t.dataset.fx === settings.lyrFx));
    root.classList.toggle("yal-focus-off", !settings.focusOn);
    if (btn) btn.classList.toggle("on", settings.ambientOn);
    if (focusBtn) focusBtn.classList.toggle("on", settings.focusOn);
  }

  function openWindow() {
    const host = document.fullscreenElement || document.body;
    if (root.parentElement !== host) host.appendChild(root);
    syncUI();
    root.classList.add("open");
  }
  function closeWindow() { root && root.classList.remove("open"); }
  function toggleWindow() { root.classList.contains("open") ? closeWindow() : openWindow(); }

  document.addEventListener("click", e => {
    if (!root || !root.classList.contains("open")) return;
    if (root.contains(e.target) || (btn && btn.contains(e.target))) return;
    closeWindow();
  }, true);
  document.addEventListener("fullscreenchange", () => {
    if (root && root.classList.contains("open")) openWindow();
    paint(true);
  });

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    applyLayout();
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (settings.focusOn) { applyFocusDom(); scheduleSafety(); }
    }, 200);
  });

  /* ---------- Wiring & global apply ---------- */
  const onVideoEvent = () => paint(true);
  function attachVideo() {
    const v = document.querySelector("#movie_player video");
    if (v && v !== video) {
      video = v;
      ["loadeddata", "seeked", "play", "pause"].forEach(ev => v.addEventListener(ev, onVideoEvent));
      applyAll();
    }
  }

  function applyAll() {
    applyTheme();
    applyAmbient();
    applyVideoOn();
    applyEq();
    applyCaptions();
    applyLyrics();
    applyCards();
    applyFocus();
    syncUI();
  }

  // changes from elsewhere (toolbar ON/OFF, another tab). Our own echoes and keys still waiting to be saved are ignored.
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;
    let changed = false;
    for (const k in changes) {
      if (k in pendingSave) continue;
      const v = changes[k].newValue ?? DEFAULTS[k];
      if (JSON.stringify(v) !== JSON.stringify(settings[k])) { settings[k] = v; changed = true; }
    }
    if (changed) applyAll();
  });

  /* ---------- DOM watching: throttled, and blind to our own nodes ---------- */
  const ours = n => {
    const el = n.nodeType === 1 ? n : n.parentElement;
    return !!(el && el.closest && el.closest("#yal-window, #yal-lyrics, #yal-reset, #yal-ambient"));
  };
  function onDomChange() {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      video = null;
      resetLyrics();
      ensureLyrics(); // new video: its own captions only
    }
    mountButtons();
    mountSide();
    attachVideo();
    if (settings.focusOn) applyFocusDom();
  }
  let domTimer = null;
  function scheduleDom() {
    if (domTimer) return;
    domTimer = setTimeout(() => { domTimer = null; onDomChange(); }, 250);
  }
  new MutationObserver(muts => {
    if (muts.every(m => ours(m.target))) return;
    scheduleDom();
  }).observe(document.body, { childList: true, subtree: true });
  document.addEventListener("yt-navigate-finish", scheduleDom);
  document.addEventListener("yt-navigate-start", () => resetLyrics());

  /* ---------- One animation-frame loop instead of three timers; idle while the tab is hidden ---------- */
  let lastTick = 0, lastLive = 0;
  function frame(ts) {
    requestAnimationFrame(frame);
    if (ts - lastTick < 100) return;
    lastTick = ts;
    paint();
    updateLyrics();
    if (ts - lastLive >= 150) { lastLive = ts; tickLive(); }
  }

  load().then(() => {
    document.documentElement.appendChild(ambient);
    buildWindow();
    buildFocusLayers();
    buildResetButton();
    applyTheme();
    applyLyrics();
    applyCards();
    applyAmbient();
    mountButtons();
    mountSide();
    attachVideo();
    applyAll();
    requestAnimationFrame(frame);
  });
})();

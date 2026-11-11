/* YouTube Ambient Light: content script
   Glass UI, ambient glow, LED glow toggle, right panel tabs,
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
    neonOn: true,
    videoOn: true,
    captions: false,
    eqOn: false,
    eqBands: [0, 0, 0, 0, 0],
    focusOn: false,
    focusLyrics: false
  };
  const EQ_FREQS = [60, 250, 1000, 4000, 12000];
  const EQ_LABELS = ["60 Hz", "250 Hz", "1 kHz", "4 kHz", "12 kHz"];
  const PRESETS = { "Flat": [0,0,0,0,0], "Bass": [6,4,0,-1,-2], "Vokal": [-2,0,3,4,1], "Kino": [4,2,0,3,5] };
  const ICON_AMBIENT = `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
    <rect x="3" y="5" width="18" height="11" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/>
    <path d="M8 20h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="12" cy="10.5" r="2.6" fill="currentColor" opacity=".85"/></svg>`;
  const ICON_FOCUS = `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
    <path d="M4 9V5h4M20 9V5h-4M4 15v4h4M20 15v4h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <circle cx="12" cy="12" r="2.6" fill="currentColor"/></svg>`;
  const MUSIC_SVG = `<svg class="yal-note" viewBox="0 0 24 24" aria-label="musiqi" role="img">
    <path d="M9 18V5l11-2v13" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="6" cy="18" r="3" fill="currentColor"/><circle cx="17" cy="16" r="3" fill="currentColor"/></svg>`;

  let settings = { ...DEFAULTS };
  let video = null, audioCtx = null, eqNodes = null;
  let btn = null, focusBtn = null, root = null, resetBtn = null, lastUrl = location.href;
  const eqByVideo = new WeakMap();
  const lyr = { lines: [], idx: -1, key: null, loadId: 0, mode: null, live: null };

  const load = () => new Promise(res =>
    chrome.storage.sync.get(DEFAULTS, i => { settings = { ...DEFAULTS, ...i }; res(); }));
  const save = patch => { settings = { ...settings, ...patch }; chrome.storage.sync.set(patch); };
  const videoKey = () => new URL(location.href).searchParams.get("v");

  /* ---------- Factory reset ---------- */
  function factoryReset() {
    chrome.storage.sync.clear(() => chrome.storage.sync.set(DEFAULTS, () => location.reload()));
  }

  /* ---------- Ambient glow ---------- */
  const ambient = document.createElement("div");
  ambient.id = "yal-ambient";
  const canvas = document.createElement("canvas");
  canvas.width = 160; canvas.height = 90;
  const cctx = canvas.getContext("2d");
  ambient.appendChild(canvas);

  function paint() {
    if (!video || !settings.ambientOn || video.readyState < 2) return;
    try { cctx.drawImage(video, 0, 0, canvas.width, canvas.height); } catch (_) {}
  }

  function applyAmbient() {
    ambient.style.display = settings.ambientOn ? "block" : "none";
    ambient.style.setProperty("--yal-blur", settings.ambientBlur + "px");
    ambient.style.setProperty("--yal-scale", settings.ambientSpread / 100);
    ambient.style.setProperty("--yal-opacity", settings.ambientIntensity);
    document.documentElement.classList.toggle("yal-on", settings.ambientOn);
    document.documentElement.classList.toggle("yal-led", settings.neonOn);
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

  /* ---------- Equalizer ---------- */
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
    if (settings.eqOn) ensureEq();
    if (audioCtx && audioCtx.state === "suspended" && settings.eqOn) audioCtx.resume();
    if (eqNodes) eqNodes.forEach((b, i) => { b.gain.value = settings.eqOn ? (settings.eqBands[i] ?? 0) : 0; });
  }

  /* ---------- Video picture, captions button, transcript ---------- */
  function applyVideoOn() {
    document.documentElement.classList.toggle("yal-audio-only", !settings.videoOn);
  }

  function applyCaptions() {
    const want = settings.captions || (settings.focusOn && settings.focusLyrics && lyr.mode === "live");
    const cc = document.querySelector(".ytp-subtitles-button");
    if (!cc) return;
    const pressed = cc.getAttribute("aria-pressed") === "true";
    if (want !== pressed) cc.click();
  }

  function openTranscript() {
    const b = [...document.querySelectorAll("button")]
      .find(x => /transcript|transkript/i.test(x.getAttribute("aria-label") || x.textContent || ""));
    setStatus(b ? "Transkript açıldı." : "Bu videoda transkript tapılmadı.");
    if (b) b.click();
  }

  /* ---------- Right panel: glass card with tabs ---------- */
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
          <button type="button" data-tab="comments" class="on">Yorumlar</button>
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
    if (!right.querySelector(".yal-ctrl")) {
      btn = document.createElement("button");
      btn.className = "ytp-button yal-ctrl";
      btn.title = "Ambient işıq ayarları";
      btn.setAttribute("aria-label", "Ambient işıq ayarları");
      btn.innerHTML = ICON_AMBIENT;
      btn.addEventListener("click", e => { e.stopPropagation(); toggleWindow(); });
      const gear = right.querySelector(".ytp-settings-button");
      const cc = right.querySelector(".ytp-subtitles-button");
      right.insertBefore(btn, gear ? gear.nextSibling : (cc ? cc.nextSibling : right.firstChild));
    }
    if (!right.querySelector(".yal-focus-ctrl")) {
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
    }
    syncUI();
  }

  /* ---------- Focus mode: hide siblings along the player's ancestor path ---------- */
  const FOCUS_ATTR = "data-yal-hidden";
  const KEEP_SKIP = new Set(["SCRIPT", "STYLE", "LINK", "TEMPLATE", "SVG", "NOSCRIPT"]);
  const isOurs = el => (el.id && el.id.startsWith("yal-")) || KEEP_SKIP.has(el.tagName);

  function applyFocusDom() {
    document.querySelectorAll("[" + FOCUS_ATTR + "]").forEach(el => {
      if (!settings.focusOn) el.removeAttribute(FOCUS_ATTR);
    });
    if (!settings.focusOn) return;
    const player = document.querySelector("#movie_player");
    if (!player) return;
    const keep = new Set();
    for (let n = player; n && n !== document.documentElement; n = n.parentElement) keep.add(n);
    keep.add(document.documentElement);
    keep.forEach(n => {
      const parent = n.parentElement;
      if (!parent) return;
      [...parent.children].forEach(c => {
        if (!keep.has(c) && !isOurs(c)) c.setAttribute(FOCUS_ATTR, "");
      });
    });
  }

  /* ---------- Lyrics layer ---------- */
  function buildFocusLayers() {
    const lyrics = document.createElement("div");
    lyrics.id = "yal-lyrics";
    lyrics.innerHTML = `<div id="yal-track"></div>`;
    document.body.appendChild(lyrics);
  }

  const MUSIC_TOKEN = /^\[(?:musiqi|music|müzik|muzik|applause|alqış|alqis|laughter|gülüş|gulus)[^\]]*\]$|^[♪♫♬]+$/i;
  const TAG_TOKEN = /^\[.*\]$/;

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
    let cur = null;
    const close = () => { if (cur && cur.words.length) lines.push(cur); cur = null; };
    words.forEach(item => {
      const { t, w } = item;
      if (MUSIC_TOKEN.test(w)) { close(); lines.push({ music: true, start: t, end: t + 1.5, words: [] }); return; }
      if (TAG_TOKEN.test(w)) return;
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
        l.words.forEach((it, j) => {
          if (j) d.appendChild(document.createTextNode(" "));
          const s = document.createElement("span");
          s.className = "yal-w";
          s.textContent = it.w;
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
    const y = box.clientHeight * 0.42 - (el.offsetTop + el.offsetHeight / 2);
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
    lyr.live = { raw: "", group: null };
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
    return t.replace(/\s+/g, " ").trim();
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
      d.textContent = tx;
      g.appendChild(d);
    });
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
    if (!t || t === L.raw) return;
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

  /* ---------- Settings window ---------- */
  const slider = (k, label, min, max, step) => `
    <div class="yal-row yal-slider">
      <div class="yal-top"><span>${label}</span><output data-out="${k}"></output></div>
      <input type="range" data-k="${k}" min="${min}" max="${max}" step="${step}">
    </div>`;
  const toggle = (k, label) => `
    <label class="yal-row"><span>${label}</span>
      <span class="yal-sw"><input type="checkbox" data-k="${k}"><i></i></span>
    </label>`;

  function buildWindow() {
    root = document.createElement("div");
    root.id = "yal-window";
    root.innerHTML = `
      <div class="yal-head">
        <b>Ambient Light</b>
        <div class="yal-head-actions">
          <button class="yal-reset-btn" type="button" data-action="reset">↺ Fabrika ayarları</button>
          <button class="yal-x" type="button" aria-label="Bağla">✕</button>
        </div>
      </div>
      <div class="yal-scroll">
        <details class="yal-sec" open>
          <summary>Ambient işıq</summary>
          ${toggle("ambientOn", "Ambient işıq aktivdir")}
          ${slider("ambientBlur", "Bulanıqlıq", 10, 150, 1)}
          ${slider("ambientSpread", "Yayılma", 100, 200, 5)}
          ${slider("ambientIntensity", "Intensivlik", 10, 100, 5)}
          ${toggle("neonOn", "Videonun kənarında LED parıltı")}
        </details>

        <details class="yal-sec">
          <summary>Video yüklənməsi</summary>
          ${toggle("videoOn", "Videonu göstər (söndürsəniz yalnız səs qalır)")}
          ${slider("ambientGap", "Margin (yalnız fokus rejimində)", 0, 200, 5)}
        </details>

        <details class="yal-sec">
          <summary>Səsin ayrıca yüklənməsi</summary>
          ${toggle("eqOn", "Ekvalayzer")}
          ${EQ_FREQS.map((_, i) => `
            <div class="yal-row yal-slider">
              <div class="yal-top"><span>${EQ_LABELS[i]}</span><output data-bout="${i}"></output></div>
              <input type="range" data-band="${i}" min="-12" max="12" step="1">
            </div>`).join("")}
          <div class="yal-chips">
            ${Object.keys(PRESETS).map(p => `<button type="button" class="yal-chip" data-preset="${p}">${p}</button>`).join("")}
          </div>
        </details>

        <details class="yal-sec">
          <summary>Alt yazı yüklənməsi</summary>
          ${toggle("captions", "Altyazı (ekranın altında)")}
          <div class="yal-chips"><button type="button" class="yal-btn" data-action="transcript">📝 Transkripti aç</button></div>
        </details>

        <details class="yal-sec">
          <summary>Fokus rejimi</summary>
          ${toggle("focusOn", "Fokus rejimi (yalnız video, ortada)")}
          ${toggle("focusLyrics", "Fokusda sözlər (video solda, sözlər sağda)")}
        </details>

        <div class="yal-status"></div>
      </div>`;

    root.addEventListener("input", e => {
      const t = e.target;
      if (t.dataset.band !== undefined) {
        const bands = [...settings.eqBands];
        bands[+t.dataset.band] = +t.value;
        save({ eqBands: bands });
        applyEq(); syncUI();
      } else if (t.type === "range") {
        const k = t.dataset.k;
        save({ [k]: k === "ambientIntensity" ? +t.value / 100 : +t.value });
        applyAll();
      }
    });
    root.addEventListener("change", e => {
      const t = e.target;
      if (t.type === "checkbox") { save({ [t.dataset.k]: t.checked }); applyAll(); }
    });
    root.addEventListener("click", e => {
      const t = e.target;
      if (t.dataset.preset) { save({ eqBands: PRESETS[t.dataset.preset], eqOn: true }); applyAll(); }
      if (t.dataset.action === "transcript") openTranscript();
      if (t.dataset.action === "reset") factoryReset();
      if (t.classList.contains("yal-x")) closeWindow();
    });
    document.body.appendChild(root);
  }

  function buildResetButton() {
    resetBtn = document.createElement("button");
    resetBtn.id = "yal-reset";
    resetBtn.type = "button";
    resetBtn.title = "Fabrika ayarları: hamısını sıfırla";
    resetBtn.setAttribute("aria-label", "Fabrika ayarları");
    resetBtn.textContent = "↺";
    resetBtn.addEventListener("click", factoryReset);
    document.body.appendChild(resetBtn);
  }

  function setStatus(msg) { if (root) root.querySelector(".yal-status").textContent = msg; }

  function fmt(k, v) {
    if (k === "ambientBlur") return v + " px";
    if (k === "ambientSpread") return v + "%";
    if (k === "ambientIntensity") return Math.round(v * 100) + "%";
    if (k === "ambientGap") return v + " px";
    return v;
  }

  function syncUI() {
    if (!root) return;
    root.querySelectorAll("[data-k]").forEach(el => {
      const k = el.dataset.k;
      if (el.type === "checkbox") el.checked = !!settings[k];
      else el.value = k === "ambientIntensity" ? Math.round(settings[k] * 100) : settings[k];
      const out = root.querySelector(`output[data-out="${k}"]`);
      if (out) out.textContent = fmt(k, settings[k]);
    });
    root.querySelectorAll("[data-band]").forEach(el => {
      const i = +el.dataset.band;
      const v = (Array.isArray(settings.eqBands) && settings.eqBands[i]) ?? 0;
      el.value = v;
      root.querySelector(`output[data-bout="${i}"]`).textContent = (v > 0 ? "+" : "") + v + " dB";
    });
    if (btn) btn.classList.toggle("on", settings.ambientOn);
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
  function attachVideo() {
    const v = document.querySelector("#movie_player video");
    if (v && v !== video) {
      video = v;
      ["loadeddata", "seeked", "play"].forEach(ev => v.addEventListener(ev, paint));
      applyAll();
    }
  }

  function applyAll() {
    applyAmbient();
    applyVideoOn();
    applyEq();
    applyCaptions();
    applyFocus();
    syncUI();
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;
    for (const k in changes) settings[k] = changes[k].newValue ?? DEFAULTS[k];
    applyAll();
  });

  let pending = false;
  new MutationObserver(() => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        video = null;
        ensureLyrics(); // new video: its own captions only
      }
      mountButtons();
      mountSide();
      attachVideo();
      if (settings.focusOn) applyFocusDom();
    });
  }).observe(document.body, { childList: true, subtree: true });

  setInterval(paint, 120);
  setInterval(updateLyrics, 100);
  setInterval(tickLive, 150);

  load().then(() => {
    document.documentElement.appendChild(ambient);
    buildWindow();
    buildFocusLayers();
    buildResetButton();
    applyAmbient();
    mountButtons();
    mountSide();
    attachVideo();
    applyAll();
  });
})();

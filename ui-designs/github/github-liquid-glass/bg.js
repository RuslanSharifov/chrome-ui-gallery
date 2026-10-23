/* Background effects on one canvas, drawn behind the whole GitHub UI (z-index:-1).
   matrix · contribution grid · git graph · aurora · stars · mesh. Pauses in hidden tabs; prefers-reduced-motion
   renders one still frame instead of animating. create(host, interactive) -> { update(settings, mode), destroy() } */
(function (global) {
  "use strict";

  const GL = {
    code: "{}[]()<>/\\=;:+-*#$%&|!?~^_01",
    hex: "0123456789abcdef", binary: "01",
    katakana: "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789",
    gitsym: "⑂★☆✓✗+−~↑↓⇄⎇#@"
  };
  const QUALITY = { low: { fps: 20, dpr: .5 }, medium: { fps: 30, dpr: .75 }, high: { fps: 60, dpr: 1 } };
  const rnd = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const hsl = (h, l, a) => `hsl(${Math.round(h % 360)} 80% ${l}% / ${a ?? 1})`;

  function create(host, interactive) {
    const canvas = document.createElement("canvas");
    canvas.className = "gug-bg"; canvas.setAttribute("aria-hidden", "true");
    host.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    if (!ctx) { canvas.remove(); return null; }
    const motion = typeof matchMedia === "function" ? matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };

    let s = GUG.normalize(null), mode = "dark", pal = GUG.bgPalette(s, mode), sig = "", eff = null;
    let w = 0, h = 0, dpr = .75, raf = 0, last = 0, t = 0, running = false;
    const mouse = { x: -999, y: -999 };
    const col = (c, a) => `rgb(${c} / ${a})`;
    const levelColor = i => pal.rainbow ? hsl(i * 70 + t * 20, 60) : `rgb(${pal.levels[clamp(i, 0, 4)]})`;
    const speedMul = () => .2 + (s.bgSpeed / 100) * 2;

    /* ---------------- effects ---------------- */
    const EFFECTS = {
      matrix() {
        const fs = s.matrixSize, glyphs = GL[s.matrixGlyphs] || GL.code, cols = Math.ceil(w / fs), drops = [];
        const active = .3 + s.bgDensity / 100 * .7;
        for (let i = 0; i < cols; i++) drops.push({ row: rnd(-h / fs, 0), v: rnd(.5, 1.6), acc: 0, on: Math.random() < active });
        const pick = () => glyphs[(Math.random() * glyphs.length) | 0];
        ctx.font = `${fs}px SFMono-Regular, Consolas, "Liberation Mono", monospace`; ctx.textBaseline = "top";
        return {
          scale: 1,
          step(dt) {
            const fade = .22 - (s.matrixTrail - 10) / 90 * .185;
            ctx.globalCompositeOperation = "destination-out"; ctx.fillStyle = `rgb(0 0 0 / ${fade})`; ctx.fillRect(0, 0, w, h);
            ctx.globalCompositeOperation = "source-over"; ctx.font = `${fs}px SFMono-Regular, Consolas, "Liberation Mono", monospace`;
            drops.forEach((d, i) => {
              if (!d.on) { if (Math.random() < .002) d.on = true; return; }
              const x = i * fs, boost = interactive && Math.abs(x - mouse.x) < 140 ? 1.9 : 1;
              d.acc += dt * speedMul() * d.v * 14 * boost;
              const body = pal.rainbow ? hsl(i * 9 + t * 40, 58) : `rgb(${pal.body})`;
              while (d.acc >= 1) {
                d.acc -= 1; d.row++;
                const y = d.row * fs;
                if (d.row > 0) { ctx.fillStyle = body; ctx.fillText(pick(), x, y - fs); }
                if (s.matrixHead) { ctx.fillStyle = `rgb(${pal.head})`; ctx.shadowColor = `rgb(${pal.body})`; ctx.shadowBlur = 8; } else ctx.fillStyle = body;
                ctx.fillText(pick(), x, y); ctx.shadowBlur = 0;
                if (y > h + 40 && Math.random() > .96) { d.row = -rnd(2, 30); d.v = rnd(.5, 1.6); d.on = Math.random() < active + .15; }
              }
            });
          }
        };
      },

      contrib() {
        const cell = s.gridCell, gap = s.gridGap, pitch = cell + gap, cols = Math.ceil(w / pitch) + 1, rows = Math.ceil(h / pitch) + 1, n = cols * rows;
        const lvl = new Float32Array(n), tgt = new Float32Array(n), dens = s.bgDensity / 100;
        const roll = () => Math.min(4, Math.floor(Math.pow(Math.random(), 2.4 - dens * 1.6) * 5));
        for (let i = 0; i < n; i++) { tgt[i] = roll(); lvl[i] = tgt[i]; }
        return {
          scale: 1,
          step(dt) {
            ctx.clearRect(0, 0, w, h);
            const sm = speedMul(), wave = s.gridWave / 100, flips = Math.ceil(n * dt * .06 * sm);
            for (let k = 0; k < flips; k++) tgt[(Math.random() * n) | 0] = roll();
            const paths = [[], [], [], [], []];
            for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
              const i = r * cols + c; lvl[i] += (tgt[i] - lvl[i]) * Math.min(1, dt * 3 * sm);
              const x = c * pitch, y = r * pitch;
              let L = lvl[i] + wave * 2.2 * Math.max(0, Math.sin((c + r) * .22 - t * sm * 1.4)) ** 3;
              if (interactive) { const dx = x - mouse.x, dy = y - mouse.y, d2 = dx * dx + dy * dy; if (d2 < 24000) L += 2.5 * (1 - d2 / 24000); }
              paths[clamp(Math.round(L), 0, 4)].push(x, y);
            }
            const rad = Math.max(2, cell * .2);
            for (let l = 0; l < 5; l++) {
              ctx.beginPath();
              const p = paths[l];
              for (let k = 0; k < p.length; k += 2) { if (ctx.roundRect) ctx.roundRect(p[k], p[k + 1], cell, cell, rad); else ctx.rect(p[k], p[k + 1], cell, cell); }
              ctx.globalAlpha = l === 0 ? .55 : .5 + l * .12; ctx.fillStyle = levelColor(l); ctx.fill();
            }
            ctx.globalAlpha = 1;
          }
        };
      },

      gitgraph() {
        const N = s.gitLanes, lanes = [], conns = [], gapMul = 1.5 - s.bgDensity / 100;
        const laneColor = i => pal.rainbow ? hsl(i * 55 + t * 15, 62) : `rgb(${pal.levels[2 + (i % 3)]})`;
        for (let i = 0; i < N; i++) lanes.push({ y: (i + 1) / (N + 1) * h, nodes: [], last: rnd(-120, 0) });
        const spawn = (i, x) => {
          const L = lanes[i], node = { x, y: L.y, big: Math.random() < .12 }; L.nodes.push(node);
          if (Math.random() < .35) {
            const j = clamp(i + (Math.random() < .5 ? -1 : 1), 0, N - 1);
            if (j !== i) { const cand = lanes[j].nodes.slice(-4).filter(m => Math.abs(m.x - x) < 280 && m.x < x); if (cand.length) conns.push({ a: cand[cand.length - 1], b: node, lane: j }); }
          }
        };
        for (let i = 0; i < N; i++) while (lanes[i].last < w + 60) { lanes[i].last += rnd(50, 120) * gapMul; spawn(i, lanes[i].last); }
        return {
          scale: 1,
          step(dt) {
            const v = (24 + s.bgSpeed * 1.1) * dt;
            lanes.forEach((L, i) => {
              L.nodes.forEach(n => { n.x -= v; }); L.last -= v;
              while (L.last < w + 60) { L.last += rnd(50, 120) * gapMul; spawn(i, L.last); }
              while (L.nodes.length && L.nodes[0].x < -320) L.nodes.shift();
            });
            for (let k = conns.length - 1; k >= 0; k--) if (conns[k].b.x < -320) conns.splice(k, 1);
            ctx.clearRect(0, 0, w, h); ctx.lineCap = "round";
            lanes.forEach((L, i) => {
              ctx.strokeStyle = laneColor(i); ctx.globalAlpha = .45; ctx.lineWidth = 2; ctx.beginPath();
              L.nodes.forEach((n, k) => { if (k) { ctx.lineTo(n.x, n.y); } else ctx.moveTo(n.x, n.y); }); ctx.stroke();
            });
            conns.forEach(c => {
              const a = c.a, b = c.b, mx = (a.x + b.x) / 2; ctx.strokeStyle = laneColor(c.lane); ctx.globalAlpha = .5; ctx.lineWidth = 2;
              ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.bezierCurveTo(mx, a.y, mx, b.y, b.x, b.y); ctx.stroke();
            });
            lanes.forEach((L, i) => {
              ctx.fillStyle = laneColor(i);
              L.nodes.forEach(n => {
                if (n.x < -10 || n.x > w + 10) return;
                const near = interactive && Math.hypot(n.x - mouse.x, n.y - mouse.y) < 110, r = (n.big ? 6 : 4) + (near ? 2 : 0);
                ctx.globalAlpha = .9; ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, 6.283); ctx.fill();
                ctx.globalAlpha = near ? .55 : .28; ctx.beginPath(); ctx.arc(n.x, n.y, r + 4, 0, 6.283); ctx.strokeStyle = laneColor(i); ctx.lineWidth = 1.5; ctx.stroke();
              });
            });
            ctx.globalAlpha = 1;
          }
        };
      },

      aurora(still) {
        const blobs = [0, 1, 2, 3, 4].map(i => ({ i, ph: rnd(0, 6.28), sp: rnd(.5, 1.1) }));
        return {
          scale: .35,
          step() {
            ctx.clearRect(0, 0, w, h); const R = Math.max(w, h), tt = still ? 0 : t * .25 * speedMul();
            ctx.globalCompositeOperation = pal.dark ? "lighter" : "source-over";
            const cA = (i, a) => pal.rainbow ? hsl(i * 70 + tt * 30, pal.dark ? 55 : 62, a) : `rgb(${pal.levels[2 + (i % 3)]} / ${a})`;
            blobs.forEach(b => {
              const x = w * (.5 + .42 * Math.sin(tt * b.sp + b.ph + b.i)), y = h * (.5 + .38 * Math.cos(tt * b.sp * .8 + b.ph * 1.3));
              const g = ctx.createRadialGradient(x, y, 0, x, y, R * (.32 + .1 * (b.i % 3)));
              g.addColorStop(0, cA(b.i, .55)); g.addColorStop(1, cA(b.i, 0));
              ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
            });
            ctx.globalCompositeOperation = "source-over";
          }
        };
      },

      stars() {
        const n = Math.round(50 + s.bgDensity * 3.2), stars = [];
        for (let i = 0; i < n; i++) stars.push({ x: rnd(0, w), y: rnd(0, h), z: rnd(.25, 1), ph: rnd(0, 6.28), big: Math.random() < .08 });
        let shoot = null, nextShoot = rnd(2, 6);
        return {
          scale: 1,
          step(dt) {
            ctx.clearRect(0, 0, w, h); const sm = speedMul(), px = interactive && mouse.x > 0 ? (mouse.x / w - .5) * 24 : 0, py = interactive && mouse.y > 0 ? (mouse.y / h - .5) * 14 : 0;
            stars.forEach((st, i) => {
              st.x -= dt * 6 * st.z * sm; if (st.x < -8) st.x = w + 8;
              const x = st.x - px * st.z, y = st.y - py * st.z, tw = .55 + .45 * Math.sin(t * 2 * sm + st.ph);
              ctx.globalAlpha = tw * (.35 + st.z * .65); ctx.fillStyle = pal.rainbow ? hsl(i * 40, 70) : `rgb(${i % 4 === 0 ? pal.head : pal.body})`;
              if (st.big) { const r = 2 + st.z * 3; ctx.beginPath(); ctx.moveTo(x, y - r * 2); ctx.quadraticCurveTo(x, y, x + r * 2, y); ctx.quadraticCurveTo(x, y, x, y + r * 2); ctx.quadraticCurveTo(x, y, x - r * 2, y); ctx.quadraticCurveTo(x, y, x, y - r * 2); ctx.fill(); }
              else { ctx.beginPath(); ctx.arc(x, y, st.z * 1.5, 0, 6.283); ctx.fill(); }
            });
            if (s.starsShoot) {
              nextShoot -= dt; if (!shoot && nextShoot <= 0) { shoot = { x: rnd(w * .4, w), y: rnd(0, h * .4), life: 0 }; nextShoot = rnd(4, 9) / Math.max(.4, sm); }
              if (shoot) {
                shoot.life += dt; const k = shoot.life / .9, x = shoot.x - k * 360, y = shoot.y + k * 200;
                const g = ctx.createLinearGradient(x, y, x + 90, y - 50); g.addColorStop(0, `rgb(${pal.head} / 0.9)`); g.addColorStop(1, `rgb(${pal.head} / 0)`);
                ctx.globalAlpha = 1 - k * .6; ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 90, y - 50); ctx.stroke();
                if (k >= 1) shoot = null;
              }
            }
            ctx.globalAlpha = 1;
          }
        };
      },

      mesh() { const a = EFFECTS.aurora(true); a.still = true; return a; },
      none() { return null; }
    };

    /* ---------------- lifecycle ---------------- */
    function resize() {
      const q = QUALITY[s.quality] || QUALITY.medium, sc = (eff && eff.scale ? eff.scale : 1) * q.dpr;
      const cw = Math.max(2, canvas.clientWidth), ch = Math.max(2, canvas.clientHeight);
      const bw = Math.max(2, Math.round(cw * sc)), bh = Math.max(2, Math.round(ch * sc));
      if (canvas.width === bw && canvas.height === bh && w === cw && h === ch) return false;
      canvas.width = bw; canvas.height = bh; w = cw; h = ch; dpr = sc;
      ctx.setTransform(bw / cw, 0, 0, bh / ch, 0, 0); return true;
    }
    function init() {
      eff = (EFFECTS[s.bgEffect] || EFFECTS.none)();            // first call sizes the effect with the current w/h
      canvas.style.display = eff ? "block" : "none";
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.width = 2; canvas.height = 2; w = h = 0;            // force resize() to rebuild the buffer for the new scale
      if (!eff) return;
      resize();
      eff = EFFECTS[s.bgEffect]();                               // rebuild with real dimensions
      ctx.setTransform(canvas.width / w, 0, 0, canvas.height / h, 0, 0);
    }
    const animated = () => eff && s.bgAnimate && !motion.matches && s.bgEffect !== "mesh";
    function frame(now) {
      raf = requestAnimationFrame(frame);
      if (document.hidden || !eff) return;
      const q = QUALITY[s.quality] || QUALITY.medium;
      if (now - last < 1000 / q.fps - 2) return;
      const dt = Math.min(.06, (now - (last || now)) / 1000); last = now; t += dt;
      if (resize()) { const keep = eff; eff = EFFECTS[s.bgEffect](); if (!eff) eff = keep; }
      eff.step(dt);
    }
    function stop() { running = false; cancelAnimationFrame(raf); }
    function go() {
      stop();
      if (!eff) return;
      resize();
      // render a still frame (reduced motion / paused / mesh), otherwise start the loop
      if (!animated()) { const n = s.bgEffect === "matrix" ? 140 : s.bgEffect === "gitgraph" ? 2 : 1; for (let i = 0; i < n; i++) { t += .05; eff.step(.05); } return; }
      if (s.bgEffect === "matrix") for (let i = 0; i < 110; i++) { t += .05; eff.step(.05); }   // warm-up so trails exist immediately
      running = true; last = 0; raf = requestAnimationFrame(frame);
    }

    const onMove = e => { mouse.x = e.clientX; mouse.y = e.clientY; };
    if (interactive) window.addEventListener("pointermove", onMove, { passive: true });
    const onMotion = () => go();
    motion.addEventListener?.("change", onMotion);

    return {
      update(next, nextMode) {
        s = next; mode = nextMode || mode; pal = GUG.bgPalette(s, mode);
        const nsig = JSON.stringify([s.bgEffect, s.matrixSize, s.matrixGlyphs, s.gridCell, s.gridGap, s.gitLanes, s.bgDensity, s.quality, s.bgTheme, mode, s.bgAnimate, s.starsShoot]);
        if (nsig !== sig) { sig = nsig; init(); }
        go();
      },
      destroy() { stop(); if (interactive) window.removeEventListener("pointermove", onMove); motion.removeEventListener?.("change", onMotion); canvas.remove(); }
    };
  }

  global.GUGBG = { create };
})(globalThis);

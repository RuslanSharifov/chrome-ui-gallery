/* DARK GPT — interactive particle text.
 *
 *  createEngine(canvas, opts)  generic engine: give it a layout (lines of text + font) and it samples the glyphs into
 *                              particles that spring back to their place and react to the pointer.
 *  attach(h1, getOpts)         DOM adapter: reads the real layout of ChatGPT's headline (line by line, with wrapping),
 *                              puts a canvas INSIDE the headline so it inherits position, opacity and transforms
 *                              (entrance animation, view transitions, sidebar toggle) and keeps itself in sync.
 *
 * Performance: typed arrays, ~6 fillStyle changes per frame (colour buckets), no shadowBlur, 30 fps when idle,
 * 60 fps while the pointer is near, paused when hidden / off-screen. Nothing is drawn when the headline is gone.
 */
(function (g) {
  "use strict";

  // The canvas overhangs the headline so pushed particles and the pointer light are never clipped. The overhang grows with
  // the effect radius and with the text scale (a 200% headline extends far beyond its own box).
  function pads(o, bw, bh) {
    const over = Math.max(0, o.scale / 100 - 1);
    return {
      x: Math.min(720, Math.round(110 + o.radius * 1.45 + over * bw * 0.5)),
      y: Math.min(520, Math.round(80 + o.radius * 1.25 + over * bh * 0.5)),
    };
  }
  const MAX_PARTICLES = 6500;
  const BUCKETS = 6;
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

  function bucketColors() {
    // rest: warm white -> hot: ember red
    const from = [255, 238, 242], to = [255, 64, 86], out = [];
    for (let i = 0; i < BUCKETS; i++) {
      const t = i / (BUCKETS - 1);
      out.push("rgb(" + Math.round(lerp(from[0], to[0], t)) + "," + Math.round(lerp(from[1], to[1], t)) + "," + Math.round(lerp(from[2], to[2], t)) + ")");
    }
    return out;
  }
  const COLORS = bucketColors();

  /* ------------------------------------------------------------------ engine */
  function createEngine(canvas, init) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    let o = Object.assign({ effect: "repel", radius: 120, strength: 60, density: 60, scale: 120, reduced: false }, init);
    let layout = null;
    let W = 0, H = 0, dpr = 1, N = 0;
    let X, Y, VX, VY, HX, HY, DL, SZ, BK;
    let raf = 0, last = 0, lastDraw = 0, time = 0, running = false, visible = true, destroyed = false;
    const ptr = { cx: -1e5, cy: -1e5, active: false, x: 0, y: 0, vx: 0, vy: 0, has: false, near: 0 };
    let bursts = [];

    /* ----- sampling: layout -> particles ----- */
    function build(assemble) {
      if (!layout || layout.w < 2 || layout.h < 2) { N = 0; return; }
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = layout.w; H = layout.h;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";

      const off = document.createElement("canvas");
      off.width = canvas.width; off.height = canvas.height;
      const c = off.getContext("2d", { willReadFrequently: true });
      c.scale(dpr, dpr);
      const f = layout.font;
      c.font = f.style + " " + f.weight + " " + f.size + "px " + f.family;
      if ("letterSpacing" in c) c.letterSpacing = f.letterSpacing || "0px";
      c.textBaseline = "middle";
      c.textAlign = "left";
      c.fillStyle = "#fff";
      const s = o.scale / 100;
      c.translate(layout.cx, layout.cy); c.scale(s, s); c.translate(-layout.cx, -layout.cy);
      c.lineJoin = "round";
      c.strokeStyle = "#fff";
      c.lineWidth = Math.max(0.5, f.size * 0.035);                   // slightly bolder mask: solid strokes at small sizes
      for (const ln of layout.lines) { c.fillText(ln.text, ln.x, ln.y); c.strokeText(ln.text, ln.x, ln.y); }

      const data = c.getImageData(0, 0, off.width, off.height).data;
      const gap = lerp(2.3, 0.85, clamp01((o.density - 20) / 80));     // CSS px between samples
      const step = Math.max(1, gap * dpr);
      const xs = [], ys = [];
      for (let y = step / 2; y < off.height; y += step) {
        const row = (y | 0) * off.width;
        for (let x = step / 2; x < off.width; x += step) {
          const jx = x + (Math.random() - 0.5) * step * 0.3, jy = y + (Math.random() - 0.5) * step * 0.3;
          const ix = jx | 0, iy = jy | 0;
          if (ix < 0 || iy < 0 || ix >= off.width || iy >= off.height) continue;
          if (data[(iy * off.width + ix) * 4 + 3] > 110) { xs.push(jx / dpr); ys.push(jy / dpr); }
        }
        if (xs.length > MAX_PARTICLES * 1.4) break;
      }
      let n = xs.length;
      const keep = n > MAX_PARTICLES ? MAX_PARTICLES / n : 1;
      const prevN = N;
      N = 0;
      const nx = new Float32Array(Math.min(n, MAX_PARTICLES) + 8);
      const ny = new Float32Array(nx.length);
      for (let i = 0; i < n; i++) {
        if (keep < 1 && Math.random() > keep) continue;
        if (N >= nx.length) break;
        nx[N] = xs[i]; ny[N] = ys[i]; N++;
      }
      HX = nx; HY = ny;
      const keepPos = !assemble && X && prevN > 0;
      const ox = X, oy = Y;
      X = new Float32Array(nx.length); Y = new Float32Array(nx.length);
      VX = new Float32Array(nx.length); VY = new Float32Array(nx.length);
      DL = new Float32Array(nx.length); SZ = new Float32Array(nx.length); BK = new Uint8Array(nx.length);
      const baseR = gap * 0.5;
      for (let i = 0; i < N; i++) {
        SZ[i] = baseR * (0.85 + Math.random() * 0.35);
        if (assemble && !o.reduced) {
          // start scattered below/around the text, assemble left to right
          X[i] = HX[i] + (Math.random() - 0.5) * W * 0.9;
          Y[i] = HY[i] + 30 + Math.random() * 120;
          DL[i] = time + (HX[i] / Math.max(1, W)) * 0.5 + Math.random() * 0.2;
        } else if (keepPos && i < prevN) {
          X[i] = ox[i]; Y[i] = oy[i]; DL[i] = 0;
        } else {
          X[i] = HX[i]; Y[i] = HY[i]; DL[i] = 0;
        }
      }
    }

    /* ----- simulation ----- */
    function step(dt) {
      const k = Math.min(2, dt * 60);
      // pointer in canvas-local CSS px (handles transforms/scale of the host)
      const r = canvas.getBoundingClientRect();
      let px = 0, py = 0, act = false;
      if (r.width > 0 && r.height > 0 && ptr.active) {
        px = (ptr.cx - r.left) * (W / r.width);
        py = (ptr.cy - r.top) * (H / r.height);
        act = px > -o.radius && px < W + o.radius && py > -o.radius && py < H + o.radius;
      }
      if (act) {
        if (ptr.has) {
          ptr.vx += ((px - ptr.x) / Math.max(k, 0.5) - ptr.vx) * 0.35;
          ptr.vy += ((py - ptr.y) / Math.max(k, 0.5) - ptr.vy) * 0.35;
        }
        ptr.x = px; ptr.y = py; ptr.has = true;
      } else { ptr.has = false; ptr.vx *= 0.8; ptr.vy *= 0.8; }
      ptr.near = act ? 1 : 0;

      const R = o.radius, R2 = R * R, S = (o.strength / 100) * 1.15;
      const spring = 0.055 * k, damp = Math.pow(0.84, k);
      const mode = o.effect;
      const wakeX = Math.max(-14, Math.min(14, ptr.vx)) * 0.07, wakeY = Math.max(-14, Math.min(14, ptr.vy)) * 0.07;

      // click bursts: a radial shove
      if (bursts.length) {
        for (const b of bursts) {
          const BR = R * 1.7, BR2 = BR * BR;
          for (let i = 0; i < N; i++) {
            const dx = X[i] - b.x, dy = Y[i] - b.y, d2 = dx * dx + dy * dy;
            if (d2 < BR2) {
              const d = Math.sqrt(d2) + 0.001, f = 1 - d / BR;
              const m = f * f * 16 * S;
              VX[i] += (dx / d) * m + (Math.random() - 0.5) * m * 0.5;
              VY[i] += (dy / d) * m + (Math.random() - 0.5) * m * 0.5;
            }
          }
        }
        bursts = [];
      }

      for (let i = 0; i < N; i++) {
        if (time < DL[i]) continue;
        let x = X[i], y = Y[i], vx = VX[i], vy = VY[i];
        if (act) {
          const dx = x - px, dy = y - py, d2 = dx * dx + dy * dy;
          if (d2 < R2) {
            const d = Math.sqrt(d2) + 0.001;
            let f = 1 - d / R; f *= f;
            const ux = dx / d, uy = dy / d;
            if (mode === "attract") {
              const core = Math.min(1, d / (R * 0.28));            // no singularity at the centre
              vx -= ux * f * S * 1.5 * core * k; vy -= uy * f * S * 1.5 * core * k;
              vx += -uy * f * S * 0.5 * k; vy += ux * f * S * 0.5 * k;
            } else if (mode === "swirl") {
              vx += (-uy * 1.9 + ux * 0.35) * f * S * k; vy += (ux * 1.9 + uy * 0.35) * f * S * k;
            } else {
              vx += ux * f * S * 2.3 * k; vy += uy * f * S * 2.3 * k;
            }
            vx += wakeX * f * k; vy += wakeY * f * k;
          }
        }
        vx += (HX[i] - x) * spring; vy += (HY[i] - y) * spring;
        vx *= damp; vy *= damp;
        X[i] = x + vx * k; Y[i] = y + vy * k; VX[i] = vx; VY[i] = vy;
      }
    }

    /* ----- drawing ----- */
    function draw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      if (!N) return;
      const R = Math.max(30, o.radius);
      const sweep = o.reduced ? -9 : ((time * 0.33) % 2.3) - 0.5;      // a soft highlight sweeping across the text
      let hot = 0;
      for (let i = 0; i < N; i++) {
        let h = (Math.abs(X[i] - HX[i]) + Math.abs(Y[i] - HY[i])) / (R * 0.32) + (Math.abs(VX[i]) + Math.abs(VY[i])) * 0.09;
        const sd = Math.abs(HX[i] / W - sweep);
        if (sd < 0.09) h += (1 - sd / 0.09) * 0.55;
        const b = h >= 1 ? BUCKETS - 1 : (h * BUCKETS) | 0;
        BK[i] = b;
        if (b >= 3) hot++;
      }
      for (let b = 0; b < BUCKETS; b++) {
        ctx.fillStyle = COLORS[b];
        for (let i = 0; i < N; i++) {
          if (BK[i] !== b) continue;
          const r = SZ[i];
          ctx.fillRect(X[i] - r, Y[i] - r, r * 2, r * 2);
        }
      }
      // additive glow only for the hot particles + a light under the pointer
      if (hot) {
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = "rgba(255,40,64,0.16)";
        for (let i = 0; i < N; i++) {
          if (BK[i] < 3) continue;
          const r = SZ[i] * 2.4;
          ctx.fillRect(X[i] - r, Y[i] - r, r * 2, r * 2);
        }
        ctx.globalCompositeOperation = "source-over";
      }
      if (ptr.near) {
        const gr = ctx.createRadialGradient(ptr.x, ptr.y, 0, ptr.x, ptr.y, R * 0.9);
        gr.addColorStop(0, "rgba(255,50,72,0.20)");
        gr.addColorStop(0.45, "rgba(255,50,72,0.08)");
        gr.addColorStop(0.8, "rgba(255,50,72,0.015)");
        gr.addColorStop(1, "rgba(255,50,72,0)");
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = gr;
        ctx.fillRect(ptr.x - R, ptr.y - R, R * 2, R * 2);
        ctx.globalCompositeOperation = "source-over";
      }
    }

    function frame(now) {
      raf = requestAnimationFrame(frame);
      if (document.hidden || !visible || !N) { last = 0; return; }
      if (!ptr.near && now - lastDraw < 1000 / 30 - 2) return;       // 30 fps when idle
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now; lastDraw = now;
      time += dt;
      step(dt);
      draw();
    }

    /* ----- pointer ----- */
    const onMove = (e) => { ptr.cx = e.clientX; ptr.cy = e.clientY; ptr.active = true; };
    const onLeave = () => { ptr.active = false; };
    const onDown = (e) => {
      if (e.button !== 0) return;
      const r = canvas.getBoundingClientRect();
      if (!r.width) return;
      const x = (e.clientX - r.left) * (W / r.width), y = (e.clientY - r.top) * (H / r.height);
      if (x > -o.radius && x < W + o.radius && y > -o.radius && y < H + o.radius) bursts.push({ x, y });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true, capture: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    window.addEventListener("blur", onLeave);

    return {
      setLayout(l, assemble) { layout = l; build(Boolean(assemble)); draw(); },
      setOptions(next) {
        const rebuild = next.scale !== undefined && next.scale !== o.scale || next.density !== undefined && next.density !== o.density;
        o = Object.assign(o, next);
        if (rebuild && layout) { build(false); draw(); }
      },
      setVisible(v) { visible = Boolean(v); },
      start() { if (running || destroyed) return; running = true; last = 0; raf = requestAnimationFrame(frame); },
      get count() { return N; },
      destroy() {
        destroyed = true; running = false;
        cancelAnimationFrame(raf);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerdown", onDown, true);
        document.documentElement.removeEventListener("mouseleave", onLeave);
        window.removeEventListener("blur", onLeave);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      },
    };
  }

  /* ------------------------------------------------------------ DOM adapter */
  function textNodesOf(root) {
    const out = [], tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = tw.nextNode(); n; n = tw.nextNode()) if (n.data.trim()) out.push(n);
    return out;
  }

  // lay the real text out line by line (per-character rects, so wrapping is reproduced exactly)
  function measure(host, o) {
    const hr = host.getBoundingClientRect();
    const bw = host.offsetWidth, bh = host.offsetHeight;
    if (!bw || !bh) return null;
    const sx = hr.width / bw || 1, sy = hr.height / bh || 1;      // transform scale of the host (entrance animation)
    const raw = [];
    let font = null, minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
    const range = document.createRange();
    for (const node of textNodesOf(host)) {
      const cs = getComputedStyle(node.parentElement);
      font = font || { style: cs.fontStyle, weight: cs.fontWeight, size: parseFloat(cs.fontSize) || 28, family: cs.fontFamily, letterSpacing: cs.letterSpacing === "normal" ? "0px" : cs.letterSpacing };
      const data = node.data;
      let cur = null;
      for (let i = 0; i < data.length; i++) {
        if (/\s/.test(data[i])) continue;
        range.setStart(node, i); range.setEnd(node, i + 1);
        const rc = range.getBoundingClientRect();
        if (!rc.width && !rc.height) continue;
        const left = (rc.left - hr.left) / sx, top = (rc.top - hr.top) / sy;
        const hgt = rc.height / sy, wid = rc.width / sx;
        if (!cur || Math.abs(top - cur.top) > hgt * 0.5) {
          cur = { start: i, end: i, x: left, top, hgt, node };
          raw.push(cur);
        }
        cur.end = i;
        minX = Math.min(minX, left); maxX = Math.max(maxX, left + wid);
        minY = Math.min(minY, top); maxY = Math.max(maxY, top + hgt);
      }
    }
    if (!raw.length || !font) return null;
    const pd = pads(o, Math.max(bw, maxX - minX), Math.max(bh, maxY - minY));
    const lines = raw.map((l) => ({ text: l.node.data.slice(l.start, l.end + 1), x: l.x + pd.x, y: l.top + l.hgt / 2 + pd.y }));
    const text = lines.map((l) => l.text).join(" ");
    return {
      w: bw + pd.x * 2, h: bh + pd.y * 2, padX: pd.x, padY: pd.y,
      cx: (minX + maxX) / 2 + pd.x, cy: (minY + maxY) / 2 + pd.y,
      font, lines, text,
      key: lines.map((l) => l.text).join("|") + "@" + bw + "x" + bh + "/" + font.size + font.family + "/" + pd.x + "," + pd.y,
    };
  }

  function attach(host, getOpts) {
    const canvas = document.createElement("canvas");
    canvas.className = "cug-ptext";
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "position:absolute;pointer-events:none;z-index:1;";
    host.setAttribute("data-cug-ptext-host", "");
    host.appendChild(canvas);
    const engine = createEngine(canvas, getOpts());
    if (!engine) { canvas.remove(); host.removeAttribute("data-cug-ptext-host"); return null; }

    let lastKey = "", lastText = "", raf = 0, dead = false, first = true;
    function sync() {
      raf = 0;
      if (dead) return;
      const l = measure(host, getOpts());
      if (!l) { engine.setVisible(false); return; }
      engine.setVisible(true);
      if (l.key === lastKey) return;
      const textChanged = l.text !== lastText;
      lastKey = l.key; lastText = l.text;
      canvas.style.left = -l.padX + "px";
      canvas.style.top = -l.padY + "px";
      canvas.style.setProperty("--cug-fx", Math.round(l.padX * 0.8) + "px");    // feather width of the soft edge mask
      canvas.style.setProperty("--cug-fy", Math.round(l.padY * 0.8) + "px");
      engine.setOptions(getOpts());
      engine.setLayout(l, first || textChanged);
      first = false;
    }
    const schedule = () => { if (!raf && !dead) raf = requestAnimationFrame(sync); };

    const ro = new ResizeObserver(schedule);
    ro.observe(host);
    const mo = new MutationObserver((recs) => {
      if (recs.some((r) => r.target !== canvas && !(r.addedNodes.length === 1 && r.addedNodes[0] === canvas))) schedule();
    });
    mo.observe(host, { childList: true, characterData: true, subtree: true });
    const io = new IntersectionObserver((es) => { for (const e of es) engine.setVisible(e.isIntersecting); });
    io.observe(host);
    const fonts = document.fonts;
    const onFonts = () => { lastKey = ""; schedule(); };
    fonts && fonts.addEventListener && fonts.addEventListener("loadingdone", onFonts);
    fonts && fonts.ready && fonts.ready.then(onFonts);

    sync();
    engine.start();

    return {
      host,
      update(next) { engine.setOptions(next); lastKey = ""; schedule(); },       // radius / scale change the padding
      destroy() {
        dead = true;
        cancelAnimationFrame(raf);
        ro.disconnect(); mo.disconnect(); io.disconnect();
        fonts && fonts.removeEventListener && fonts.removeEventListener("loadingdone", onFonts);
        engine.destroy();
        canvas.remove();
        host.removeAttribute("data-cug-ptext-host");
      },
    };
  }

  /* ---- layout helper for the popup preview (single centred line) ---- */
  function layoutFromText(text, w, h, font) {
    const c = document.createElement("canvas").getContext("2d");
    c.font = font.style + " " + font.weight + " " + font.size + "px " + font.family;
    const tw = c.measureText(text).width;
    const x = (w - tw) / 2, y = h / 2;
    return { w, h, cx: w / 2, cy: h / 2, font, lines: [{ text, x, y }], key: text + w + "x" + h, text };
  }

  g.CUGTEXT = { createEngine, attach, layoutFromText };
})(globalThis);

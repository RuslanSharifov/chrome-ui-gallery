"use strict";
/* Dynamic background: a slowly climbing "git graph" — vertical branch lanes,
   commit nodes, merge curves with travelling pulses; nodes light up near the pointer. */
(() => {
  const c = document.getElementById("bg-canvas");
  if (!c) return;
  const ctx = c.getContext("2d");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const LAV = [185, 166, 255], MINT = [143, 232, 203], PAD = 220;
  let W = 0, H = 0, dpr = 1, lanes = [], commits = [], branches = [], seedKey = "";
  const m = { x: -999, y: -999 };
  const t0 = performance.now();
  const rgba = (c, a) => "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")";
  const rnd = (a, b) => a + Math.random() * (b - a);

  function seed() {
    const n = W < 640 ? 4 : W < 1100 ? 6 : 9, span = H + PAD * 2;
    lanes = Array.from({ length: n }, (_, i) => ({ x: W * (i + .5) / n + rnd(-.17, .17) * W / n, col: i % 2 ? MINT : LAV }));
    commits = [];
    lanes.forEach((l, i) => {
      const k = Math.ceil(span / 120);
      for (let j = 0; j < k; j++) commits.push({ lane: i, y: rnd(0, span), r: rnd(1.5, 3) });
    });
    branches = [];
    for (let i = 0; i < n * 2; i++) {
      const a = Math.floor(Math.random() * n);
      let b = a + (Math.random() < .5 ? -1 : 1);
      if (b < 0 || b >= n) b = a + (a === 0 ? 1 : -1);
      branches.push({ a, b, y0: rnd(0, span), len: rnd(150, 300), ph: Math.random() });
    }
  }

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 1.5);
    const w = innerWidth, h = innerHeight;
    c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
    c.style.width = w + "px"; c.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const key = (w < 640 ? 0 : w < 1100 ? 1 : 2) + ":" + Math.round(h / 200);
    W = w; H = h;
    if (key !== seedKey || !lanes.length) { seedKey = key; seed(); }
    else lanes.forEach((l, i) => { l.x = Math.min(l.x, W); });
    if (reduced) draw(0, scrollY);
  }

  function draw(t, sy) {
    ctx.clearRect(0, 0, W, H);
    const span = H + PAD * 2, off = (reduced ? 0 : t * 15) + sy * .22;
    ctx.lineWidth = 1;
    for (const l of lanes) {
      ctx.strokeStyle = rgba(l.col, .06);
      ctx.beginPath(); ctx.moveTo(l.x, 0); ctx.lineTo(l.x, H); ctx.stroke();
    }
    for (const b of branches) {
      const y = ((b.y0 - off) % span + span) % span - PAD, x1 = lanes[b.a].x, x2 = lanes[b.b].x, h = b.len * .5;
      ctx.strokeStyle = rgba(lanes[b.a].col, .12); ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(x1, y); ctx.bezierCurveTo(x1, y + h, x2, y + h, x2, y + b.len); ctx.stroke();
      ctx.fillStyle = rgba(lanes[b.a].col, .5);
      ctx.beginPath(); ctx.arc(x1, y, 2, 0, 6.2832); ctx.arc(x2, y + b.len, 2, 0, 6.2832); ctx.fill();
      if (!reduced) {
        const p = (t * .16 + b.ph) % 1, q = 1 - p;
        const px = q * q * q * x1 + 3 * q * q * p * x1 + 3 * q * p * p * x2 + p * p * p * x2;
        const py = q * q * q * y + 3 * q * q * p * (y + h) + 3 * q * p * p * (y + h) + p * p * p * (y + b.len);
        const a = Math.sin(p * Math.PI);
        const g = ctx.createRadialGradient(px, py, 0, px, py, 12);
        g.addColorStop(0, rgba(lanes[b.b].col, .75 * a)); g.addColorStop(1, rgba(lanes[b.b].col, 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, 12, 0, 6.2832); ctx.fill();
      }
    }
    for (const k of commits) {
      const y = ((k.y - off) % span + span) % span - PAD, l = lanes[k.lane];
      if (y < -10 || y > H + 10) continue;
      const d = Math.hypot(l.x - m.x, y - m.y), boost = Math.max(0, 1 - d / 140);
      ctx.fillStyle = rgba(l.col, .32 + boost * .6);
      ctx.beginPath(); ctx.arc(l.x, y, k.r * (1 + boost * .9), 0, 6.2832); ctx.fill();
      if (boost > .08) { ctx.strokeStyle = rgba(l.col, boost * .5); ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(l.x, y, k.r * 2.6 * (1 + boost), 0, 6.2832); ctx.stroke(); }
    }
  }

  function loop(now) {
    if (!document.hidden) draw((now - t0) / 1000, scrollY);
    requestAnimationFrame(loop);
  }
  addEventListener("resize", resize, { passive: true });
  if (!reduced) {
    addEventListener("pointermove", e => { m.x = e.clientX; m.y = e.clientY; }, { passive: true });
    addEventListener("pointerleave", () => { m.x = m.y = -999; });
  } else addEventListener("scroll", () => draw(0, scrollY), { passive: true });
  resize();
  if (!reduced) requestAnimationFrame(loop);
})();

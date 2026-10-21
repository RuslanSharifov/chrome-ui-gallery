"use strict";
/* Particle 3D model for the intro: two nested point-cloud cubes that
   assemble from scattered dust, react to the pointer and slowly rotate. */
(() => {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const host = canvas.parentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W = 0, H = 0, dpr = 1, pts = [], visible = true;
  const m = { x: 0, y: 0, rx: 0, ry: 0, px: -999, py: -999, sx: -999, sy: -999, on: false };
  const t0 = performance.now();
  const ease = k => 1 - Math.pow(1 - k, 3);

  function build() {
    pts = [];
    const small = innerWidth < 640;
    const shells = [
      { n: small ? 11 : 15, s: 1, dir: 1, size: 1 },
      { n: small ? 5 : 7, s: .42, dir: -1, size: 1.25 }
    ];
    shells.forEach((sh, si) => {
      for (let a = 0; a < 3; a++) for (const sign of [-1, 1]) {
        const b = (a + 1) % 3, c = (a + 2) % 3;
        for (let i = 0; i < sh.n; i++) for (let j = 0; j < sh.n; j++) {
          const u = i / (sh.n - 1) * 2 - 1, v = j / (sh.n - 1) * 2 - 1;
          const p = [0, 0, 0];
          p[a] = sign; p[b] = u; p[c] = v;
          const j2 = .012;
          const tx = (p[0] + (Math.random() - .5) * j2) * sh.s;
          const ty = (p[1] + (Math.random() - .5) * j2) * sh.s;
          const tz = (p[2] + (Math.random() - .5) * j2) * sh.s;
          const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1), r = 2.4 + Math.random() * 2.2;
          pts.push({
            tx, ty, tz, shell: si, dir: sh.dir, size: sh.size,
            sx: r * Math.sin(ph) * Math.cos(th), sy: r * Math.sin(ph) * Math.sin(th), sz: r * Math.cos(ph),
            delay: Math.random() * .9 + si * .5, tone: (ty / sh.s + 1) / 2
          });
        }
      }
    });
  }

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = host.clientWidth; H = host.clientHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
    if (reduced) draw(99);
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    m.rx += (m.x - m.rx) * .06; m.ry += (m.y - m.ry) * .06;
    m.sx += (m.px - m.sx) * .2; m.sy += (m.py - m.sy) * .2;
    const base = reduced ? .7 : t * .3;
    const S = Math.min(W, H) * .21, cx = W / 2, cy = H / 2, cam = 5.2;
    const breathe = 1 + Math.sin(t * 1.2) * .018;
    const ax = -.52 + m.ry * .55 + (reduced ? 0 : Math.sin(t * .4) * .07);
    const cosX = Math.cos(ax), sinX = Math.sin(ax);
    const out = [];
    for (const p of pts) {
      const k = ease(Math.min(1, Math.max(0, (t - p.delay) / 2.3)));
      let x = p.sx + (p.tx * breathe - p.sx) * k;
      let y = p.sy + (p.ty * breathe - p.sy) * k;
      let z = p.sz + (p.tz * breathe - p.sz) * k;
      const ay = (base + m.rx * .9) * p.dir + (1 - k) * 2.2;
      const cy2 = Math.cos(ay), sy2 = Math.sin(ay);
      let x1 = x * cy2 + z * sy2, z1 = -x * sy2 + z * cy2;
      let y1 = y * cosX - z1 * sinX, z2 = y * sinX + z1 * cosX;
      const f = cam / (cam + z2);
      let px = cx + x1 * S * f, py = cy + y1 * S * f;
      if (m.on) {
        const dx = px - m.sx, dy = py - m.sy, d = Math.hypot(dx, dy), R = 96;
        if (d < R && d > .5) { const push = (R - d) / R * 26; px += dx / d * push; py += dy / d * push; }
      }
      out.push([px, py, z2, f, p.tone, k, p.size]);
    }
    out.sort((a, b) => b[2] - a[2]);
    for (const [px, py, z, f, tone, k, size] of out) {
      const depth = Math.min(1, Math.max(0, .5 - z / 3.4));
      const a = (.18 + .8 * depth) * (.35 + .65 * k);
      const r = (185 + (143 - 185) * tone) | 0, g = (166 + (232 - 166) * tone) | 0, b = (255 + (203 - 255) * tone) | 0;
      ctx.fillStyle = "rgba(" + r + "," + g + "," + b + "," + a.toFixed(3) + ")";
      ctx.beginPath(); ctx.arc(px, py, Math.max(.5, 1.25 * f * size * (innerWidth < 640 ? .85 : 1)), 0, 6.2832); ctx.fill();
    }
  }

  function loop(now) {
    if (visible && !document.hidden) draw((now - t0) / 1000);
    requestAnimationFrame(loop);
  }

  const hero = canvas.closest(".hero") || host;
  hero.addEventListener("pointermove", e => {
    const r = canvas.getBoundingClientRect();
    m.x = Math.max(-1, Math.min(1, (e.clientX - r.left) / r.width * 2 - 1));
    m.y = Math.max(-1, Math.min(1, (e.clientY - r.top) / r.height * 2 - 1));
    m.px = e.clientX - r.left; m.py = e.clientY - r.top; m.on = true;
  }, { passive: true });
  hero.addEventListener("pointerleave", () => { m.x = 0; m.y = 0; m.on = false; });
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(host);
  new ResizeObserver(resize).observe(host);
  resize();
  if (!reduced) requestAnimationFrame(loop);
})();

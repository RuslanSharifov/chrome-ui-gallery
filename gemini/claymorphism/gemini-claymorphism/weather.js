/* Weather canvas: rain, snow, stars (+ shooting stars) and lightning bolts. 2D canvas, no external assets.
   Pauses while the tab is hidden, stops completely when nothing needs drawing, and is static under
   prefers-reduced-motion (no lightning at all). */
(function (global) {
  "use strict";
  const R = Math.random;

  function create(canvas, hooks) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    hooks = hooks || {};

    // p.kind: none | rain | snow | stars. intensity 0..1, wind -1..1, lightning 0..1, density multiplier.
    let p = { kind: "none", intensity: 0.5, wind: 0, lightning: 0, storm: false, skyDark: false, density: 1, reduced: false };
    let W = 0, H = 0;
    let drops = [], flakes = [], stars = [];
    let raf = 0, last = 0, time = 0, running = false;
    let nextBolt = 2, bolt = null, shoot = null, nextShoot = 5, flash = 0;

    function size() {
      const w = Math.max(2, canvas.clientWidth | 0), h = Math.max(2, canvas.clientHeight | 0);
      if (w === W && h === H) return false;
      W = canvas.width = w;
      H = canvas.height = h;
      return true;
    }

    /* ----- particle pools ----- */
    function targetCount() {
      const area = (W * H) / 1e5, d = p.density, i = p.intensity;
      if (p.kind === "rain") return Math.round(area * (5 + 36 * i) * d);
      if (p.kind === "snow") return Math.round(area * (3 + 20 * i) * d);
      if (p.kind === "stars") return Math.round(((W * H) / 9000) * (0.35 + 0.9 * i) * Math.min(1, d));
      return 0;
    }
    function spawnDrop(initial) {
      const z = 0.3 + R() * 0.7;
      const spread = Math.abs(p.wind) * H * 0.4;
      return {
        z, len: 10 + z * 22, vy: 650 + z * 900,
        x: R() * (W + spread) - (p.wind > 0 ? spread : 0),
        y: initial ? R() * H : -R() * H * 0.2,
      };
    }
    function spawnFlake(initial) {
      const z = 0.25 + R() * 0.75;
      return { z, r: 1 + z * 2.6, vy: 28 + z * 62, ph: R() * 6.28, f: 0.6 + R() * 1.2,
               x: R() * W, y: initial ? R() * H : -8 };
    }
    function spawnStar() {
      return { x: R() * W, y: R() * H * 0.82, r: 0.5 + R() * 1.3, ph: R() * 6.28, sp: 0.6 + R() * 2.2, warm: R() < 0.35 };
    }
    function fit(arr, n, make) {
      while (arr.length < n) arr.push(make(true));
      if (arr.length > n) arr.length = n;
    }
    function sync() {
      const n = targetCount();
      if (p.kind === "rain") fit(drops, n, spawnDrop); else drops.length = 0;
      if (p.kind === "snow") fit(flakes, n, spawnFlake); else flakes.length = 0;
      if (p.kind === "stars") fit(stars, n, spawnStar); else stars.length = 0;
    }

    /* ----- lightning ----- */
    function makeBolt() {
      const x0 = W * (0.12 + R() * 0.76);
      const endY = H * (0.45 + R() * 0.4);
      const main = [[x0, -10]];
      const branches = [];
      let x = x0, y = -10;
      while (y < endY) {
        y += 16 + R() * 34;
        x += (R() - 0.5) * 72;
        main.push([x, y]);
        if (R() < 0.2 && branches.length < 3) {
          const b = [[x, y]];
          let bx = x, by = y;
          const dir = R() < 0.5 ? -1 : 1, n = 3 + ((R() * 4) | 0);
          for (let k = 0; k < n; k++) { by += 14 + R() * 24; bx += dir * (10 + R() * 34); b.push([bx, by]); }
          branches.push(b);
        }
      }
      return { born: time, main, branches };
    }
    // two quick pulses then a decay; never more than ~2 flashes in any second
    function envelope(a) {
      if (a < 0.06) return a / 0.06;
      if (a < 0.12) return 1 - ((a - 0.06) / 0.06) * 0.65;
      if (a < 0.17) return 0.35 + ((a - 0.12) / 0.05) * 0.45;
      return 0.8 * Math.exp(-(a - 0.17) * 9);
    }
    function strokePath(pts) {
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.stroke();
    }
    function drawBolt(env) {
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      const paths = [bolt.main, ...bolt.branches];
      const passes = [[11, "rgba(150,182,255," + (0.22 * env).toFixed(3) + ")"], [4, "rgba(214,230,255," + (0.5 * env).toFixed(3) + ")"], [1.6, "rgba(255,255,255," + (0.95 * env).toFixed(3) + ")"]];
      passes.forEach(([w, c]) => {
        ctx.lineWidth = w; ctx.strokeStyle = c;
        paths.forEach((pts, i) => { ctx.lineWidth = i ? w * 0.55 : w; strokePath(pts); });
      });
    }

    /* ----- per-kind drawing ----- */
    function drawRain(dt) {
      const slope = p.wind * 0.35 * (1 + 0.25 * Math.sin(time * 0.5));
      const layers = [[], [], []];
      for (const d of drops) {
        if (dt) {
          d.y += d.vy * dt;
          d.x += slope * d.vy * dt;
          if (d.y - d.len > H || d.x > W + 60 || d.x < -60 - Math.abs(slope) * H) {
            const n = spawnDrop(false); d.x = n.x; d.y = n.y;
          }
        }
        layers[d.z < 0.5 ? 0 : d.z < 0.8 ? 1 : 2].push(d);
      }
      const rgb = p.skyDark ? "196,214,240" : "84,100,126";
      const alphas = [0.20, 0.32, 0.46], widths = [1, 1.25, 1.6];
      layers.forEach((list, li) => {
        ctx.strokeStyle = "rgba(" + rgb + "," + alphas[li] + ")";
        ctx.lineWidth = widths[li];
        ctx.beginPath();
        for (const d of list) { ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - slope * d.len, d.y - d.len); }
        ctx.stroke();
      });
    }
    function drawSnow(dt) {
      const near = [], far = [];
      for (const f of flakes) {
        if (dt) {
          f.y += f.vy * dt;
          f.x += (p.wind * 70 * f.z + Math.sin(time * f.f + f.ph) * 18) * dt;
          if (f.y > H + 8) { f.y = -8; f.x = R() * W; }
          if (f.x > W + 10) f.x = -10; else if (f.x < -10) f.x = W + 10;
        }
        (f.z > 0.6 ? near : far).push(f);
      }
      [[far, 0.7], [near, 1]].forEach(([list, a]) => {
        if (!list.length) return;
        ctx.fillStyle = "rgba(150,170,200," + (0.16 * a).toFixed(2) + ")";
        ctx.beginPath();
        for (const f of list) { ctx.moveTo(f.x + f.r * 1.9, f.y); ctx.arc(f.x, f.y, f.r * 1.9, 0, 6.2832); }
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255," + (0.95 * a).toFixed(2) + ")";
        ctx.beginPath();
        for (const f of list) { ctx.moveTo(f.x + f.r, f.y); ctx.arc(f.x, f.y, f.r, 0, 6.2832); }
        ctx.fill();
      });
    }
    function drawStars(dt) {
      for (const s of stars) {
        const tw = p.reduced ? 0.8 : 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * s.sp + s.ph));
        ctx.fillStyle = (s.warm ? "rgba(255,244,220," : "rgba(214,228,255,") + tw.toFixed(2) + ")";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, 6.2832);
        ctx.fill();
      }
      if (p.reduced) return;
      if (!shoot && time >= nextShoot) {
        shoot = { x: W * (0.1 + R() * 0.7), y: H * (0.04 + R() * 0.3), born: time, len: 90 + R() * 80 };
        nextShoot = time + 7 + R() * 9;
      }
      if (shoot) {
        const a = (time - shoot.born) / 0.9;
        if (a >= 1) shoot = null;
        else {
          const x = shoot.x + a * 340, y = shoot.y + a * 150, k = Math.sin(a * Math.PI);
          const g = ctx.createLinearGradient(x, y, x - shoot.len, y - shoot.len * 0.44);
          g.addColorStop(0, "rgba(255,255,255," + (0.9 * k).toFixed(2) + ")");
          g.addColorStop(1, "rgba(255,255,255,0)");
          ctx.strokeStyle = g; ctx.lineWidth = 1.6;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - shoot.len, y - shoot.len * 0.44); ctx.stroke();
        }
      }
    }

    function setFlash(v) {
      if (v === flash) return;
      flash = v;
      hooks.flash && hooks.flash(v);
    }

    function needsLoop() {
      return !p.reduced && (p.kind !== "none" || (p.storm && p.lightning > 0) || bolt || flash > 0);
    }

    function render(dt) {
      ctx.clearRect(0, 0, W, H);
      if (p.kind === "rain") drawRain(dt);
      else if (p.kind === "snow") drawSnow(dt);
      else if (p.kind === "stars") drawStars(dt);

      // lightning (storm only)
      let env = 0;
      if (p.storm && p.lightning > 0 && !p.reduced) {
        if (!bolt && time >= nextBolt) {
          bolt = makeBolt();
          nextBolt = time + (2.2 + R() * 7.5) / (0.25 + p.lightning * 1.5);
        }
        if (bolt) {
          const a = time - bolt.born;
          env = a > 0.7 ? 0 : envelope(a);
          if (a > 0.7) bolt = null;
          else if (env > 0.01) drawBolt(env);
        }
      } else bolt = null;
      setFlash(Math.round(env * 100) / 100);
    }

    function frame(now) {
      raf = 0;
      if (!running) return;
      if (!needsLoop()) { running = false; ctx.clearRect(0, 0, W, H); setFlash(0); return; }
      raf = requestAnimationFrame(frame);
      if (document.hidden) { last = 0; return; }
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      time += dt;
      if (size()) sync();
      render(dt);
    }

    function kick() {
      size();
      sync();
      if (p.reduced) { running = false; if (raf) cancelAnimationFrame(raf), raf = 0; render(0); return; }
      if (needsLoop()) {
        if (!running) { running = true; last = 0; raf = requestAnimationFrame(frame); }
      } else { running = false; if (raf) cancelAnimationFrame(raf), raf = 0; render(0); }
    }

    return {
      update(next) {
        const wasKind = p.kind;
        p = Object.assign(p, next);
        if (wasKind !== p.kind) { drops.length = flakes.length = stars.length = 0; shoot = null; }
        kick();
      },
      destroy() {
        running = false;
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        setFlash(0);
        ctx.clearRect(0, 0, W, H);
      },
    };
  }

  global.GUGWX = { create };
})(globalThis);

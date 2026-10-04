/* Lovable Glassmorphism — dynamic light background (Canvas 2D, no WebGL needed). */
(function (root) {
  "use strict";

  function createFx(canvas, opts) {
    var ctx = canvas.getContext("2d", { alpha: true });
    var s = opts || {};
    var blobs = [];
    var raf = 0;
    var t = 0;
    var last = 0;
    var mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, active: false };
    var scale = 0.5;
    var running = false;

    function qualityScale(q) {
      return q === "high" ? 0.75 : q === "low" ? 0.3 : 0.5;
    }

    function rgba(hex, a) {
      var c = root.LG.hexToRgb(hex);
      return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")";
    }

    function seed() {
      var pal = root.LG.PALETTES[s.palette] || root.LG.PALETTES.lovable;
      blobs = [];
      for (var i = 0; i < 6; i++) {
        blobs.push({
          color: pal[i % pal.length],
          px: Math.random() * 6.28,
          py: Math.random() * 6.28,
          fx: 0.15 + Math.random() * 0.25,
          fy: 0.12 + Math.random() * 0.22,
          r: 0.25 + Math.random() * 0.2
        });
      }
    }

    function resize() {
      scale = qualityScale(s.quality);
      var w = Math.max(1, Math.floor(window.innerWidth * scale));
      var h = Math.max(1, Math.floor(window.innerHeight * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }

    function draw() {
      var w = canvas.width;
      var h = canvas.height;
      var m = Math.max(w, h);
      var intensity = (s.intensity == null ? 70 : s.intensity) / 100;
      var size = 0.6 + ((s.size == null ? 60 : s.size) / 100) * 0.9;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      for (var i = 0; i < blobs.length; i++) {
        var b = blobs[i];
        var x = (0.5 + 0.38 * Math.sin(t * b.fx + b.px)) * w;
        var y = (0.5 + 0.38 * Math.cos(t * b.fy + b.py)) * h;
        var r = b.r * m * size;
        var g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, rgba(b.color, 0.55 * intensity));
        g.addColorStop(0.5, rgba(b.color, 0.18 * intensity));
        g.addColorStop(1, rgba(b.color, 0));
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      // soft diagonal light ribbon
      var rx = (0.5 + 0.3 * Math.sin(t * 0.07)) * w;
      var ribbon = ctx.createLinearGradient(rx - w * 0.3, 0, rx + w * 0.3, h);
      ribbon.addColorStop(0, "rgba(255,255,255,0)");
      ribbon.addColorStop(0.5, "rgba(255,255,255," + 0.06 * intensity + ")");
      ribbon.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = ribbon;
      ctx.fillRect(0, 0, w, h);

      if (s.cursorGlow && mouse.active) {
        mouse.x += (mouse.tx - mouse.x) * 0.12;
        mouse.y += (mouse.ty - mouse.y) * 0.12;
        var cx = mouse.x * w;
        var cy = mouse.y * h;
        var cr = m * 0.18;
        var cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr);
        cg.addColorStop(0, rgba(s.accent || "#ff5ca8", 0.35 * intensity));
        cg.addColorStop(1, rgba(s.accent || "#ff5ca8", 0));
        ctx.fillStyle = cg;
        ctx.fillRect(0, 0, w, h);
      }
      ctx.globalCompositeOperation = "source-over";
    }

    function frame(now) {
      raf = requestAnimationFrame(frame);
      var dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
      last = now;
      var speed = (s.speed == null ? 40 : s.speed) / 100;
      t += dt * speed * 2.2;
      draw();
    }

    function onMove(e) {
      mouse.tx = e.clientX / window.innerWidth;
      mouse.ty = e.clientY / window.innerHeight;
      mouse.active = true;
    }

    function onVis() {
      if (document.hidden) stop(true); else if (running) start();
    }

    function start() {
      running = true;
      if (raf) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    }

    function stop(keepRunningFlag) {
      if (!keepRunningFlag) running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    function update(next) {
      var paletteChanged = next.palette !== s.palette;
      s = next;
      if (paletteChanged || !blobs.length) seed();
      resize();
      draw();
    }

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVis);

    seed();
    resize();

    return {
      start: start,
      stop: function () { stop(false); },
      update: update,
      destroy: function () {
        stop(false);
        window.removeEventListener("resize", resize);
        window.removeEventListener("pointermove", onMove);
        document.removeEventListener("visibilitychange", onVis);
      }
    };
  }

  root.LGFx = { create: createFx };
})(typeof window !== "undefined" ? window : self);

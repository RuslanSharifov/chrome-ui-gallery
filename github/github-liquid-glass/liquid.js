/* Liquid-glass refraction. Installs two SVG filters (gug-lq-l for large panels, gug-lq-s for small ones) that
   backdrop-filter references via url(#...). A displacement map (generated on a canvas) bends the backdrop near
   the element's edges like a thick glass bezel; three displaced copies (R/G/B) give chromatic dispersion.
   Chromium-only feature; elsewhere (or if it fails) the CSS falls back to blur + specular edges. */
(function (global) {
  "use strict";

  const NS = "http://www.w3.org/2000/svg", XL = "http://www.w3.org/1999/xlink";
  const SHAPES = { l: { w: 320, h: 200, radius: .16 }, s: { w: 160, h: 120, radius: .30 } };

  // Displacement map: R = x shift, G = y shift (128 = none). Strongest at the rim, pointing inward.
  function makeMap(shape, bezel) {
    const { w, h, radius } = SHAPES[shape], c = document.createElement("canvas");
    c.width = w; c.height = h;
    const ctx = c.getContext("2d"), img = ctx.createImageData(w, h), d = img.data;
    const cx = w / 2, cy = h / 2, r = Math.min(w, h) * radius, bw = Math.min(w, h) * .5 * bezel;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const px = x + .5 - cx, py = y + .5 - cy, qx = Math.abs(px) - (cx - r), qy = Math.abs(py) - (cy - r);
      const ox = Math.max(qx, 0), oy = Math.max(qy, 0), len = Math.hypot(ox, oy);
      const sdf = len + Math.min(Math.max(qx, qy), 0) - r;          // < 0 inside
      const depth = -sdf;                                             // distance inward from the rim
      let dx = 0, dy = 0;
      if (depth < bw && depth >= 0) {
        const t = depth / bw, m = Math.pow(1 - t, 2.2);             // convex bezel profile
        let nx, ny;                                                  // outward normal
        if (qx > 0 && qy > 0) { nx = ox / len; ny = oy / len; } else if (qx > qy) { nx = 1; ny = 0; } else { nx = 0; ny = 1; }
        dx = -Math.sign(px || 1) * Math.abs(nx) * m; dy = -Math.sign(py || 1) * Math.abs(ny) * m;
      }
      const i = (y * w + x) * 4;
      d[i] = 128 + dx * 127; d[i + 1] = 128 + dy * 127; d[i + 2] = 128; d[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    return c.toDataURL("image/png");
  }

  const el = (n, attrs) => { const e = document.createElementNS(NS, n); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
  const chan = (id, matrix) => el("feColorMatrix", { in: id, type: "matrix", values: matrix });

  function buildFilter(id) {
    const f = el("filter", { id, x: "0", y: "0", width: "1", height: "1", filterUnits: "objectBoundingBox", "color-interpolation-filters": "sRGB" });
    const map = el("feImage", { result: "map", preserveAspectRatio: "none" });
    f.appendChild(map);
    const disp = {};
    [["r", "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"], ["g", "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"], ["b", "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"]].forEach(([k, m]) => {
      const dm = el("feDisplacementMap", { in: "SourceGraphic", in2: "map", scale: "0", xChannelSelector: "R", yChannelSelector: "G", result: "d" + k });
      f.appendChild(dm); const cm = chan("d" + k, m); cm.setAttribute("result", "c" + k); f.appendChild(cm); disp[k] = dm;
    });
    const b1 = el("feBlend", { in: "cr", in2: "cg", mode: "screen", result: "rg" });
    const b2 = el("feBlend", { in: "rg", in2: "cb", mode: "screen" });
    f.append(b1, b2);
    return { f, map, disp };
  }

  function create(host) {
    const svg = el("svg", { width: "0", height: "0", "aria-hidden": "true", focusable: "false" });
    svg.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;pointer-events:none";
    const defs = el("defs", {}), F = { l: buildFilter("gug-lq-l"), s: buildFilter("gug-lq-s") };
    defs.append(F.l.f, F.s.f); svg.appendChild(defs); host.appendChild(svg);
    const cache = {}; let lastBezel = -1;

    return {
      // refraction 0..100 (displacement px), dispersion 0..100 (channel split), bezel 10..90 (rim thickness)
      update(s) {
        const bezel = s.bezel / 100;
        if (bezel !== lastBezel) {
          for (const k of ["l", "s"]) {
            const key = k + bezel; cache[key] = cache[key] || makeMap(k, bezel);
            F[k].map.setAttribute("href", cache[key]); F[k].map.setAttributeNS(XL, "xlink:href", cache[key]);
          }
          lastBezel = bezel;
        }
        for (const k of ["l", "s"]) {
          const base = (k === "l" ? 1 : .7) * s.refraction * .5 * (s.style === "clear" ? 1.4 : 1), spread = s.dispersion / 100 * .35;
          F[k].disp.r.setAttribute("scale", (base * (1 + spread)).toFixed(2));
          F[k].disp.g.setAttribute("scale", base.toFixed(2));
          F[k].disp.b.setAttribute("scale", (base * (1 - spread)).toFixed(2));
        }
      },
      destroy() { svg.remove(); }
    };
  }

  global.GUGLQ = { create };
})(globalThis);

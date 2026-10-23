/* Gemini Claymorphism — scene builder.
   One scene = sky gradient + sun/moon + 3D clay clouds + fog + weather canvas + lightning flash.
   Used by the content script (full page, interactive) and by the popup (live preview). */
(function (global) {
  "use strict";
  const SCENE_ID = "gug-clay-scene", WORLD_ID = "gug-clay-cloud-world", PUFFS = 7;
  // [x%, y%, scale, drift vw, phase]
  const CLOUDS = [[8, 13, 1, -7, .2], [74, 24, .82, 4, 1.1], [35, 42, 1.18, -3, 1.8], [86, 58, .72, 6, .7], [17, 70, .92, -5, 1.4], [60, 79, 1.05, 3, 2], [44, 8, .66, 8, 2.7], [92, 10, .58, -4, 3.2], [4, 46, .70, 5, 2.3]];

  function mk(tag, cls, parent) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (parent) parent.appendChild(e);
    return e;
  }

  function paintClouds(world, s, theme) {
    while (world.children.length < s.cloudCount) {
      const c = mk("div", "gug-clay-cloud", world);
      for (let i = 0; i < PUFFS; i++) mk("i", "gug-clay-puff", c);
    }
    [...world.children].forEach((n, i) => { if (i >= s.cloudCount) n.remove(); });

    // wind speeds clouds up and sets their direction
    const wind = s.wind / 100;
    const duration = (122 - s.cloudSpeed * 0.82) * (1.25 - Math.abs(wind) * 0.625);
    const dir = wind < 0 ? "reverse" : "normal";
    const dark = theme.cloudDark;
    const st = world.style;
    world.dataset.type = s.cloudType;
    st.setProperty("--gug-cloud-opacity", (s.cloudOpacity / 100).toFixed(3));
    st.setProperty("--gug-cloud-depth", (0.35 + s.cloudDepth / 150).toFixed(3));
    st.setProperty("--gug-zamp", (s.cloudDepth / 100).toFixed(2));
    st.setProperty("--gug-cloud-size", (s.cloudSize / 100).toFixed(3));
    st.setProperty("--gug-cl-hl", dark ? ".14" : ".42");
    st.setProperty("--gug-cloud-shadow", dark ? "0 0 0" : "68 76 91");
    st.setProperty("--gug-cloud-shadow-a", dark ? ".34" : ".18");

    [...world.children].forEach((c, i) => {
      const [x, y, scale, , phase] = CLOUDS[i % CLOUDS.length];
      const cs = c.style;
      cs.setProperty("--gug-x", x + "%");
      cs.setProperty("--gug-y", y + "%");
      cs.setProperty("--gug-scale", scale);
      cs.setProperty("--gug-color-a", "rgb(" + theme.cloud[i % 3] + ")");
      cs.setProperty("--gug-color-b", "rgb(" + theme.cloud[(i + 1) % 3] + ")");
      cs.animationDuration = Math.max(24, duration + phase * 5) + "s";
      cs.animationDirection = dir;
      cs.animationDelay = -phase * 11 + "s";
      cs.zIndex = String(Math.round(i + s.cloudDepth));
    });
  }

  function create(host, s, opts) {
    opts = opts || {};
    s = GUG.normalize(s);
    let theme = GUG.resolve(s, opts.geminiDark);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");

    const scene = mk("div", "", null);
    scene.id = SCENE_ID;
    scene.setAttribute("aria-hidden", "true");
    const sky = mk("div", "gug-sky", scene);
    mk("div", "gug-sun", scene);
    mk("div", "gug-moon", scene);
    const world = mk("div", "", scene);
    world.id = WORLD_ID;
    const fog = mk("div", "gug-fog", scene);
    mk("i", "", fog); mk("i", "", fog);
    const canvas = mk("canvas", "gug-wx", scene);
    const flash = mk("div", "gug-flash", scene);
    host.appendChild(scene);

    const wx = GUGWX.create(canvas, {
      flash(v) {
        flash.style.opacity = (v * 0.42).toFixed(3);
        scene.style.setProperty("--gug-flash", v);
        world.classList.toggle("lit", v > 0.01);
      },
    });

    function apply(next, geminiDark) {
      s = GUG.normalize(next);
      theme = GUG.resolve(s, geminiDark);
      const W = theme.weather;
      scene.dataset.wx = s.weather;
      scene.style.setProperty("--gug-wx", (s.weatherIntensity / 100).toFixed(2));
      scene.style.setProperty("--gug-fog", theme.fog);
      sky.style.setProperty("--gug-sky-a", "rgb(" + theme.sky[0] + ")");
      sky.style.setProperty("--gug-sky-b", "rgb(" + theme.sky[1] + ")");
      scene.style.setProperty("--gug-sky-tint", (s.skyTint / 100).toFixed(2));
      paintClouds(world, s, theme);
      wx && wx.update({
        kind: W.kind,
        intensity: s.weatherIntensity / 100,
        wind: s.wind / 100,
        lightning: s.lightning / 100,
        storm: s.weather === "storm",
        skyDark: theme.skyDark,
        density: ({ low: 0.5, medium: 1, high: 1.5 }[s.quality] || 1) * (opts.preview ? 0.6 : 1),
        reduced: reduced.matches,
      });
    }

    // cursor parallax for clouds and sun/moon
    let pointer = null;
    if (opts.interactive) {
      pointer = (e) => {
        if (!s.parallax) return;
        scene.style.setProperty("--gug-pointer-x", ((e.clientX / Math.max(1, innerWidth) - 0.5) * 16).toFixed(2) + "px");
        scene.style.setProperty("--gug-pointer-y", ((e.clientY / Math.max(1, innerHeight) - 0.5) * 10).toFixed(2) + "px");
      };
      window.addEventListener("pointermove", pointer, { passive: true });
    }
    const onMotion = () => apply(s, opts.geminiDark);
    reduced.addEventListener && reduced.addEventListener("change", onMotion);

    apply(s, opts.geminiDark);

    return {
      update(next, geminiDark) { opts.geminiDark = geminiDark; apply(next, geminiDark); },
      destroy() {
        if (pointer) window.removeEventListener("pointermove", pointer);
        reduced.removeEventListener && reduced.removeEventListener("change", onMotion);
        wx && wx.destroy();
        scene.remove();
      },
    };
  }

  global.GUGCLAY = { create };
})(globalThis);

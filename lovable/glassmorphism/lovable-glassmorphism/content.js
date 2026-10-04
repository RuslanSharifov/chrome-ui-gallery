/* Lovable Glassmorphism — content script. Restyles the existing lovable.dev UI. */
(function () {
  "use strict";
  if (window.__lgLoaded) return;
  window.__lgLoaded = true;

  var html = document.documentElement;
  var fx = null;
  var canvas = null;
  var settings = null;

  function isDark() {
    if (html.classList.contains("dark")) return true;
    if (html.classList.contains("light")) return false;
    var cs = html.style.colorScheme || getComputedStyle(html).colorScheme || "";
    if (cs.indexOf("dark") !== -1) return true;
    if (cs.indexOf("light") !== -1) return false;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function syncTheme() {
    html.setAttribute("data-lg-mode", isDark() ? "dark" : "light");
  }

  function applyVars(s) {
    var a = LG.hexToRgb(s.accent);
    var st = html.style;
    st.setProperty("--lg-accent", s.accent);
    st.setProperty("--lg-accent-rgb", a.join(","));
    st.setProperty("--lg-blur", s.blur + "px");
    st.setProperty("--lg-panel-alpha", String(s.panelOpacity / 100));
    st.setProperty("--lg-chat-alpha", String(s.chatOpacity / 100));
    st.setProperty("--lg-sat", s.saturation + "%");
    st.setProperty("--lg-radius", s.radius + "px");
    html.toggleAttribute("data-lg-shine", !!s.edgeShine);
  }

  function ensureCanvas() {
    if (canvas && canvas.isConnected) return canvas;
    canvas = document.createElement("canvas");
    canvas.id = "lg-fx";
    canvas.setAttribute("aria-hidden", "true");
    (document.body || html).appendChild(canvas);
    return canvas;
  }

  function apply(s) {
    settings = s;
    if (!s.enabled) {
      html.removeAttribute("data-lg-glass");
      if (fx) fx.stop();
      if (canvas) canvas.style.display = "none";
      return;
    }
    html.setAttribute("data-lg-glass", "");
    applyVars(s);
    syncTheme();

    if (!document.body) return; // wait for DOMContentLoaded
    ensureCanvas();
    if (s.lights) {
      canvas.style.display = "block";
      if (!fx) fx = LGFx.create(canvas, s);
      fx.update(s);
      if (s.speed > 0) fx.start(); else fx.stop();
    } else {
      canvas.style.display = "none";
      if (fx) fx.stop();
    }
  }

  // Keep the theme attribute in sync with Lovable's own dark/light switch.
  new MutationObserver(syncTheme).observe(html, { attributes: true, attributeFilter: ["class", "style"] });
  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    if (mq.addEventListener) mq.addEventListener("change", syncTheme);
  }

  // Lovable is a SPA: if React replaces <body> children, re-attach the canvas.
  function watchBody() {
    new MutationObserver(function () {
      if (settings && settings.enabled && settings.lights && canvas && !canvas.isConnected) {
        document.body.appendChild(canvas);
      }
    }).observe(document.body, { childList: true });
  }

  LG.load(function (s) {
    apply(s);
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () { apply(settings); watchBody(); });
    } else {
      watchBody();
    }
  });
  LG.onChange(apply);
})();

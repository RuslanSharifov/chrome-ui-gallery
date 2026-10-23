/* Lovable Glassmorphism — popup logic. */
(function () {
  "use strict";

  var FIELDS = [
    "enabled", "lights", "palette", "intensity", "size", "speed", "cursorGlow",
    "quality", "accent", "blur", "panelOpacity", "chatOpacity", "saturation", "radius", "edgeShine"
  ];
  var settings = LG.merge(LG.DEFAULTS, null);
  var fx = LGFx.create(document.getElementById("preview"), settings);

  function el(id) { return document.getElementById(id); }

  function render() {
    FIELDS.forEach(function (k) {
      var input = el(k);
      if (!input) return;
      if (input.type === "checkbox") input.checked = !!settings[k];
      else input.value = settings[k];
    });
    document.documentElement.style.setProperty("--accent", settings.accent);
    fx.update(settings);
    if (settings.lights && settings.speed > 0) fx.start(); else fx.stop();
  }

  function commit() {
    LG.save(settings);
    render();
  }

  FIELDS.forEach(function (k) {
    var input = el(k);
    if (!input) return;
    var evt = input.type === "range" || input.type === "color" ? "input" : "change";
    input.addEventListener(evt, function () {
      if (input.type === "checkbox") settings[k] = input.checked;
      else if (input.type === "range") settings[k] = Number(input.value);
      else settings[k] = input.value;
      commit();
    });
  });

  var presetsBox = el("presets");
  Object.keys(LG.PRESETS).forEach(function (name) {
    var b = document.createElement("button");
    b.className = "chip";
    b.textContent = name;
    b.addEventListener("click", function () {
      settings = LG.merge(settings, LG.PRESETS[name]);
      settings.enabled = true;
      commit();
    });
    presetsBox.appendChild(b);
  });

  el("reset").addEventListener("click", function () {
    settings = LG.merge(LG.DEFAULTS, null);
    commit();
  });

  LG.load(function (s) {
    settings = s;
    render();
  });
})();

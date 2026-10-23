/* Lovable Glassmorphism — shared settings (content script + popup). */
(function (root) {
  "use strict";

  var KEY = "lgSettings";

  var PALETTES = {
    lovable: ["#ff5ca8", "#ff8a3d", "#a95cff", "#4f7dff"],
    ocean: ["#22d3ee", "#3b82f6", "#14b8a6", "#6366f1"],
    aurora: ["#34d399", "#a78bfa", "#22d3ee", "#f0abfc"],
    sunset: ["#fb7185", "#f59e0b", "#f97316", "#e879f9"],
    mono: ["#cbd5e1", "#94a3b8", "#e2e8f0", "#64748b"]
  };

  var DEFAULTS = {
    enabled: true,
    lights: true,
    palette: "lovable",
    intensity: 70,   // 0..100
    size: 60,        // 0..100
    speed: 40,       // 0..100, 0 = frozen
    cursorGlow: true,
    quality: "medium", // low | medium | high
    accent: "#ff5ca8",
    blur: 18,        // px
    panelOpacity: 45, // 0..100
    chatOpacity: 18,  // 0..100
    saturation: 140,  // %
    edgeShine: true,
    radius: 18       // px
  };

  var PRESETS = {
    Lovable: { palette: "lovable", intensity: 70, speed: 40, blur: 18, panelOpacity: 45, accent: "#ff5ca8", lights: true },
    Ocean: { palette: "ocean", intensity: 65, speed: 30, blur: 22, panelOpacity: 40, accent: "#22d3ee", lights: true },
    Aurora: { palette: "aurora", intensity: 80, speed: 55, blur: 20, panelOpacity: 38, accent: "#a78bfa", lights: true },
    Calm: { palette: "sunset", intensity: 40, speed: 12, blur: 16, panelOpacity: 55, accent: "#fb7185", lights: true },
    Minimal: { palette: "mono", intensity: 25, speed: 0, blur: 12, panelOpacity: 70, accent: "#94a3b8", lights: false }
  };

  function merge(base, extra) {
    var out = {};
    var k;
    for (k in base) out[k] = base[k];
    if (extra) for (k in extra) if (k in base) out[k] = extra[k];
    return out;
  }

  function load(cb) {
    try {
      chrome.storage.local.get(KEY, function (res) {
        cb(merge(DEFAULTS, res && res[KEY]));
      });
    } catch (e) {
      cb(merge(DEFAULTS, null));
    }
  }

  function save(settings, cb) {
    var o = {};
    o[KEY] = settings;
    try { chrome.storage.local.set(o, cb || function () {}); } catch (e) {}
  }

  function onChange(cb) {
    try {
      chrome.storage.onChanged.addListener(function (changes, area) {
        if (area === "local" && changes[KEY]) cb(merge(DEFAULTS, changes[KEY].newValue));
      });
    } catch (e) {}
  }

  function hexToRgb(hex) {
    var h = String(hex || "").replace("#", "");
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    if (isNaN(n)) return [255, 92, 168];
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  root.LG = {
    KEY: KEY,
    DEFAULTS: DEFAULTS,
    PRESETS: PRESETS,
    PALETTES: PALETTES,
    merge: merge,
    load: load,
    save: save,
    onChange: onChange,
    hexToRgb: hexToRgb
  };
})(typeof window !== "undefined" ? window : self);

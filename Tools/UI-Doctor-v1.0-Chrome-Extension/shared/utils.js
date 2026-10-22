/* Shared helpers. Loaded by the service worker, popup and side panel. No DOM access here. */
self.UD = self.UD || {};

UD.DEFAULTS = {
  theme: "system",
  language: "en",                 // en | de | tr | fr                 // system | light | dark
  defaultPreset: "m390",
  units: "px",                     // px | rem
  overlay: { margin: "#F59E0B", padding: "#22C55E", content: "#22D3EE" },
  severity: { error: true, warning: true, info: true },
  motion: "system"                 // system | reduce | full
};

UD.esc = (value) => String(value == null ? "" : value).replace(/[&<>"']/g, (c) => (
  { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
));

UD.getSettings = async () => {
  const { settings } = await chrome.storage.local.get("settings");
  const s = settings || {};
  return {
    ...UD.DEFAULTS,
    ...s,
    overlay: { ...UD.DEFAULTS.overlay, ...(s.overlay || {}) },
    severity: { ...UD.DEFAULTS.severity, ...(s.severity || {}) }
  };
};

UD.pushRecent = async (entry) => {
  const { recent } = await chrome.storage.local.get("recent");
  const list = [entry, ...(recent || [])].slice(0, 5);
  await chrome.storage.local.set({ recent: list });
};

UD.sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
UD.isHttp = (url) => /^https?:\/\//i.test(url || "");
UD.originPattern = (url) => new URL(url).origin + "/*";

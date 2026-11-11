"use strict";
const KEY = "ambientGlowLite";
const DEFAULTS = { enabled: true, intensity: 65, blur: 55, fps: 4 };
const inputs = Object.fromEntries(Object.keys(DEFAULTS).map((key) => [key, document.getElementById(key)]));
const status = document.getElementById("status");
function render() {
  for (const key of ["intensity", "blur", "fps"]) {
    document.getElementById(key + "Value").textContent = inputs[key].value + (key === "fps" ? " fps" : "%");
  }
}
chrome.storage.sync.get({ [KEY]: DEFAULTS }, (result) => {
  const settings = { ...DEFAULTS, ...(result[KEY] || {}) };
  for (const key of Object.keys(DEFAULTS)) inputs[key].value = settings[key];
  inputs.enabled.checked = settings.enabled;
  render();
});
function save() {
  const settings = { enabled: inputs.enabled.checked };
  for (const key of ["intensity", "blur", "fps"]) settings[key] = Number(inputs[key].value);
  render();
  chrome.storage.sync.set({ [KEY]: settings }, () => {
    status.textContent = chrome.runtime.lastError ? "Could not save settings." : "Settings saved ✓";
  });
}
Object.values(inputs).forEach((input) => input.addEventListener("input", save));

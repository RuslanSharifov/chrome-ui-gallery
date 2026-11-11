const DEFAULTS = {
  ambientOn: true, audioOnly: false, captions: false, eqOn: false,
  ambientBlur: 60, ambientSpread: 110, ambientIntensity: 0.8,
  eqBands: [0, 0, 0, 0, 0]
};
const PRESETS = {
  flat: [0, 0, 0, 0, 0], bass: [6, 4, 0, -1, -2],
  vocal: [-2, 0, 3, 4, 1], cinema: [4, 2, 0, 3, 5]
};
const FREQS = ["60", "250", "1k", "4k", "12k"];

const $ = id => document.getElementById(id);
const eqWrap = $("eq");

FREQS.forEach((f, i) => {
  const d = document.createElement("div");
  d.innerHTML = `<input type="range" min="-12" max="12" step="1" data-band="${i}"><div>${f}</div>`;
  eqWrap.appendChild(d);
});

chrome.storage.sync.get(DEFAULTS, items => {
  ["ambientOn", "audioOnly", "captions", "eqOn"].forEach(k => $(k).checked = items[k]);
  ["ambientBlur", "ambientSpread", "ambientIntensity"].forEach(k => {
    $(k).value = items[k]; $("v_" + k).textContent = items[k];
  });
  document.querySelectorAll("[data-band]").forEach(el => el.value = items.eqBands[+el.dataset.band]);
});

const set = patch => chrome.storage.sync.set(patch);

["ambientOn", "audioOnly", "captions", "eqOn"].forEach(k =>
  $(k).addEventListener("change", e => set({ [k]: e.target.checked })));

["ambientBlur", "ambientSpread", "ambientIntensity"].forEach(k =>
  $(k).addEventListener("input", e => {
    const v = parseFloat(e.target.value);
    $("v_" + k).textContent = v;
    set({ [k]: v });
  }));

document.querySelectorAll("[data-band]").forEach(el =>
  el.addEventListener("input", () => {
    chrome.storage.sync.get({ eqBands: DEFAULTS.eqBands }, ({ eqBands }) => {
      const bands = [...eqBands];
      bands[+el.dataset.band] = +el.value;
      set({ eqBands: bands });
    });
  }));

document.querySelectorAll("[data-preset]").forEach(btn =>
  btn.addEventListener("click", () => {
    set({ eqBands: PRESETS[btn.dataset.preset], eqOn: true });
    chrome.storage.sync.get(DEFAULTS, items => {
      document.querySelectorAll("[data-band]").forEach(el => el.value = PRESETS[btn.dataset.preset][+el.dataset.band]);
      $("eqOn").checked = true;
    });
  }));

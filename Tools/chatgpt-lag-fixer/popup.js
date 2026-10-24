const DEFAULTS = {
  enabled: true,
  contentVisibility: true,
  lightOldTurns: true,
  keepRecent: 15
};

const ids = Object.keys(DEFAULTS);
const saved = document.getElementById("saved");

function load() {
  chrome.storage.sync.get(DEFAULTS, (cfg) => {
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el.type === "checkbox") el.checked = !!cfg[id];
      else el.value = cfg[id];
    }
  });
}

function save(id) {
  const el = document.getElementById(id);
  let value;
  if (el.type === "checkbox") value = el.checked;
  else value = Math.max(1, Math.min(500, parseInt(el.value, 10) || DEFAULTS.keepRecent));
  chrome.storage.sync.set({ [id]: value }, () => {
    saved.textContent = "Saved";
    setTimeout(() => (saved.textContent = ""), 1000);
  });
}

ids.forEach((id) => {
  document.getElementById(id).addEventListener("change", () => save(id));
});

load();


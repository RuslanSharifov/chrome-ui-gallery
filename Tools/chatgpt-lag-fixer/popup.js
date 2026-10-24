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

// Optional support link: uses shared public configuration, not a hardcoded account.
async function loadSupport() {
  const box = document.querySelector(".support");
  if (!box) return;
  box.hidden = true;
  if (!navigator.onLine) return;
  try {
    const response = await fetch("https://ruslansharifov.github.io/chrome-ui-gallery/support-config.json", {
      cache: "no-store", signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) return;
    const config = await response.json();
    if (config.enabled !== true || config.provider !== "ko-fi" || !/^[\\w-]{2,64}$/.test(config.account)) return;
    const link = box.querySelector("a");
    link.href = "https://ko-fi.com/" + encodeURIComponent(config.account);
    box.hidden = false;
  } catch { /* Support section stays hidden when offline or unavailable. */ }
}
loadSupport();

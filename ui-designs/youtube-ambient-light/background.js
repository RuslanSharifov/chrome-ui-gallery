/* Toolbar icon: click toggles Ambient Light on/off. All other settings live in the player button window. */
const DEFAULTS = { ambientOn: true };

async function refreshBadge(on) {
  await chrome.action.setBadgeText({ text: on ? "ON" : "OFF" });
  await chrome.action.setBadgeBackgroundColor({ color: on ? "#3ea6ff" : "#555555" });
  await chrome.action.setTitle({ title: on ? "Ambient Light: aktiv (klik = söndür)" : "Ambient Light: deaktiv (klik = yandır)" });
}

async function syncBadge() {
  const { ambientOn } = await chrome.storage.sync.get(DEFAULTS);
  refreshBadge(ambientOn);
}

chrome.runtime.onInstalled.addListener(syncBadge);
chrome.runtime.onStartup.addListener(syncBadge);

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.ambientOn) refreshBadge(changes.ambientOn.newValue);
});

chrome.action.onClicked.addListener(async () => {
  const { ambientOn } = await chrome.storage.sync.get(DEFAULTS);
  await chrome.storage.sync.set({ ambientOn: !ambientOn });
});

/* UI Doctor — service worker.
 * Owns: script injection, keyboard commands, the dedicated Responsive Lab test window,
 * and relaying messages between the side panel / popup and page content.
 * The user's main browser window is never resized.
 */
importScripts("../shared/presets.js", "../shared/utils.js");

const TEST_KEY = "uiDoctorTestWindow";
const sleep = UD.sleep;

chrome.runtime.onInstalled.addListener(async () => {
  const { settings } = await chrome.storage.local.get("settings");
  if (!settings) await chrome.storage.local.set({ settings: UD.DEFAULTS });
});

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(() => {});

/* Injects the engine into a tab and verifies it answers. Throws a readable error when the
 * page is restricted or the site has not been granted access. */
async function injectContent(tabId) {
  try {
    await chrome.scripting.executeScript({ target: { tabId }, files: ["content/ui-doctor.js"] });
  } catch (e) {
    throw new Error(`UI Doctor can't run on this page (${e && e.message ? e.message : "injection failed"}). Open a regular http(s) page, click the UI Doctor icon on it, or allow access to this site.`);
  }
  const pong = await chrome.tabs.sendMessage(tabId, { type: "UD_PING" });
  if (!pong || !pong.ok) throw new Error("UI Doctor could not start on this page.");
  if (!UD.isHttp(pong.data.url)) throw new Error("This page type is not supported.");
  return pong.data;
}

async function tabMessage(tabId, payload) {
  await injectContent(tabId);
  const r = await chrome.tabs.sendMessage(tabId, payload);
  if (!r || !r.ok) throw new Error((r && r.error) || "No response from the page.");
  return r.data;
}

/* ---------- Responsive Lab ---------- */
async function getTest() {
  const s = await chrome.storage.session.get(TEST_KEY);
  return s[TEST_KEY] || null;
}
async function setTest(value) {
  if (value) await chrome.storage.session.set({ [TEST_KEY]: value });
  else await chrome.storage.session.remove(TEST_KEY);
}

async function waitComplete(tabId, timeout = 8000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const t = await chrome.tabs.get(tabId).catch(() => null);
    if (!t) throw new Error("The test tab was closed.");
    if (t.status === "complete") return;
    await sleep(150);
  }
}

/* Resizes the test window so its CONTENT viewport (window.innerWidth/innerHeight) matches the
 * request. Window chrome (frame, scrollbars) varies by platform, so we measure and correct. */
async function sizeTestWindow(test, width, height) {
  let outerW = width, outerH = height;
  let vp = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    await chrome.windows.update(test.windowId, { width: Math.round(outerW), height: Math.round(outerH), state: "normal" });
    await sleep(350);
    await injectContent(test.tabId);
    const r = await chrome.tabs.sendMessage(test.tabId, { type: "UD_GET_VIEWPORT" });
    vp = r.data;
    if (Math.abs(vp.innerWidth - width) <= 1 && Math.abs(vp.innerHeight - height) <= 1) break;
    const win = await chrome.windows.get(test.windowId);
    const frameW = win.width - vp.innerWidth;
    const frameH = win.height - vp.innerHeight;
    // Window chrome is a small, positive offset (scrollbars, title bar, borders). Anything
    // outside 0–200 px means the browser is not honouring the size, so stop and report it.
    if (frameW < 0 || frameW > 200 || frameH < 0 || frameH > 200) break;
    outerW = width + frameW;
    outerH = height + frameH;
  }
  return {
    requested: { width, height },
    actual: { innerWidth: vp.innerWidth, innerHeight: vp.innerHeight, clientWidth: vp.clientWidth, dpr: vp.dpr },
    matches: Math.abs(vp.innerWidth - width) <= 1 && Math.abs(vp.innerHeight - height) <= 1
  };
}

async function openTest({ url, width, height }) {
  if (!UD.isHttp(url)) throw new Error("Only http(s) pages can be tested.");
  let test = await getTest();
  if (test) {
    const alive = await chrome.windows.get(test.windowId).catch(() => null);
    if (!alive) test = null;
  }
  if (test) {
    await chrome.tabs.update(test.tabId, { url });
    await sleep(300);
  } else {
    const win = await chrome.windows.create({ url, type: "popup", width, height, focused: false });
    test = { windowId: win.id, tabId: win.tabs[0].id, url };
    await setTest(test);
  }
  await waitComplete(test.tabId);
  const sized = await sizeTestWindow(test, width, height);
  return { windowId: test.windowId, tabId: test.tabId, url, ...sized };
}

async function sweep(presets, orientation) {
  const test = await getTest();
  if (!test) throw new Error("Open the test window first.");
  const results = [];
  for (const p of presets) {
    const w = orientation === "landscape" ? p.h : p.w;
    const h = orientation === "landscape" ? p.w : p.h;
    const sized = await sizeTestWindow(test, w, h);
    const r = await chrome.tabs.sendMessage(test.tabId, { type: "UD_DIAGNOSE" });
    const d = r.data;
    const counts = { error: 0, warning: 0, info: 0 };
    d.findings.forEach((f) => { counts[f.severity] = (counts[f.severity] || 0) + 1; });
    results.push({
      label: p.label,
      group: p.group,
      requested: sized.requested,
      actual: sized.actual,
      matches: sized.matches,
      counts,
      findings: d.findings.map(({ id, ...rest }) => rest)
    });
  }
  return results;
}

async function closeTest() {
  const test = await getTest();
  if (test) await chrome.windows.remove(test.windowId).catch(() => {});
  await setTest(null);
  return { closed: true };
}

/* ---------- messages from the side panel and popup ---------- */
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  (async () => {
    switch (msg && msg.type) {
      case "BG_TAB_MSG": return tabMessage(msg.tabId, msg.payload);
      case "BG_OPEN_TEST": return openTest(msg);
      case "BG_SIZE_TEST": {
        const test = await getTest();
        if (!test) throw new Error("Open the test window first.");
        return sizeTestWindow(test, msg.width, msg.height);
      }
      case "BG_SWEEP": return sweep(msg.presets, msg.orientation);
      case "BG_TEST_DIAG": {
        const test = await getTest();
        if (!test) throw new Error("Open the test window first.");
        return tabMessage(test.tabId, { type: "UD_DIAGNOSE" });
      }
      case "BG_TEST_STATE": return getTest();
      case "BG_CLOSE_TEST": return closeTest();
      default: return null;
    }
  })().then(
    (data) => sendResponse({ ok: true, data }),
    (err) => sendResponse({ ok: false, error: String((err && err.message) || err) })
  );
  return true; // async response
});

/* ---------- keyboard commands (only the commands Chrome lets an extension declare) ---------- */
chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;
  if (command === "open-side-panel") {
    await chrome.sidePanel.open({ windowId: tab.windowId }).catch(() => {});
    return;
  }
  try {
    if (command === "toggle-inspect") await tabMessage(tab.id, { type: "UD_TOGGLE_INSPECT" });
    if (command === "clear-overlays") await tabMessage(tab.id, { type: "UD_CLEAR" });
  } catch (e) {
    console.warn("UI Doctor:", e.message);
  }
});

/* ---------- housekeeping: forget the test window when it closes ---------- */
chrome.windows.onRemoved.addListener(async (windowId) => {
  const test = await getTest();
  if (test && test.windowId === windowId) await setTest(null);
});

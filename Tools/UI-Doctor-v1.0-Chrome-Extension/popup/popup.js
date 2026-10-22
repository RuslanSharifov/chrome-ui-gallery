/* UI Doctor popup — quick actions. Heavy work runs in the service worker or the side panel. */
(() => {
  const $ = (id) => document.getElementById(id);
  let tab = null;

  let currentLanguage = "en";
  const setStatus = (text, isError) => {
    const s = $("status");
    s.textContent = UD_I18N.translate(text, currentLanguage);
    s.style.color = isError ? "var(--err)" : "";
  };

  const send = (msg) => chrome.runtime.sendMessage(msg).then((r) => {
    if (!r || !r.ok) throw new Error((r && r.error) || "Something went wrong.");
    return r.data;
  });

  // Side panel must be opened synchronously within the click gesture.
  const openPanelWith = (screen) => {
    const opening = chrome.sidePanel.open({ windowId: tab.windowId });
    chrome.storage.session.set({ pendingScreen: screen });
    return opening;
  };

  async function init() {
    [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const settings = await UD.getSettings();
    document.documentElement.dataset.theme = settings.theme === "system"
      ? (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark")
      : settings.theme;
    currentLanguage = settings.language || "en";
    UD_I18N.apply(document, currentLanguage);
    if (!tab) { $("site").textContent = "No active tab."; return; }
    if (tab.url) {
      $("site").textContent = UD.isHttp(tab.url) ? new URL(tab.url).host : "Restricted page: UI Doctor works on regular web pages.";
    } else {
      $("site").textContent = "Current tab";
    }
  }

  $("btnInspect").addEventListener("click", async () => {
    try {
      const d = await send({ type: "BG_TAB_MSG", tabId: tab.id, payload: { type: "UD_TOGGLE_INSPECT" } });
      setStatus(d.inspecting ? "Inspecting: hover to preview, click to select, Esc to stop." : "Inspection stopped.");
    } catch (e) { setStatus(e.message, true); }
  });

  $("btnDiag").addEventListener("click", async () => {
    setStatus("Running diagnostics…");
    try {
      const d = await send({ type: "BG_TAB_MSG", tabId: tab.id, payload: { type: "UD_DIAGNOSE" } });
      const count = (sev) => d.findings.filter((f) => f.severity === sev).length;
      setStatus(`${d.findings.length} findings: ${count("error")} errors, ${count("warning")} warnings, ${count("info")} info.`);
      await UD.pushRecent({ url: d.url, title: d.title, at: d.generatedAt, errors: count("error"), warnings: count("warning"), info: count("info") });
    } catch (e) { setStatus(e.message, true); }
  });

  $("btnOpen").addEventListener("click", async () => { await openPanelWith("overview"); window.close(); });
  $("btnResp").addEventListener("click", async () => { await openPanelWith("responsive"); window.close(); });
  $("btnSettings").addEventListener("click", async () => { await openPanelWith("settings"); window.close(); });
  $("btnAbout").addEventListener("click", async () => { await openPanelWith("about"); window.close(); });
  $("btnGithub").addEventListener("click", () => chrome.tabs.create({ url: "https://github.com/RuslanSharifov" }));

  init();
})();

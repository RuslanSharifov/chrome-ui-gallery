const toggle = document.querySelector("#toggle");
const stateText = document.querySelector("#stateText");

function render(enabled) {
  toggle.setAttribute("aria-checked", String(enabled));
  stateText.textContent = enabled ? "Active on ChatGPT" : "Disabled";
}

chrome.storage.local.get({ glassEnabled: true }, ({ glassEnabled }) => {
  render(glassEnabled);
});

toggle.addEventListener("click", async () => {
  const { glassEnabled = true } = await chrome.storage.local.get("glassEnabled");
  const next = !glassEnabled;
  await chrome.storage.local.set({ glassEnabled: next });
  render(next);

  const tabs = await chrome.tabs.query({
    url: ["https://chatgpt.com/*", "https://chat.openai.com/*"]
  });

  await Promise.allSettled(
    tabs.map((tab) =>
      chrome.tabs.sendMessage(tab.id, {
        type: "SET_GLASSMORPHISM",
        enabled: next
      })
    )
  );
});

(() => {
  "use strict";

  const DEFAULTS = {
    enabled: true,
    contentVisibility: true,
    lightOldTurns: true,
    keepRecent: 15
  };

  let cfg = { ...DEFAULTS };
  let timer = null;
  const root = document.documentElement;

  // Each message in ChatGPT carries data-message-author-role.
  // We map those to their enclosing turn element.
  function getTurns() {
    const set = new Set();
    for (const el of document.querySelectorAll("[data-message-author-role]")) {
      const turn = el.closest("article") || el.parentElement;
      if (turn) set.add(turn);
    }
    return [...set];
  }

  function apply() {
    timer = null;
    const keepRecent = Math.max(1, Number(cfg.keepRecent) || DEFAULTS.keepRecent);

    root.classList.toggle("cgf-enabled", !!cfg.enabled);
    root.classList.toggle("cgf-cv", !!(cfg.enabled && cfg.contentVisibility));
    root.classList.toggle("cgf-light", !!(cfg.enabled && cfg.lightOldTurns));

    const turns = getTurns();
    const cutoff = turns.length - keepRecent;

    turns.forEach((turn, i) => {
      turn.classList.add("cgf-turn");
      turn.classList.toggle("cgf-old", cfg.enabled && i < cutoff);
    });
  }

  // Debounce: during streaming, DOM mutates many times per second.
  function schedule() {
    if (timer) return;
    timer = setTimeout(apply, 400);
  }

  chrome.storage.sync.get(DEFAULTS, (stored) => {
    cfg = { ...DEFAULTS, ...stored };
    apply();
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;
    for (const key of Object.keys(changes)) cfg[key] = changes[key].newValue;
    apply();
  });

  // Watch only for added/removed nodes (not attributes) to keep the observer cheap.
  const observer = new MutationObserver(schedule);
  observer.observe(document.body, { childList: true, subtree: true });

  apply();
})();

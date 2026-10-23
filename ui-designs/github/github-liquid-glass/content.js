/* GitHub Liquid Glass — content script. Runs at document_start on github.com / gist.github.com.
   Everything is attached to <html> (not <head>/<body>) so Turbo page navigations cannot remove it. */
(() => {
  "use strict";

  const root = document.documentElement;
  const VARS_ID = "gug-gh-vars";
  const ATTRS = ["data-gug-gh", "data-gug-mode", "data-gug-style", "data-gug-zones", "data-gug-bounce"];
  const osDark = matchMedia("(prefers-color-scheme: dark)");

  let settings = GUG.normalize(null);
  let loaded = false, mode = "", bg = null, lq = null, applying = false;

  function githubMode() {
    const m = root.getAttribute("data-color-mode");
    return m === "dark" ? "dark" : m === "light" ? "light" : (osDark.matches ? "dark" : "light");
  }

  function apply(next) {
    applying = true;
    try {
      settings = next; loaded = true;
      if (!settings.enabled) {
        ATTRS.forEach(a => root.removeAttribute(a));
        document.getElementById(VARS_ID)?.remove();
        bg?.destroy(); bg = null; lq?.destroy(); lq = null; mode = "";
        return;
      }
      mode = GUG.resolveMode(settings, githubMode());
      const T = GUG.tokens(settings, mode);
      let el = document.getElementById(VARS_ID);
      if (!el) { el = document.createElement("style"); el.id = VARS_ID; root.appendChild(el); }
      const css = GUG.cssText(settings, mode);
      if (el.textContent !== css) el.textContent = css;
      root.setAttribute("data-gug-gh", "true");
      root.setAttribute("data-gug-mode", mode);
      root.setAttribute("data-gug-style", settings.style);
      root.setAttribute("data-gug-zones", T.zones.join(" "));
      root.setAttribute("data-gug-bounce", settings.bounce ? "on" : "off");

      const wantLiquid = settings.style !== "frosted" && settings.refraction > 0;
      if (wantLiquid && !lq) lq = GUGLQ.create(root);
      if (!wantLiquid && lq) { lq.destroy(); lq = null; }
      lq?.update(settings);

      if (!bg) bg = GUGBG.create(root, true);
      bg?.update(settings, mode);
    } finally { applying = false; }
  }

  // GitHub switched theme, or navigation dropped our attributes -> re-sync (cheap when nothing changed).
  function resync() {
    if (!loaded || applying || !settings.enabled) return;
    const want = GUG.resolveMode(settings, githubMode());
    if (want !== mode || root.getAttribute("data-gug-gh") !== "true") apply(settings);
  }
  new MutationObserver(resync).observe(root, { attributes: true, attributeFilter: ["data-color-mode", "data-dark-theme", "data-light-theme", "data-gug-gh"] });
  osDark.addEventListener?.("change", resync);
  document.addEventListener("turbo:render", resync);
  document.addEventListener("turbo:load", resync);

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes[GUG.STORAGE_KEY]) apply(GUG.normalize(changes[GUG.STORAGE_KEY].newValue));
  });
  GUG.load().then(apply).catch(console.warn);
})();

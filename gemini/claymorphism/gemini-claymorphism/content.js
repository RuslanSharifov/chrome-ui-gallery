(() => {
  const root = document.documentElement;
  let settings = GUG.normalize(null);
  let clouds = null;
  const apply = (next) => {
    settings = GUG.normalize(next);
    if (!settings.enabled) {
      root.removeAttribute('data-gug-clay');
      root.removeAttribute('data-gug-mode');
      if (clouds) clouds.destroy();
      clouds = null;
      return;
    }
    const p = GUG.PALETTES[settings.palette] || GUG.PALETTES.sky;
    root.style.setProperty('--gug-bg', p.bg);
    root.style.setProperty('--gug-surface', p.surface);
    root.style.setProperty('--gug-surface-2', p.surface2);
    root.style.setProperty('--gug-ink', p.ink);
    root.style.setProperty('--gug-accent', p.accent);
    root.style.setProperty('--gug-panel-alpha', settings.panelOpacity / 100);
    root.style.setProperty('--gug-radius', settings.radius + 'px');
    root.style.setProperty('--gug-shadow-dark', 'rgba(72 79 91 / ' + (settings.shadow / 400).toFixed(3) + ')');
    root.style.setProperty('--gug-shadow-light', 'rgba(255 255 255 / ' + (.48 + settings.shadow / 400).toFixed(3) + ')');
    root.setAttribute('data-gug-clay', 'true');
    root.setAttribute('data-gug-mode', root.classList.contains('dark') ? 'dark' : 'light');
    if (!clouds) clouds = GUGCLAY.create(root, settings, root.getAttribute('data-gug-mode'), true);
    else clouds.update(settings, root.getAttribute('data-gug-mode'));
  };
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes[GUG.STORAGE_KEY]) apply(changes[GUG.STORAGE_KEY].newValue);
  });
  GUG.load().then(apply).catch(console.warn);
})();

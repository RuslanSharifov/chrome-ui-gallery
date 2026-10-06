/* ============================================================================
   CLAYMORPHISM SETTINGS PANEL - V1.0.0
   Original Design • Complete Refactor • Tab-based Navigation
   ========================================================================== */

(() => {
  "use strict";

  // DOM References
  const $ = (id) => document.getElementById(id);
  const $$ = (sel) => document.querySelectorAll(sel);

  let settings = CUG.normalize(null);
  
  // Set version
  $("version").textContent = chrome.runtime.getManifest().version;

  /* ========================================================================
     CONFIGURATION
     ======================================================================== */

  const CONTROLS = {
    sliders: {
      // Lights
      intensity: { label: "Light Intensity", unit: "%", min: 0, max: 100, default: 50 },
      scale: { label: "Light Size", unit: "%", min: 40, max: 240, default: 100 },
      speed: { label: "Animation Speed", unit: "%", min: 0, max: 250, default: 100 },
      caustics: { label: "Underwater Light", unit: "%", min: 0, max: 100, default: 30 },
      rays: { label: "Light Rays", unit: "%", min: 0, max: 100, default: 20 },
      neon: { label: "Neon Glow", unit: "%", min: 0, max: 100, default: 10 },
      
      // Clay
      blur: { label: "Shadow Depth", unit: "px", min: 8, max: 60, default: 12 },
      opacity: { label: "Panel Density", unit: "%", min: 10, max: 92, default: 75 },
      veil: { label: "Canvas Depth", unit: "%", min: 0, max: 60, default: 30 },
      saturation: { label: "Warmth Boost", unit: "%", min: 100, max: 240, default: 160 },
      shine: { label: "Surface Highlight", unit: "%", min: 0, max: 200, default: 100 },
      radius: { label: "Smoothness", unit: "px", min: 6, max: 36, default: 20 }
    },
    toggles: {
      fxOn: { label: "Dynamic Background", panel: "lights" },
      mouseGlow: { label: "Cursor Interaction", panel: "lights" },
      hover3d: { label: "3D Chat Hover", panel: "advanced" },
      dragDialogs: { label: "Draggable Dialogs", panel: "advanced" }
    },
    presets: {
      warm: { label: "🔥 Warm Clay", accent: "warm" },
      cool: { label: "❄️ Cool Clay", accent: "cool" },
      earthy: { label: "🌍 Earthy", accent: "earth" },
      rich: { label: "✨ Rich", accent: "rich" }
    }
  };

  /* ========================================================================
     INITIALIZE UI
     ======================================================================== */

  function initializeUI() {
    buildPaletteChips();
    buildAccentSwatches();
    buildSliders();
    buildToggles();
    buildPresets();
    setupTabNavigation();
    setupMasterToggle();
    setupResetButton();
    attachSliderEvents();
    render();
  }

  function buildPaletteChips() {
    const container = $("palette-chips");
    Object.entries(CUG.PALETTES).forEach(([key, palette]) => {
      const btn = document.createElement("button");
      btn.className = "chip-btn";
      btn.textContent = palette.label;
      btn.dataset.value = key;
      btn.addEventListener("click", () => {
        settings = CUG.normalize({ ...settings, palette: key });
        render(true);
        syncPreview();
        CUG.save(settings);
      });
      container.appendChild(btn);
    });
  }

  function buildAccentSwatches() {
    const container = $("accent-swatches");
    Object.entries(CUG.ACCENTS).forEach(([key, accent]) => {
      const btn = document.createElement("button");
      btn.className = "swatch-btn";
      btn.dataset.value = key;
      btn.title = accent.label;
      btn.style.background = `linear-gradient(135deg, rgb(${accent.dark}), rgb(${accent.dark} / 0.8))`;
      btn.addEventListener("click", () => {
        settings = CUG.normalize({ ...settings, accent: key });
        render(true);
        syncPreview();
        CUG.save(settings);
      });
      container.appendChild(btn);
    });
  }

  function buildSliders() {
    const container = $("panel-clay").querySelector(".sliders-group");
    
    Object.entries(CONTROLS.sliders).slice(6).forEach(([key, config]) => {
      const sliderDiv = document.createElement("div");
      sliderDiv.className = "slider-container";
      sliderDiv.dataset.slider = key;

      const header = document.createElement("div");
      header.className = "slider-header";
      
      const label = document.createElement("label");
      label.textContent = config.label;
      
      const output = document.createElement("output");
      output.className = "slider-output";
      output.textContent = config.default + config.unit;

      const input = document.createElement("input");
      input.type = "range";
      input.min = config.min;
      input.max = config.max;
      input.value = config.default;
      input.className = "clay-slider";

      const hint = document.createElement("p");
      hint.className = "slider-hint";
      hint.textContent = "Adjust to customize appearance";

      header.appendChild(label);
      header.appendChild(output);
      sliderDiv.appendChild(header);
      sliderDiv.appendChild(input);
      sliderDiv.appendChild(hint);

      container.appendChild(sliderDiv);
    });
  }

  function buildToggles() {
    const lightsPanel = $("panel-lights");
    const advancedPanel = $("panel-advanced");

    // Lights toggles
    const fxGroup = document.createElement("div");
    fxGroup.className = "setting-group";
    fxGroup.innerHTML = `
      <div class="toggle-row">
        <div class="toggle-info">
          <p class="toggle-name">Dynamic Background</p>
          <p class="toggle-desc">Ambient light effects with depth</p>
        </div>
        <button id="fxOn-toggle-btn" class="clay-toggle" role="switch" aria-checked="false">
          <span class="toggle-inner"></span>
        </button>
      </div>
    `;
    lightsPanel.querySelector(".setting-group:nth-of-type(1)")?.replaceWith(fxGroup);

    const mouseGroup = document.createElement("div");
    mouseGroup.className = "setting-group";
    mouseGroup.innerHTML = `
      <div class="toggle-row">
        <div class="toggle-info">
          <p class="toggle-name">Cursor Interaction</p>
          <p class="toggle-desc">Light responds to cursor movement</p>
        </div>
        <button id="mouseGlow-toggle-btn" class="clay-toggle" role="switch" aria-checked="false">
          <span class="toggle-inner"></span>
        </button>
      </div>
    `;
    lightsPanel.querySelector(".setting-group:nth-of-type(3)")?.replaceWith(mouseGroup);

    // Advanced toggles
    const hover3dGroup = document.createElement("div");
    hover3dGroup.className = "setting-group";
    hover3dGroup.innerHTML = `
      <div class="toggle-row">
        <div class="toggle-info">
          <p class="toggle-name">3D Chat Hover</p>
          <p class="toggle-desc">Chat bubbles lift on hover</p>
        </div>
        <button id="hover3d-toggle-btn" class="clay-toggle" role="switch" aria-checked="false">
          <span class="toggle-inner"></span>
        </button>
      </div>
    `;
    advancedPanel.firstChild?.nextSibling?.replaceWith(hover3dGroup);

    const dragGroup = document.createElement("div");
    dragGroup.className = "setting-group";
    dragGroup.innerHTML = `
      <div class="toggle-row">
        <div class="toggle-info">
          <p class="toggle-name">Draggable Dialogs</p>
          <p class="toggle-desc">Drag dialog windows by the title</p>
        </div>
        <button id="dragDialogs-toggle-btn" class="clay-toggle" role="switch" aria-checked="false">
          <span class="toggle-inner"></span>
        </button>
      </div>
    `;
    advancedPanel.children[1]?.replaceWith(dragGroup);

    // Add event listeners
    $$(".clay-toggle").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const key = btn.id.replace("-toggle-btn", "").replace("-toggle", "");
        settings = CUG.normalize({ ...settings, [key]: !settings[key] });
        render(true);
        
        // Instant preview update
        syncPreview();
        
        // Auto-save
        CUG.save(settings);
      });
    });
  }

  function buildPresets() {
    const container = $("panel-clay").querySelector(".preset-buttons");
    container.innerHTML = "";
    
    Object.entries(CONTROLS.presets).forEach(([key, preset]) => {
      const btn = document.createElement("button");
      btn.className = "preset-btn";
      btn.textContent = preset.label;
      btn.dataset.preset = key;
      btn.addEventListener("click", () => {
        settings = CUG.normalize({ ...settings, accent: preset.accent });
        render(true);
        syncPreview();
        CUG.save(settings);
      });
      container.appendChild(btn);
    });
  }

  function setupTabNavigation() {
    const tabs = $$(".nav-tab");
    const panels = $$(".settings-panel");

    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        const panelName = tab.dataset.tab;
        
        // Update tabs
        tabs.forEach(t => {
          t.classList.toggle("active", t.dataset.tab === panelName);
          t.setAttribute("aria-selected", t.dataset.tab === panelName);
        });

        // Update panels
        panels.forEach(panel => {
          panel.classList.toggle("active", panel.dataset.panel === panelName);
        });
      });
    });
    
    // Quality buttons
    $$(".quality-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const quality = btn.dataset.quality;
        settings = CUG.normalize({ ...settings, quality });
        render(true);
        syncPreview();
        CUG.save(settings);
      });
    });
  }

  function setupMasterToggle() {
    const toggle = $("enabled");
    toggle.addEventListener("click", () => {
      settings = CUG.normalize({ ...settings, enabled: !settings.enabled });
      render(true);
      syncPreview();
      CUG.save(settings);
    });
  }

  function setupResetButton() {
    $("reset-btn").addEventListener("click", () => {
      if (confirm("Reset all settings to defaults?")) {
        update({ ...CUG.DEFAULTS });
      }
    });
  }

  function attachSliderEvents() {
    $$(".clay-slider").forEach(slider => {
      slider.addEventListener("input", (e) => {
        const container = slider.closest(".slider-container");
        const key = container.dataset.slider;
        const config = CONTROLS.sliders[key];
        
        const newValue = parseInt(slider.value);
        settings = CUG.normalize({ ...settings, [key]: newValue });
        
        const output = container.querySelector(".slider-output");
        output.textContent = newValue + config.unit;
        
        slider.style.setProperty("--fill", ((newValue - config.min) / (config.max - config.min)) * 100 + "%");
        
        // LIVE PREVIEW - instant update
        syncPreview();
        
        // Auto-save after delay
        clearTimeout(slider.dataset.saveTimeout);
        slider.dataset.saveTimeout = setTimeout(() => {
          CUG.save(settings);
        }, 300);
      });
      
      // Also update on change event
      slider.addEventListener("change", () => {
        const container = slider.closest(".slider-container");
        const key = container.dataset.slider;
        CUG.save(settings);
      });
    });
  }

  /* ========================================================================
     STATE MANAGEMENT
     ======================================================================== */

  function update(patch) {
    settings = CUG.normalize({ ...settings, ...patch });
    render(true);
    CUG.save(settings);
  }

  function render(preview = false) {
    // Master toggle
    $("enabled").setAttribute("aria-checked", String(settings.enabled));
    $("stateText").textContent = settings.enabled ? "Active" : "Disabled";

    // Toggles
    $$(".clay-toggle").forEach(btn => {
      const key = btn.id.replace("-toggle-btn", "").replace("-toggle", "");
      btn.setAttribute("aria-checked", String(settings[key]));
    });

    // Sliders
    $$(".slider-container").forEach(container => {
      const key = container.dataset.slider;
      const slider = container.querySelector(".clay-slider");
      const output = container.querySelector(".slider-output");
      const config = CONTROLS.sliders[key];
      
      slider.value = settings[key];
      output.textContent = settings[key] + config.unit;
      slider.style.setProperty("--fill", ((settings[key] - config.min) / (config.max - config.min)) * 100 + "%");
    });

    // Chips
    $$(".chip-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.value === settings.palette);
    });

    // Swatches
    $$(".swatch-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.value === settings.accent);
    });

    // Presets
    $$(".preset-btn").forEach(btn => {
      btn.classList.toggle("active", settings.accent === CONTROLS.presets[btn.dataset.preset]?.accent);
    });

    // Quality buttons
    $$(".quality-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.quality === settings.quality);
    });

    if (preview) {
      syncPreview();
    }
  }

  let preview = null;
  let previewTimeout = null;
  
  function syncPreview() {
    const canvas = $("canvas");
    
    // Clear any pending updates
    clearTimeout(previewTimeout);
    
    if (!settings.fxOn) { 
      preview?.destroy(); 
      preview = null; 
      canvas.style.display = "none"; 
      return; 
    }
    
    canvas.style.display = "block";
    
    if (!preview) { 
      preview = CUGFX.create(canvas); 
      if (!preview) { 
        canvas.style.display = "none"; 
        return; 
      } 
      preview.start(); 
    }
    
    // Debounce preview update for performance
    previewTimeout = setTimeout(() => {
      try {
        preview.update({ 
          ...CUGFX.paramsFrom({ ...settings, quality: "low" }, false) 
        });
      } catch (e) {
        console.error("Preview update error:", e);
      }
    }, 50);
  }

  /* ========================================================================
     INITIALIZATION
     ======================================================================== */

  CUG.load().then((s) => {
    settings = s;
    initializeUI();
    
    // Start preview
    setTimeout(() => {
      syncPreview();
    }, 100);
  });
})();

(() => {
  "use strict";

  const KEY = "ambientGlowLite";
  const DEFAULTS = Object.freeze({ enabled: true, intensity: 65, blur: 55, fps: 4 });
  const COLORS = ["top", "right", "bottom", "left"];
  const canvas = document.createElement("canvas");
  canvas.width = 24;
  canvas.height = 16;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  let settings = { ...DEFAULTS };
  let player = null;
  let video = null;
  let nextSample = 0;
  let rafId = 0;
  let active = false;
  let sampleFailed = false;
  let lastUrl = location.href;
  const smoothed = COLORS.map(() => [100, 100, 160]);

  function clamp(value, min, max, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
  }
  function applySettings(value) {
    settings = {
      enabled: typeof value?.enabled === "boolean" ? value.enabled : DEFAULTS.enabled,
      intensity: clamp(value?.intensity, 0, 100, DEFAULTS.intensity),
      blur: clamp(value?.blur, 0, 100, DEFAULTS.blur),
      fps: clamp(value?.fps, 1, 8, DEFAULTS.fps)
    };
    sync();
  }
  function findPlayer() {
    const candidate = document.querySelector("#movie_player");
    const candidateVideo = candidate?.querySelector("video.html5-main-video");
    const watchPage = location.pathname === "/watch";
    if (!watchPage || !candidate || !candidateVideo) return [null, null];
    return [candidate, candidateVideo];
  }
  function stop() {
    active = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    player?.classList.remove("yagl-active");
  }
  function sync() {
    const [currentPlayer, currentVideo] = findPlayer();
    if (player !== currentPlayer || video !== currentVideo) {
      stop();
      player = currentPlayer;
      video = currentVideo;
      sampleFailed = false;
      smoothed.forEach((item) => item.splice(0, 3, 100, 100, 160));
    }
    const shouldRun = settings.enabled && !!ctx && !!player && !!video &&
      !document.hidden && !document.fullscreenElement && !player.classList.contains("ytp-fullscreen");
    if (!shouldRun) {
      stop();
      return;
    }
    player.classList.add("yagl-active");
    player.style.setProperty("--yagl-spread", `${Math.round(30 + settings.blur * .7)}px`);
    player.style.setProperty("--yagl-blur", `${Math.round(16 + settings.blur * .55)}px`);
    if (!active) {
      active = true;
      nextSample = 0;
      rafId = requestAnimationFrame(tick);
    }
  }
  function sample() {
    if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || sampleFailed) return;
    try {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const sums = COLORS.map(() => [0, 0, 0, 0]);
      for (let y = 0; y < canvas.height; y += 1) {
        for (let x = 0; x < canvas.width; x += 1) {
          const i = (y * canvas.width + x) * 4;
          // Ignore near-black letterboxing and transparent pixels.
          const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
          if (pixels[i + 3] < 128 || r + g + b < 36) continue;
          const sides = [];
          if (y < canvas.height * .35) sides.push(0);
          if (x >= canvas.width * .65) sides.push(1);
          if (y >= canvas.height * .65) sides.push(2);
          if (x < canvas.width * .35) sides.push(3);
          for (const side of sides) {
            sums[side][0] += r;
            sums[side][1] += g;
            sums[side][2] += b;
            sums[side][3]++;
          }
        }
      }
      const alpha = (.13 + settings.intensity / 100 * .62).toFixed(3);
      const factor = .25;
      sums.forEach((sum, index) => {
        if (!sum[3]) return;
        const target = sum.slice(0, 3).map((channel) => channel / sum[3]);
        for (let k = 0; k < 3; k++) {
          smoothed[index][k] += (target[k] - smoothed[index][k]) * factor;
        }
        const color = smoothed[index].map((channel) => Math.round(channel));
        player.style.setProperty(`--yagl-${COLORS[index]}`, `rgba(${color.join(",")}, ${alpha})`);
      });
    } catch (error) {
      // Cross-origin video frames and DRM may disallow canvas access.
      // Stop sampling rather than attempting to bypass browser protections.
      if (error?.name === "SecurityError" || error?.name === "NotSupportedError") {
        sampleFailed = true;
        player?.classList.remove("yagl-active");
        return;
      }
      sampleFailed = true;
      player?.classList.remove("yagl-active");
    }
  }
  function tick(now) {
    if (!active) return;
    if (!video?.isConnected || !player?.isConnected || location.href !== lastUrl ||
        document.hidden || document.fullscreenElement ||
        player.classList.contains("ytp-fullscreen")) {
      lastUrl = location.href;
      sync();
      return;
    }
    if (now >= nextSample) {
      sample();
      nextSample = now + 1000 / settings.fps;
    }
    if (sampleFailed) { stop(); return; }
    rafId = requestAnimationFrame(tick);
  }
  chrome.storage.sync.get({ [KEY]: DEFAULTS }, (result) => {
    if (chrome.runtime.lastError) return applySettings(DEFAULTS);
    applySettings(result[KEY]);
  });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync" && changes[KEY]) applySettings(changes[KEY].newValue);
  });
  document.addEventListener("visibilitychange", sync);
  document.addEventListener("fullscreenchange", sync);
  window.addEventListener("yt-navigate-finish", () => {
    lastUrl = location.href;
    sync();
  });
  window.addEventListener("popstate", () => {
    lastUrl = location.href;
    sync();
  });
  // YouTube swaps players and videos without a full page reload.
  const observer = new MutationObserver(() => {
    const [candidate, candidateVideo] = findPlayer();
    if (candidate !== player || candidateVideo !== video ||
        (active && player?.classList.contains("ytp-fullscreen"))) sync();
    if (location.href !== lastUrl) { lastUrl = location.href; sync(); }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  sync();
})();

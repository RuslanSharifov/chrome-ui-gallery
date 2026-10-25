/**
 * DevLens — HUD (Heads-Up Display)
 * Floating mini-panel rendered directly on the page.
 * Click → opens full DevLens panel in a new window.
 */

(function () {
  'use strict';

  if (window.__devlens_hud_mounted__) return;
  window.__devlens_hud_mounted__ = true;

  // ── State ─────────────────────────────────────────────────────────────────
  const counters = { error: 0, warn: 0, log: 0, network: 0, total: 0 };
  let   settings = {
    hudVisible:   true,
    hudPosition:  'bottom-right',
    hudOpacity:   0.92,
    theme:        'dark',
    showErrors:   true,
    showWarns:    true,
    showLogs:     true,
    showNetwork:  true,
    maxEntries:   500
  };
  let hudEl      = null;
  let badgeEl    = null;
  let miniLogEl  = null;
  let dragState  = null;
  let recentLogs = [];       // last 5 messages for mini preview
  let isPinned   = false;

  // ── Load settings from storage ────────────────────────────────────────────
  function loadSettings(cb) {
    try {
      chrome.storage.local.get('devlens_settings', function (res) {
        if (res && res.devlens_settings) {
          Object.assign(settings, res.devlens_settings);
        }
        cb();
      });
    } catch (e) { cb(); }
  }

  function saveSettings() {
    try { chrome.storage.local.set({ devlens_settings: settings }); }
    catch (e) {}
  }

  // ── Build HUD DOM ─────────────────────────────────────────────────────────
  function buildHUD() {
    if (hudEl) return;

    hudEl = document.createElement('div');
    hudEl.id = '__devlens_hud__';
    hudEl.setAttribute('data-devlens', 'true');
    hudEl.setAttribute('data-theme', settings.theme);
    hudEl.setAttribute('data-pos', settings.hudPosition);
    hudEl.style.opacity = settings.hudOpacity;
    hudEl.style.setProperty('display', settings.hudVisible ? 'flex' : 'none', 'important');

    hudEl.innerHTML = `
      <div class="dl-hud-header">
        <span class="dl-logo">⬡ DevLens</span>
        <div class="dl-hud-controls">
          <button class="dl-btn dl-pin" title="Pin/Unpin">📌</button>
          <button class="dl-btn dl-clear" title="Clear logs">🗑</button>
          <button class="dl-btn dl-stats-open" title="Open live network statistics" aria-label="Open live network statistics">▥</button>
          <button class="dl-btn dl-open" title="Open full panel">⛶</button>
          <button class="dl-btn dl-hide" title="Minimize">−</button>
        </div>
      </div>
      <div class="dl-badges">
        <span class="dl-badge dl-badge-error"  title="Errors">✕ <b class="dl-c-error">0</b></span>
        <span class="dl-badge dl-badge-warn"   title="Warnings">⚠ <b class="dl-c-warn">0</b></span>
        <span class="dl-badge dl-badge-log"    title="Logs">≡ <b class="dl-c-log">0</b></span>
        <span class="dl-badge dl-badge-net"    title="Network">⇅ <b class="dl-c-net">0</b></span>
      </div>
      <div class="dl-mini-log"></div>
    `;

    document.documentElement.appendChild(hudEl);

    badgeEl   = hudEl;
    miniLogEl = hudEl.querySelector('.dl-mini-log');

    // ── Control buttons ────────────────────────────────────────────────────
    hudEl.querySelector('.dl-open').addEventListener('click', openFullPanel);
    hudEl.querySelector('.dl-stats-open').addEventListener('click', () => window.dispatchEvent(new Event('devlens:stats-open')));
    hudEl.querySelector('.dl-hide').addEventListener('click', minimizeHUD);
    hudEl.querySelector('.dl-clear').addEventListener('click', () => { clearLogs(); chrome.runtime.sendMessage({action:'clearLogs'}).catch(() => {}); });
    hudEl.querySelector('.dl-pin').addEventListener('click', function () {
      isPinned = !isPinned;
      hudEl.classList.toggle('dl-pinned', isPinned);
    });

    // Click on mini-log row → open panel
    miniLogEl.addEventListener('click', openFullPanel);

    // ── Drag ──────────────────────────────────────────────────────────────
    const header = hudEl.querySelector('.dl-hud-header');
    header.addEventListener('mousedown', onDragStart);

    // ── Position ──────────────────────────────────────────────────────────
    applyPosition();

    // Create minimized pill
    createMinimizedPill();
    updateBadges();
    if (miniLogEl) window.__devlens_events__.slice(-100).forEach(addMiniLog);
  }

  function applyPosition() {
    if (!hudEl) return;
    const pos = settings.hudPosition;
    hudEl.style.top    = '';
    hudEl.style.bottom = '';
    hudEl.style.left   = '';
    hudEl.style.right  = '';
    if (pos === 'top-left')     { hudEl.style.top = '16px';    hudEl.style.left  = '16px'; }
    if (pos === 'top-right')    { hudEl.style.top = '16px';    hudEl.style.right = '16px'; }
    if (pos === 'bottom-left')  { hudEl.style.bottom = '16px'; hudEl.style.left  = '16px'; }
    if (pos === 'bottom-right') { hudEl.style.bottom = '16px'; hudEl.style.right = '16px'; }
  }

  function createMinimizedPill() {
    const pill = document.createElement('div');
    pill.id = '__devlens_pill__';
    pill.setAttribute('data-devlens', 'true');
    pill.setAttribute('data-theme', settings.theme);
    pill.innerHTML = `⬡ <span class="dl-pill-count">0</span>`;
    pill.style.setProperty('display', 'none', 'important');
    pill.addEventListener('click', restoreHUD);
    document.documentElement.appendChild(pill);
    window.__devlens_pill__ = pill;
  }

  function minimizeHUD() {
    if (hudEl) hudEl.style.setProperty('display', 'none', 'important');
    const pill = window.__devlens_pill__;
    if (pill) pill.style.setProperty('display', 'flex', 'important');
  }

  function restoreHUD() {
    if (hudEl) hudEl.style.setProperty('display', 'flex', 'important');
    const pill = window.__devlens_pill__;
    if (pill) pill.style.setProperty('display', 'none', 'important');
  }

  function clearLogs() {
    window.__devlens_events__ = [];
    counters.error = counters.warn = counters.log = counters.network = counters.total = 0;
    recentLogs = [];
    updateBadges();
    if (miniLogEl) miniLogEl.replaceChildren();
  }

  // ── Drag logic ────────────────────────────────────────────────────────────
  function onDragStart(e) {
    if (e.target.closest('.dl-btn')) return;
    dragState = {
      startX: e.clientX,
      startY: e.clientY,
      rect:   hudEl.getBoundingClientRect()
    };
    hudEl.style.right  = '';
    hudEl.style.bottom = '';
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);
    e.preventDefault();
  }

  function onDragMove(e) {
    if (!dragState) return;
    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    let nx = dragState.rect.left + dx;
    let ny = dragState.rect.top  + dy;
    nx = Math.max(0, Math.min(nx, window.innerWidth  - hudEl.offsetWidth));
    ny = Math.max(0, Math.min(ny, window.innerHeight - hudEl.offsetHeight));
    hudEl.style.left = nx + 'px';
    hudEl.style.top  = ny + 'px';
    window.dispatchEvent(new Event('devlens:hud-move'));
  }

  function onDragEnd() {
    dragState = null;
    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('mouseup',   onDragEnd);
  }

  // ── Update badges & mini log ──────────────────────────────────────────────
  function updateBadges() {
    if (!hudEl) return;
    hudEl.querySelector('.dl-c-error').textContent = counters.error;
    hudEl.querySelector('.dl-c-warn').textContent  = counters.warn;
    hudEl.querySelector('.dl-c-log').textContent   = counters.log;
    hudEl.querySelector('.dl-c-net').textContent   = counters.network;

    const pill = window.__devlens_pill__;
    if (pill) pill.querySelector('.dl-pill-count').textContent = counters.total;

    // Flash error badge if error
    if (counters.error > 0) {
      hudEl.classList.add('dl-has-error');
    }
  }

  function addMiniLog(entry) {
    if (!miniLogEl) return;
    if (entry.category==='network' && (!settings.showNetwork || entry.phase==='start')) return;
    if (entry.category==='console') {
      const level=entry.level;
      if ((level==='error'&&!settings.showErrors) || (level==='warn'&&!settings.showWarns) || (level!=='error'&&level!=='warn'&&!settings.showLogs)) return;
    }

    const row = document.createElement('div');
    row.className = 'dl-mini-row dl-level-' + (entry.level || entry.phase || 'log');

    let icon = '◦';
    if (entry.category === 'console') {
      if (entry.level === 'error') icon = '✕';
      else if (entry.level === 'warn') icon = '⚠';
      else icon = '›';
    } else if (entry.category === 'network') {
      const ok = entry.ok === false ? '✕' : (entry.phase === 'start' ? '↑' : '✓');
      icon = ok;
    }

    const msg = entry.category === 'network'
      ? `${entry.method} ${truncate(entry.url, 40)} ${entry.status ? '[' + entry.status + ']' : ''}`
      : truncate(entry.message || '', 55);

    row.textContent = icon + ' ' + msg;
    miniLogEl.appendChild(row);

    // Keep only last 6 rows
    while (miniLogEl.children.length > 6) {
      miniLogEl.removeChild(miniLogEl.firstChild);
    }
    miniLogEl.scrollTop = miniLogEl.scrollHeight;
  }

  function truncate(str, max) {
    return str && str.length > max ? str.slice(0, max) + '…' : str;
  }

  // ── Open full panel ───────────────────────────────────────────────────────
  function openFullPanel() {
    // Send current log buffer to background, then open panel
    chrome.runtime.sendMessage({
      action: 'openPanel',
      events: window.__devlens_events__,
      url:    location.href
    });
  }

  // ── Listen to new entries ─────────────────────────────────────────────────
  window.addEventListener('devlens:entry', function (e) {
    const entry = e.detail;

    if (entry.category === 'console') {
      if (entry.level === 'error' || entry.source === 'uncaught' || entry.source === 'promise') {
        counters.error++;
      } else if (entry.level === 'warn') {
        counters.warn++;
      } else {
        counters.log++;
      }
      counters.total++;
      addMiniLog(entry);
    } else if (entry.category === 'network') {
      if (entry.phase !== 'start') {
        counters.network++;
        counters.total++;
        addMiniLog(entry);
      }
    }

    updateBadges();
  });

  // ── Listen for messages from popup / panel ────────────────────────────────
  chrome.runtime.onMessage.addListener(function (msg) {
    if (msg.action === 'toggleHUD') {
      settings.hudVisible = msg.value;
      saveSettings();
      if (hudEl) hudEl.style.setProperty('display', msg.value ? 'flex' : 'none', 'important');
    }
    if (msg.action === 'updateSettings') {
      Object.assign(settings, msg.settings);
      saveSettings();
      if (hudEl) {
        hudEl.style.setProperty('display', settings.hudVisible ? 'flex' : 'none', 'important');
        hudEl.setAttribute('data-theme', settings.theme);
        hudEl.style.opacity = settings.hudOpacity;
        hudEl.setAttribute('data-pos', settings.hudPosition);
        applyPosition();
        if (miniLogEl) { miniLogEl.replaceChildren(); window.__devlens_events__.slice(-100).forEach(addMiniLog); }
      }
    }
    if (msg.action === 'clearLogs') {
      clearLogs();
    }
  });

  // ── Init ──────────────────────────────────────────────────────────────────
  function init() {
    loadSettings(function () {
      buildHUD();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

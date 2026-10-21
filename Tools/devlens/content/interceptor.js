/**
 * DevLens — isolated-world bridge.
 * Receives page-world CustomEvents and forwards bounded data to HUD and extension.
 * Never makes outgoing HTTP requests; all diagnostics stay in browser memory.
 */
(function () {
  'use strict';
  if (window.__devlens_injected__) return;
  window.__devlens_injected__ = true;
  const MAX = 500;
  window.__devlens_events__ = [];
  function text(value, limit = 1200) {
    let result;
    try { result = String(value ?? ''); } catch { result = '[unavailable]'; }
    return result.slice(0, limit);
  }
  function push(entry) {
    const events = window.__devlens_events__;
    events.push(entry);
    if (events.length > MAX) events.shift();
    window.dispatchEvent(new CustomEvent('devlens:entry', {detail:entry}));
    // The background script buffers recent entries and forwards them to the panel.
    // A content script can outlive an extension reload/uninstall. In that case,
    // accessing chrome.runtime.id or sendMessage may throw synchronously.
    // Missing receivers and expired contexts must not break the host page.
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime?.id) {
        const pending = chrome.runtime.sendMessage({action:'logEntry',entry});
        if (pending && typeof pending.catch === 'function') pending.catch(() => {});
      }
    } catch (_) {
      // Extension context invalidated while this page was open.
    }
  }
  window.addEventListener('__devlens_console__', function (e) {
    const data = e.detail || {};
    const args = Array.isArray(data.args) ? data.args.slice(0,15).map(a=>text(a)) : [];
    const source = text(data.source||'console',32);
    push({
      id:Math.random().toString(36).slice(2),category:'console',
      level:text(data.level||'log',32),source,
      message:text(args.join(' '),4000),args,
      time:Number(data.time)||Date.now(), stack:text(data.stack||'',6000)
    });
  });
  window.addEventListener('__devlens_network__', function (e) {
    const d = e.detail || {};
    const numeric = value => value === null || value === undefined || !Number.isFinite(Number(value)) ? null : Number(value);
    push({
      id:text(d.id,80),category:'network',
      type:text(d.type||'fetch',16),method:text(d.method||'GET',16),
      url:text(d.url,2500),status:d.status==='ERR'?'ERR':numeric(d.status),
      statusText:text(d.statusText||'',100),duration:numeric(d.duration),
      size:numeric(d.size),time:numeric(d.time)||Date.now(),
      phase:text(d.phase||'',12),ok:d.ok===true,error:text(d.error||'',300)
    });
  });
  chrome.runtime.onMessage.addListener((msg,_sender,respond)=>{
    if(msg?.action==='getEvents') {
      respond({events:window.__devlens_events__.slice(-MAX),url:location.href});
    }
  });
})();

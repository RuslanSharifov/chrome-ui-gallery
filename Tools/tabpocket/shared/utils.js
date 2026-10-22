export function isSafeUrl(url) {
  if (typeof url !== 'string' || url.length > 2048) return false;
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export function faviconUrl(url) {
  return chrome.runtime.getURL(`_favicon/?pageUrl=${encodeURIComponent(url)}&size=32`);
}

export function fmtDate(ts) {
  return new Date(ts).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

// Safe DOM builder: strings become text nodes, never HTML.
export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith('on')) node.addEventListener(key.slice(2), value);
    else if (key in node) node[key] = value;
    else node.setAttribute(key, value);
  }
  for (const child of [].concat(children)) node.append(child);
  return node;
}

export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme === 'light' ? 'light' : 'dark';
}

// mode 'focus': focus an already-open identical URL. mode 'open': always open a new tab.
export async function openTabs(urls, mode = 'focus') {
  const open = await chrome.tabs.query({});
  const byUrl = new Map(open.map((t) => [t.url, t.id]));
  let created = 0;
  for (const url of urls) {
    if (!isSafeUrl(url)) continue;
    const existingId = byUrl.get(url);
    if (existingId !== undefined && mode === 'focus') {
      await chrome.tabs.update(existingId, { active: true });
    } else {
      await chrome.tabs.create({ url, active: false });
      created++;
    }
  }
  return created;
}

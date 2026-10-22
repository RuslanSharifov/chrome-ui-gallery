import { isSafeUrl } from './utils.js';

export const DEFAULT_SETTINGS = { theme: 'dark', duplicateMode: 'focus', confirmDelete: true, confirmClose: true };
export const MAX_IMPORT_BYTES = 2 * 1024 * 1024;
const MAX_TABS = 2000;

export function uid() {
  return crypto.randomUUID();
}

// Validates and normalizes one collection. Returns null if unusable.
export function sanitizeCollection(c) {
  if (!c || typeof c.name !== 'string' || !Array.isArray(c.tabs)) return null;
  const seen = new Set();
  const tabs = [];
  for (const t of c.tabs) {
    if (tabs.length >= MAX_TABS) break;
    if (!t || !isSafeUrl(t.url) || seen.has(t.url)) continue;
    seen.add(t.url);
    tabs.push({ url: t.url, title: String(t.title || t.url).slice(0, 300) });
  }
  return {
    id: typeof c.id === 'string' && c.id ? c.id : uid(),
    name: c.name.trim().slice(0, 60) || 'Untitled',
    created: Number.isFinite(c.created) ? c.created : Date.now(),
    fav: c.fav === true,
    tabs,
  };
}

export async function getCollections() {
  const { collections } = await chrome.storage.local.get('collections');
  if (!Array.isArray(collections)) return [];
  const ids = new Set();
  return collections
    .map(sanitizeCollection)
    .filter(Boolean)
    .map((c) => {
      if (ids.has(c.id)) c.id = uid();
      ids.add(c.id);
      return c;
    });
}

export async function setCollections(list) {
  await chrome.storage.local.set({ collections: list });
}

export async function getSettings() {
  const { settings } = await chrome.storage.local.get('settings');
  return { ...DEFAULT_SETTINGS, ...(settings && typeof settings === 'object' ? settings : {}) };
}

export async function setSettings(settings) {
  await chrome.storage.local.set({ settings });
}

import { getCollections, setCollections, getSettings } from '../shared/storage.js';
import { el, fmtDate, faviconUrl, openTabs, applyTheme, isSafeUrl } from '../shared/utils.js';

const $ = (id) => document.getElementById(id);
const settings = await getSettings();
applyTheme(settings.theme);

const collectionId = new URLSearchParams(location.search).get('id');
const all = await getCollections();
const col = all.find((c) => c.id === collectionId);
const selected = new Set(); // selected tab URLs
let filter = '';

function status(msg) { $('status').textContent = msg; }
function openMode() { return settings.duplicateMode === 'open' ? 'open' : 'focus'; }

function visible() {
  return col.tabs.filter((t) => !filter || t.title.toLowerCase().includes(filter) || t.url.toLowerCase().includes(filter));
}

function updateCounts() {
  $('openSel').textContent = `Open selected (${selected.size})`;
  $('removeSel').textContent = `Remove selected (${selected.size})`;
}

function row(t) {
  return el('li', { class: 'row' }, [
    el('input', {
      type: 'checkbox', checked: selected.has(t.url), 'aria-label': `Select ${t.title}`,
      onchange: (e) => {
        if (e.target.checked) selected.add(t.url); else selected.delete(t.url);
        updateCounts();
      },
    }),
    el('img', { src: faviconUrl(t.url), alt: '', width: 16, height: 16 }),
    el('div', { class: 'txt' }, [
      el('span', { class: 't', title: t.title }, t.title),
      el('span', { class: 'u' }, t.url),
    ]),
  ]);
}

function fillMoveOptions() {
  $('moveTo').replaceChildren(...all.filter((c) => c.id !== col.id).map((c) => el('option', { value: c.id }, c.name)));
  $('moveBtn').disabled = all.length < 2;
}

function render() {
  $('title').textContent = col.name;
  $('meta').textContent = `${col.tabs.length} saved tabs · created ${fmtDate(col.created)}`;
  const shown = visible();
  $('rows').replaceChildren(...shown.map(row));
  $('empty').hidden = shown.length > 0;
  $('openAll').textContent = `Open all (${col.tabs.length})`;
  updateCounts();
}

// Re-reads storage and replaces only this collection, so changes made elsewhere survive.
async function persist() {
  const latest = await getCollections();
  const i = latest.findIndex((c) => c.id === col.id);
  if (i < 0) return false;
  latest[i] = col;
  await setCollections(latest);
  return true;
}

async function addUrl() {
  const raw = $('addUrl').value.trim();
  if (!isSafeUrl(raw)) return status('Enter a valid http:// or https:// address.');
  if (col.tabs.some((t) => t.url === raw)) return status('That URL is already in this collection.');
  col.tabs.push({ url: raw, title: new URL(raw).hostname });
  await persist();
  $('addUrl').value = '';
  render();
  status('URL added.');
}

async function removeSelected() {
  if (!selected.size || !confirm(`Remove ${selected.size} tab(s) from this collection?`)) return;
  col.tabs = col.tabs.filter((t) => !selected.has(t.url));
  selected.clear();
  await persist();
  render();
  status('Removed selected tabs.');
}

async function moveSelected() {
  const targetId = $('moveTo').value;
  if (!selected.size || !targetId) return status('Select tabs and a target collection first.');
  const latest = await getCollections();
  const src = latest.find((c) => c.id === col.id);
  const dst = latest.find((c) => c.id === targetId);
  if (!src || !dst) return status('Collection not found.');
  const moving = src.tabs.filter((t) => selected.has(t.url));
  const have = new Set(dst.tabs.map((t) => t.url));
  dst.tabs.push(...moving.filter((t) => !have.has(t.url)));
  src.tabs = src.tabs.filter((t) => !selected.has(t.url));
  await setCollections(latest);
  col.tabs = src.tabs;
  selected.clear();
  render();
  status(`Moved ${moving.length} tab(s) to "${dst.name}".`);
}

async function rename() {
  const name = prompt('New collection name', col.name)?.trim().slice(0, 60);
  if (!name) return;
  col.name = name;
  await persist();
  render();
  status('Collection renamed.');
}

async function deleteCollection() {
  if (settings.confirmDelete && !confirm(`Delete "${col.name}" and all ${col.tabs.length} saved tabs?`)) return;
  await setCollections((await getCollections()).filter((c) => c.id !== col.id));
  const tab = await chrome.tabs.getCurrent();
  if (tab) chrome.tabs.remove(tab.id);
}

if (!col) {
  $('title').textContent = 'Collection not found';
  document.querySelectorAll('.bar button, .toolbar button').forEach((b) => (b.disabled = true));
} else {
  $('filter').addEventListener('input', (e) => { filter = e.target.value.trim().toLowerCase(); render(); });
  $('selAll').addEventListener('click', () => { visible().forEach((t) => selected.add(t.url)); render(); });
  $('selNone').addEventListener('click', () => { selected.clear(); render(); });
  $('addBtn').addEventListener('click', addUrl);
  $('openSel').addEventListener('click', async () => status(`Opened ${await openTabs([...selected], openMode())} new tab(s).`));
  $('openAll').addEventListener('click', async () => status(`Opened ${await openTabs(col.tabs.map((t) => t.url), openMode())} new tab(s).`));
  $('removeSel').addEventListener('click', removeSelected);
  $('moveBtn').addEventListener('click', moveSelected);
  $('rename').addEventListener('click', rename);
  $('delete').addEventListener('click', deleteCollection);
  fillMoveOptions();
  render();
}

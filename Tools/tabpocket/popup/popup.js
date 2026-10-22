import { getCollections, setCollections, getSettings, uid } from '../shared/storage.js';
import { el, fmtDate, faviconUrl, isSafeUrl, openTabs, applyTheme } from '../shared/utils.js';

const $ = (id) => document.getElementById(id);
const settings = await getSettings();
applyTheme(settings.theme);

let collections = await getCollections();
const expanded = new Set();
let picks = []; // { tabId, url, title, selected }

function status(msg) { $('status').textContent = msg; }
function openMode() { return settings.duplicateMode === 'open' ? 'open' : 'focus'; }

function sortedVisible() {
  const q = $('search').value.trim().toLowerCase();
  const by = $('sort').value;
  return collections
    .filter((c) => c.name.toLowerCase().includes(q))
    .sort((a, b) => {
      if (by === 'fav' && a.fav !== b.fav) return a.fav ? -1 : 1;
      if (by === 'date') return b.created - a.created;
      return a.name.localeCompare(b.name);
    });
}

function render() {
  $('list').replaceChildren(...sortedVisible().map(card));
  $('empty').hidden = collections.length > 0;
  $('names').replaceChildren(...collections.map((c) => el('option', { value: c.name })));
}

function card(c) {
  const isOpen = expanded.has(c.id);
  const preview = el('ul', { class: 'preview', hidden: !isOpen }, [
    ...c.tabs.slice(0, 8).map((t) => el('li', { title: t.url }, t.title)),
    ...(c.tabs.length > 8 ? [el('li', {}, `…and ${c.tabs.length - 8} more`)] : []),
  ]);
  return el('li', { class: 'card' }, [
    el('div', { class: 'card-head' }, [
      el('button', {
        type: 'button', class: 'name', 'aria-expanded': String(isOpen),
        onclick: () => { isOpen ? expanded.delete(c.id) : expanded.add(c.id); render(); },
      }, c.name),
      el('button', {
        type: 'button', class: 'star', 'aria-pressed': String(c.fav),
        'aria-label': c.fav ? 'Remove from favorites' : 'Add to favorites',
        onclick: async () => { c.fav = !c.fav; await setCollections(collections); render(); },
      }, c.fav ? '★' : '☆'),
    ]),
    el('span', { class: 'meta' }, `${c.tabs.length} tabs · ${fmtDate(c.created)}`),
    preview,
    el('div', { class: 'actions' }, [
      el('button', {
        type: 'button',
        onclick: async () => status(`Opened ${await openTabs(c.tabs.map((t) => t.url), openMode())} new tab(s).`),
      }, 'Open all'),
      el('button', {
        type: 'button',
        onclick: () => chrome.tabs.create({ url: chrome.runtime.getURL(`dashboard/index.html?id=${encodeURIComponent(c.id)}`) }),
      }, 'Explore'),
      el('button', { type: 'button', class: 'danger', onclick: () => removeCollection(c) }, 'Delete'),
    ]),
  ]);
}

async function removeCollection(c) {
  if (settings.confirmDelete && !confirm(`Delete "${c.name}" and its ${c.tabs.length} saved tabs?`)) return;
  collections = collections.filter((x) => x.id !== c.id);
  await setCollections(collections);
  render();
  status('Collection deleted.');
}

async function openSave() {
  const wins = await chrome.tabs.query({ currentWindow: true });
  picks = wins
    .filter((t) => isSafeUrl(t.url))
    .map((t) => ({ tabId: t.id, url: t.url, title: String(t.title || t.url).slice(0, 300), selected: true }));
  if (!picks.length) return status('No saveable web tabs in this window.');
  $('newName').value = '';
  $('closeAfter').checked = false;
  renderPicks();
  $('saveDialog').showModal();
  $('newName').focus();
}

function renderPicks() {
  $('tabPick').replaceChildren(...picks.map((p, i) => el('li', { class: 'pick-row' }, [
    el('input', {
      type: 'checkbox', checked: p.selected, 'aria-label': `Select ${p.title}`,
      onchange: (e) => { picks[i].selected = e.target.checked; updateCount(); },
    }),
    el('img', { src: faviconUrl(p.url), alt: '', width: 16, height: 16 }),
    el('span', { class: 't', title: p.url }, p.title),
  ])));
  updateCount();
}

function updateCount() {
  const n = picks.filter((p) => p.selected).length;
  $('selCount').textContent = `${n} of ${picks.length} selected`;
  $('confirmSave').disabled = n === 0;
}

async function confirmSave() {
  const chosen = picks.filter((p) => p.selected);
  if (!chosen.length) return;
  const name = $('newName').value.trim().slice(0, 60) || `Collection ${collections.length + 1}`;
  let col = collections.find((c) => c.name.toLowerCase() === name.toLowerCase());
  if (!col) {
    col = { id: uid(), name, created: Date.now(), fav: false, tabs: [] };
    collections.push(col);
  }
  const have = new Set(col.tabs.map((t) => t.url));
  let added = 0;
  for (const p of chosen) {
    if (have.has(p.url)) continue;
    have.add(p.url);
    col.tabs.push({ url: p.url, title: p.title });
    added++;
  }
  await setCollections(collections);
  $('saveDialog').close();

  // Closing tabs happens only after a successful save and an explicit checkbox choice.
  if ($('closeAfter').checked) {
    const ok = !settings.confirmClose || confirm(`Close ${chosen.length} selected tab(s) now?`);
    if (ok) await chrome.tabs.remove(chosen.map((p) => p.tabId));
  }
  render();
  const skipped = chosen.length - added;
  status(`Saved ${added} tab(s) to "${name}"${skipped ? `, ${skipped} already present` : ''}.`);
}

$('openSaveBtn').addEventListener('click', openSave);
$('cancelSave').addEventListener('click', () => $('saveDialog').close());
$('confirmSave').addEventListener('click', confirmSave);
$('selAllTabs').addEventListener('click', () => { picks.forEach((p) => (p.selected = true)); renderPicks(); });
$('selNoneTabs').addEventListener('click', () => { picks.forEach((p) => (p.selected = false)); renderPicks(); });
$('search').addEventListener('input', render);
$('sort').addEventListener('change', render);
$('settingsBtn').addEventListener('click', () => chrome.tabs.create({ url: chrome.runtime.getURL('settings/settings.html') }));

render();

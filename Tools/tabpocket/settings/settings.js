import { getSettings, setSettings, getCollections, setCollections, sanitizeCollection, uid, MAX_IMPORT_BYTES } from '../shared/storage.js';
import { el, applyTheme } from '../shared/utils.js';

const $ = (id) => document.getElementById(id);
const settings = await getSettings();
applyTheme(settings.theme);

$('theme').value = settings.theme;
$('duplicateMode').value = settings.duplicateMode;
$('confirmDelete').checked = settings.confirmDelete;
$('confirmClose').checked = settings.confirmClose;

for (const key of ['theme', 'duplicateMode', 'confirmDelete', 'confirmClose']) {
  $(key).addEventListener('change', async (e) => {
    settings[key] = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    await setSettings(settings);
    if (key === 'theme') applyTheme(settings.theme);
  });
}

function backupStatus(msg) { $('backupStatus').textContent = msg; }

$('exportBtn').addEventListener('click', async () => {
  const collections = await getCollections();
  const data = { format: 'tabpocket', version: 1, exportedAt: new Date().toISOString(), collections };
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const a = el('a', { href: url, download: `tabpocket-backup-${new Date().toISOString().slice(0, 10)}.json` });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  backupStatus(`Exported ${collections.length} collection(s).`);
});

$('importBtn').addEventListener('click', () => $('importFile').click());

$('importFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  try {
    if (file.size > MAX_IMPORT_BYTES) throw new Error('file is larger than 2 MB.');
    const data = JSON.parse(await file.text());
    if (data?.format !== 'tabpocket' || !Array.isArray(data.collections)) throw new Error('this is not a TabPocket backup.');
    const incoming = data.collections.slice(0, 500).map(sanitizeCollection).filter(Boolean);
    const current = await getCollections();
    const ids = new Set(current.map((c) => c.id));
    for (const c of incoming) {
      if (ids.has(c.id)) c.id = uid();
      ids.add(c.id);
    }
    await setCollections([...current, ...incoming]);
    backupStatus(`Imported ${incoming.length} collection(s). Duplicate IDs were regenerated.`);
  } catch (err) {
    backupStatus(`Import failed: ${err.message}`);
  }
});

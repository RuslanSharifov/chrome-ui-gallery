import fs from 'node:fs';
const repo = process.env.GITHUB_REPOSITORY;
const token = process.env.TRAFFIC_TOKEN;
if (!token) throw new Error('Missing TRAFFIC_TOKEN (read-only Administration permission).');
const headers = {Authorization: `Bearer ${token}`, Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'};
async function get(endpoint) {
 const r=await fetch(`https://api.github.com/repos/${repo}/traffic/${endpoint}`,{headers});
 if(!r.ok) throw new Error(`${endpoint}: HTTP ${r.status}: ${await r.text()}`);
 return r.json();
}
const [views,clones]=await Promise.all([get('views'),get('clones')]);
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const metrics=[['Total views',views.count],['Unique visitors',views.uniques],['Clones',clones.count],['Unique cloners',clones.uniques]];
const cards=metrics.map(([name,val],i)=>{const x=24+(i%2)*340,y=75+Math.floor(i/2)*100;return `<rect x="${x}" y="${y}" width="322" height="86" rx="12" fill="#161b22" stroke="#30363d"/><text x="${x+18}" y="${y+28}" fill="#8b949e" font-size="15">${esc(name)}</text><text x="${x+18}" y="${y+64}" fill="#e6edf3" font-size="30" font-weight="700">${Number(val).toLocaleString('en-US')}</text>`;}).join('');
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="730" height="304" viewBox="0 0 730 304" role="img" aria-label="GitHub repository traffic for the last 14 days"><rect width="730" height="304" rx="16" fill="#0d1117"/><text x="24" y="40" fill="#e6edf3" font-family="Arial,sans-serif" font-size="23" font-weight="700">Repository traffic · last 14 days</text><g font-family="Arial,sans-serif">${cards}</g><text x="24" y="292" fill="#8b949e" font-family="Arial,sans-serif" font-size="12">Updated ${new Date().toISOString().slice(0,10)} UTC · GitHub Traffic API</text></svg>`;
fs.mkdirSync('analytics-output',{recursive:true});
fs.writeFileSync('analytics-output/traffic.svg',svg);

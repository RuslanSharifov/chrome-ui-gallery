(()=>{
if(window.__igmsV2)return;window.__igmsV2=true;
performance.setResourceTimingBufferSize?.(2000);

const api=(type,extra={})=>chrome.runtime.sendMessage({type,...extra}).then(r=>{if(!r?.ok)throw Error(r?.error||'Failed');return r.data});

const s={size:'small',manual:false,page:'list',records:[],settings:{},selected:0,pending:null};
let progress={};
const ui={};

const root=document.createElement('div');root.id='igms-root';document.documentElement.append(root);
const shell=document.createElement('div');shell.className='island';root.append(shell);

const goo=document.createElement('div');
goo.innerHTML='<svg width="0" height="0" aria-hidden="true" style="position:absolute"><filter id="igms-goo"><feGaussianBlur in="SourceGraphic" stdDeviation="7" result="b"/><feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" result="g"/><feComposite in="SourceGraphic" in2="g" operator="atop"/></filter></svg>';
root.append(goo);

const el=(tag,cls='',value)=>{const x=document.createElement(tag);x.className=cls;if(value!==undefined)x.textContent=value;return x};
const btn=(label,fn,cls='')=>{const x=el('button',cls,label);x.type='button';x.onclick=fn;return x};
const count=()=>s.records.filter(r=>r.status==='downloading').length;
const videos=()=>s.records.filter(r=>r.kind==='video'&&r.status==='complete');
function size(v,manual=true){s.size=v;s.manual=manual;render()}

function apply(){
  const x=s.settings;
  root.dataset.slime=x.slime!==false;
  const light=x.theme==='light'||(x.theme==='system'&&matchMedia('(prefers-color-scheme: light)').matches);
  root.style.setProperty('--ac',x.accent||'#e86ab6');
  root.style.setProperty('--surface',light&&x.preset==='aurora'?'#f5ecfa':x.surface||'#151326');
  root.style.setProperty('--ink',light&&x.preset==='aurora'?'#241932':x.text||'#fff');
  root.style.setProperty('--alpha',String((x.opacity??86)/100));
  root.style.setProperty('--blur',(x.blur??22)+'px');
  if(x.position){
    root.style.right='auto';root.style.bottom='auto';
    root.style.left=Math.min(innerWidth-60,Math.max(0,x.position.x))+'px';
    root.style.top=Math.min(innerHeight-50,Math.max(0,x.position.y))+'px';
  }
}

async function refresh(){
  try{
    [s.records,s.settings]=await Promise.all([api('IGMS_LIBRARY'),api('IGMS_SETTINGS')]);
    if(!s.manual&&s.size!=='large')s.size=count()?'medium':'small';
    apply();
    // Settings edits echo back as IGMS_UPDATED; rebuilding the page there
    // would reset scroll and kill slider focus, so skip the re-render.
    if(!(s.page==='settings'&&s.size==='large'))render();
    if(count())startPoll();
  }catch(e){console.warn(e)}
}

function drag(handle){
  let start;
  handle.onpointerdown=e=>{
    if(e.button)return;
    const r=root.getBoundingClientRect();
    start={x:e.clientX,y:e.clientY,left:r.left,top:r.top};
    handle.setPointerCapture(e.pointerId);
  };
  handle.onpointermove=e=>{
    if(!start)return;
    root.style.right='auto';root.style.bottom='auto';
    root.style.left=Math.max(0,Math.min(innerWidth-60,start.left+e.clientX-start.x))+'px';
    root.style.top=Math.max(0,Math.min(innerHeight-50,start.top+e.clientY-start.y))+'px';
  };
  handle.onpointerup=async()=>{
    if(!start)return;start=null;
    const r=root.getBoundingClientRect();
    s.settings=await api('IGMS_SET',{value:{position:{x:r.left,y:r.top}}});
  };
}

function header(){
  const h=el('div','head'),grip=el('div','drag');
  grip.append(el('span','logo','↓'),el('span','count',count()?count()+' saving':'Media island'));
  drag(grip);h.append(grip);
  if(s.size!=='small')h.append(btn('⚙',()=>{s.page='settings';size('large')}));
  h.append(btn(s.size==='large'?'−':'⤢',()=>{s.page='list';size(s.size==='large'?'small':'large')}));
  return h;
}

/* ---------- Upload animation (slime + glass) ---------- */
function uploadView(){
  const wrap=el('div','medium');
  const slime=el('div','slime');
  const fill=el('i','fill');
  slime.append(fill);
  [['6%','0s'],['30%','.5s'],['56%','1s'],['80%','1.5s']].forEach(([x,d])=>{
    const b=el('i','blob');b.style.setProperty('--x',x);b.style.setProperty('--d',d);slime.append(b);
  });
  const glass=el('div','up-glass');
  const top=el('div','up-top');
  const title=el('strong','','Saving');
  const pct=el('span','pct','…');
  top.append(title,pct);
  const label=el('small','','');
  glass.append(top,label);
  wrap.append(slime,glass);
  Object.assign(ui,{slime,fill,title,pct,label});
  updateUpload();
  return wrap;
}

function updateUpload(){
  if(!ui.pct?.isConnected)return;
  const live=s.records.filter(r=>r.status==='downloading');
  let got=0,total=0;
  for(const r of live){const p=progress[r.id];if(p){got+=p.received;total+=p.total}}
  const pct=total>0?Math.min(100,Math.round(got/total*100)):null;
  ui.pct.textContent=pct===null?'…':pct+'%';
  ui.title.textContent=live.length>1?live.length+' saving':'Saving';
  ui.label.textContent=live[0]?.label||s.pending||'';
  ui.fill.style.width=(pct===null?38:Math.max(3,pct))+'%';
  ui.slime.classList.toggle('indet',pct===null);
}

let polling=0;
function startPoll(){
  if(polling)return;
  polling=setInterval(async()=>{
    if(!count()){clearInterval(polling);polling=0;progress={};return}
    try{progress=await api('IGMS_PROGRESS');updateUpload()}catch{}
  },400);
}

/* ---------- Large views ---------- */
function field(label,ctrl){const wrap=el('label','field');wrap.append(el('span','',label),ctrl);return wrap}
function change(key,val){api('IGMS_SET',{value:{[key]:val}}).then(x=>{s.settings=x;apply()}).catch(console.warn)}

function settings(body){
  body.append(btn('← Back',()=>{s.page='list';render()},'back'),el('div','title','Island settings'));

  const folder=el('input');folder.value=s.settings.folder||'Instagram_Media_Saver';folder.onchange=()=>change('folder',folder.value);
  body.append(field('Downloads subfolder',folder),el('div','muted','Saved under Downloads. Arbitrary system folders cannot be selected automatically.'));
  body.append(btn('Open downloads folder',()=>api('IGMS_FOLDER'),'secondary'));

  const theme=el('select');
  for(const v of ['system','light','dark']){const option=el('option','',v);option.value=v;theme.append(option)}
  theme.value=s.settings.theme||'system';theme.onchange=()=>change('theme',theme.value);
  body.append(field('Appearance',theme));

  const palette=el('div','swatches');
  for(const [name,a,b,t] of [['Aurora','#e86ab6','#151326','#ffffff'],['Ocean','#50aefa','#10243b','#ffffff'],['Mint','#9bdc67','#1b2922','#ffffff'],['Pearl','#8b6cce','#f4eefc','#221931']]){
    const sw=btn('',()=>api('IGMS_SET',{value:{preset:name,accent:a,surface:b,text:t}}).then(x=>{s.settings=x;apply();render()}));
    sw.title=name;sw.style.background=a;palette.append(sw);
  }
  body.append(field('Presets',palette));

  for(const [key,title] of [['accent','Accent'],['surface','Surface'],['text','Text']]){
    const input=el('input');input.type='color';input.value=s.settings[key]||'#ffffff';input.oninput=()=>change(key,input.value);
    body.append(field(title,input));
  }
  for(const [key,title,min,max] of [['opacity','Transparency',25,100],['blur','Glass blur',0,50]]){
    const input=el('input');input.type='range';input.min=min;input.max=max;input.value=s.settings[key]??max;input.oninput=()=>change(key,+input.value);
    body.append(field(title,input));
  }
  for(const [key,title] of [['slime','Slime animation'],['contextMenu','Right-click download menu']]){
    const input=el('input');input.type='checkbox';input.checked=s.settings[key]!==false;input.onchange=()=>change(key,input.checked);
    body.append(field(title,input));
  }
  body.append(btn('Reset position',()=>{
    root.style.left='auto';root.style.top='auto';root.style.right='23px';root.style.bottom='23px';change('position',null);
  },'secondary'));
}

function next(n){const items=videos();if(!items.length)return;s.selected=(s.selected+n+items.length)%items.length;render()}

function player(body){
  body.append(btn('← Back',()=>{s.page='list';render()},'back'));
  const items=videos(),r=items[s.selected];
  if(!r){body.append(el('div','empty','No finished videos'));return}
  body.append(el('div','title',r.label));
  const vid=el('video');vid.src=r.url;vid.controls=false;vid.playsInline=true;vid.preload='metadata';
  body.append(vid);
  vid.onerror=()=>body.append(el('div','muted','Preview unavailable. The signed media URL may have expired; open the saved file instead.'));
  const ctr=el('div','ctrl'),vol=el('input');
  vol.type='range';vol.min=0;vol.max=1;vol.step=.05;vol.value=1;vol.setAttribute('aria-label','Volume');
  vol.oninput=()=>vid.volume=Number(vol.value);
  ctr.append(
    btn('⏮',()=>next(-1)),
    btn('▶ / ❚❚',()=>vid.paused?vid.play().catch(()=>{}):vid.pause()),
    btn('⏭',()=>next(1)),
    vol
  );
  body.append(ctr);
}

function listing(body){
  const row=el('div','line'),input=el('input');
  input.placeholder='Paste Instagram link';input.setAttribute('aria-label','Instagram media URL');
  row.append(input,btn('Go',()=>paste(input.value),'primary'));
  body.append(row,btn('Open downloads folder',()=>api('IGMS_FOLDER'),'secondary'),el('div','title','Download library · '+s.records.length));
  if(!s.records.length)body.append(el('div','empty','Downloads will appear here'));

  for(const entry of [...s.records].reverse()){
    const line=el('div','entry');
    const img=entry.poster?el('img','thumb'):el('div','thumb');
    if(entry.poster){img.src=entry.poster;img.referrerPolicy='no-referrer'}
    const info=el('div','entry-text');
    info.append(el('strong','',entry.label),el('small','',entry.note?`${entry.status} · ${entry.note}`:entry.status));
    line.append(img,info);
    if(entry.kind==='video'&&entry.status==='complete'){
      const play=btn('▶',()=>{s.selected=videos().findIndex(v=>v.id===entry.id);s.page='player';render()});
      play.title='Play preview';line.append(play);img.onclick=play.onclick;
    }
    if(entry.status==='complete')line.append(btn('↗',()=>api('IGMS_SHOW',{id:entry.id})));
    const remove=btn('×',async()=>{await api('IGMS_FORGET',{id:entry.id});refresh()});
    remove.title='Remove from library only';line.append(remove);
    body.append(line);
  }
}

function render(){
  root.dataset.size=s.size;
  const keep=shell.querySelector('.body')?.scrollTop||0;
  shell.replaceChildren(header());
  if(s.size==='medium'){shell.append(uploadView());return}
  if(s.size==='small')return;
  const body=el('div','body');shell.append(body);
  if(s.page==='settings')settings(body);
  else if(s.page==='player')player(body);
  else listing(body);
  body.scrollTop=keep;
  requestAnimationFrame(()=>{body.scrollTop=keep});
}

/* ---------- Downloading ---------- */
async function download(m,label){
  s.manual=false;s.size='medium';s.page='list';s.pending=label;
  render();
  try{
    await api('IGMS_START',{...m,label});
    s.pending=null;
    await refresh();
    startPoll();
  }catch(e){
    s.pending=null;
    await refresh();
    alert('Media Saver: '+e.message);
  }
}

function paste(url){
  let u;
  try{u=new URL(url)}catch{alert('Invalid URL');return}
  if(!['instagram.com','www.instagram.com'].includes(u.hostname)){alert('Only Instagram links are supported');return}
  if(/\/(p|reel|stories)\//.test(u.pathname)){
    window.open(u.href,'_blank','noopener');
    alert('Opened Instagram media page. Right-click the visible video to download.');
    return;
  }
  download({url:u.href,kind:/\.jpe?g(?:\?|$)/i.test(u.href)?'image':'video'},'pasted_media');
}

/* ---------- Media detection ---------- */
const big=x=>{
  if(root.contains(x)||!x.getClientRects().length)return false;
  const r=x.getBoundingClientRect();
  return r.width>=120&&r.height>=80;
};
const mediaTarget=x=>big(x)&&(x.tagName==='VIDEO'||x.naturalWidth>=300);

const CDN=/(^|\.)(cdninstagram\.com|fbcdn\.net)$/;
const pathOf=u=>{try{return new URL(u).pathname}catch{return ''}};
const hostOk=u=>{try{return CDN.test(new URL(u).hostname)}catch{return false}};
const VIDEO_PATH=/\.(mp4|m4v)$/i, IMAGE_PATH=/\.(jpe?g|webp|png)$/i;

function cdnEntries(kind){
  const want=kind==='video'?VIDEO_PATH:IMAGE_PATH;
  return performance.getEntriesByType('resource').filter(e=>hostOk(e.name)&&want.test(pathOf(e.name)));
}
function cdnFromPerf(kind){
  const list=cdnEntries(kind).sort((a,b)=>b.startTime-a.startTime);
  return list[0]?.name||'';
}

function mediaFrom(m){
  const kind=m.tagName==='VIDEO'?'video':'image';
  let url=m.currentSrc||m.src||m.querySelector?.('source')?.src||'';
  if(!url||url.startsWith('blob:'))url=cdnFromPerf(kind);
  if(!url||!hostOk(url))return null;
  return kind==='video'
    ?{url,kind,poster:m.poster||''}
    :{url,kind,poster:m.currentSrc||m.src||url};
}

/* Video fragments of the same asset plus the nearest other CDN mp4s (audio
   tracks are often separate streams). Ordered: same asset first, then by time. */
function stitchSources(hit){
  const primary=mediaFrom(hit)?.url;
  if(!primary)return null;
  const pPath=pathOf(primary);
  const NOT_MEDIA=/\.(jpe?g|png|webp|gif|js|css|json|woff2?)$/i;
  const MEDIA_INIT=['video','audio','media','xmlhttprequest','fetch','other'];
  const all=performance.getEntriesByType('resource')
    .filter(e=>hostOk(e.name)&&MEDIA_INIT.includes(e.initiatorType)&&!NOT_MEDIA.test(pathOf(e.name)));
  const byName=new Map(all.map(e=>[e.name,e]));
  const self=byName.get(primary)||all.at(-1);
  const t0=self?self.startTime:0;
  const urls=[...byName.values()]
    .filter(e=>pathOf(e.name)===pPath||Math.abs(e.startTime-t0)<=90000)
    .sort((a,b)=>((pathOf(a.name)===pPath?0:1)-(pathOf(b.name)===pPath?0:1))||(Math.abs(a.startTime-t0)-Math.abs(b.startTime-t0)))
    .map(e=>e.name);
  return {primary,urls};
}

const RESERVED=new Set(['p','reel','reels','explore','stories','direct','accounts','tv','web','about']);
const userOk=u=>!!u&&!RESERVED.has(u)&&/^[A-Za-z0-9._]+$/.test(u);
function ownerFrom(scope){
  const story=location.pathname.match(/^\/stories\/([^/]+)/);
  if(story&&userOk(story[1]))return story[1];
  const pick=sel=>{
    for(const a of scope?.querySelectorAll(sel)||[]){
      const m=(a.getAttribute('href')||'').match(/^\/([^/?#]+)\/?$/);
      if(m&&userOk(m[1]))return m[1];
    }
    return '';
  };
  const seg=location.pathname.split('/').filter(Boolean)[0]||'';
  return pick('header a[href]')||pick('a[href]')||(userOk(seg)?seg:'')||'instagram';
}
const ownerLabel=m=>'@'+ownerFrom(m.closest('article,[role="dialog"]'));

/* The element must know the whole length and have it buffered before we start */
function bufferedOk(v){
  if(!(v.duration>0&&isFinite(v.duration)))return false;
  for(let i=0;i<v.buffered.length;i++){
    if(v.buffered.start(i)<=0.5&&v.buffered.end(i)>=v.duration-0.6)return true;
  }
  return false;
}
async function waitReady(v,timeoutMs=15000){
  const t0=Date.now();
  while(!bufferedOk(v)&&Date.now()-t0<timeoutMs){
    await new Promise(r=>setTimeout(r,500));
  }
  return bufferedOk(v);
}

async function downloadVideo(hit,label){
  const src=stitchSources(hit);
  if(!src){alert('Media stream not ready yet. Let the video play for a moment, then right-click again.');return}
  s.manual=false;s.size='medium';s.page='list';s.pending='Yoxlanılır…';
  render();
  await waitReady(hit);
  s.pending=label;
  try{
    const duration=Number.isFinite(hit.duration)?hit.duration:0;
    await api('IGMS_STITCH',{primary:src.primary,urls:src.urls,label,duration,poster:mediaFrom(hit)?.poster||''});
    s.pending=null;
    await refresh();
    startPoll();
  }catch(e){
    s.pending=null;
    await refresh();
    alert('Media Saver: '+e.message);
  }
}

function downloadFromEl(hit){
  if(hit.tagName==='VIDEO')return downloadVideo(hit,ownerLabel(hit));
  const media=mediaFrom(hit);
  if(!media){alert('No accessible media found');return}
  download(media,ownerLabel(hit));
}

/* ---------- Right-click popup ---------- */
let menu=null;
const closeMenu=()=>{menu?.remove();menu=null};
function openMenu(hit,x,y){
  const isVideo=hit.tagName==='VIDEO';
  if(!isVideo&&!mediaFrom(hit))return;
  closeMenu();
  menu=el('div','igms-context');
  const head=el('div','ctx-head');
  head.append(
    el('span','ctx-badge',isVideo?'VIDEO':'FOTO'),
    el('strong','ctx-owner',ownerLabel(hit)),
    btn('×',closeMenu,'ctx-close')
  );
  const go=btn(isVideo?'↓ Videonu yüklə':'↓ Şəkli yüklə',()=>{closeMenu();downloadFromEl(hit)},'ctx-primary');
  menu.append(head,go);
  document.documentElement.append(menu);
  const w=menu.offsetWidth,h=menu.offsetHeight;
  menu.style.left=Math.max(8,Math.min(x,innerWidth-w-8))+'px';
  menu.style.top=Math.max(8,Math.min(y,innerHeight-h-8))+'px';
}
/* Stories and reels put transparent overlay layers above the <video>, so the
   click target is usually a div. Walk the stack under the cursor instead. */
function mediaAt(x,y){
  for(const n of document.elementsFromPoint(x,y)){
    if(root.contains(n))continue;
    if(n.matches?.('video,img')&&mediaTarget(n))return n;
  }
  for(const v of document.querySelectorAll('video')){
    const r=v.getBoundingClientRect();
    if(x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom&&mediaTarget(v))return v;
  }
  return null;
}
document.addEventListener('contextmenu',e=>{
  if(s.settings.contextMenu===false)return;
  const hit=mediaAt(e.clientX,e.clientY);
  if(!hit)return;
  e.preventDefault();
  openMenu(hit,e.clientX,e.clientY);
},true);
document.addEventListener('pointerdown',e=>{if(menu&&!menu.contains(e.target))closeMenu()},true);

matchMedia('(prefers-color-scheme: light)').addEventListener('change',apply);

/* While an element is fullscreen, only its subtree is visible: move our UI into it */
function keepOnTop(){
  const host=document.fullscreenElement||document.documentElement;
  for(const n of [root,menu].filter(Boolean)) if(n.parentElement!==host) host.append(n);
}
document.addEventListener('fullscreenchange',keepOnTop);
chrome.runtime.onMessage.addListener(m=>{if(m.type==='IGMS_UPDATED')refresh()});

refresh();
})();

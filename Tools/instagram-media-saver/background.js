const LIB='igms-library-v2',SET='igms-settings-v2';
const defaults={folder:'Instagram_Media_Saver',theme:'system',preset:'aurora',accent:'#e86ab6',surface:'#151326',text:'#ffffff',opacity:86,blur:22,slime:true,position:null,contextMenu:true};
const jobs=new Map(); // live progress for fragment-assembly jobs

const allowed=s=>{
  try{
    const u=new URL(s);
    return u.protocol==='https:'&&['instagram.com','cdninstagram.com','fbcdn.net'].some(h=>u.hostname===h||u.hostname.endsWith('.'+h));
  }catch{return false}
};
const clean=s=>String(s||'media').replace(/[^\w@.-]/g,'_').slice(0,64)||'media';
const folder=s=>String(s||'Instagram_Media_Saver').replace(/\\/g,'/').split('/').filter(x=>x&&x!=='.'&&x!=='..').slice(0,4).map(clean).join('/');
const pad=n=>String(n).padStart(2,'0');
const stampNow=()=>{const d=new Date();return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`};

async function getSettings(){return {...defaults,...(await chrome.storage.local.get(SET))[SET]}}
async function getLibrary(){return (await chrome.storage.local.get(LIB))[LIB]||[]}
async function saveLibrary(list){await chrome.storage.local.set({[LIB]:list})}
async function notify(){
  const tabs=await chrome.tabs.query({url:'https://www.instagram.com/*'});
  await Promise.all(tabs.map(t=>chrome.tabs.sendMessage(t.id,{type:'IGMS_UPDATED'}).catch(()=>{})));
}

async function getProgress(){
  const out={};
  for(const r of await getLibrary()){
    if(r.status!=='downloading')continue;
    if(typeof r.id==='string'){const j=jobs.get(r.id);if(j)out[r.id]=j;continue}
    const [d]=await chrome.downloads.search({id:r.id});
    if(d)out[r.id]={received:d.bytesReceived||0,total:d.totalBytes||0};
  }
  return out;
}

async function ensureOffscreen(){
  if(await chrome.offscreen.hasDocument())return;
  await chrome.offscreen.createDocument({url:'offscreen.html',reasons:['BLOBS'],justification:'Join fragmented video segments into one playable MP4'});
}

async function bindRecord(jobId,dlId,note){
  const records=await getLibrary();
  const r=records.find(x=>x.id===jobId);
  jobs.delete(jobId);
  if(r){
    r.id=dlId;
    if(note)r.note=note;
    // the download may already have finished before we re-bound the id
    const [d]=await chrome.downloads.search({id:dlId});
    if(d&&['complete','interrupted'].includes(d.state))r.status=d.state==='complete'?'complete':'error';
    await saveLibrary(records);
  }
  await notify();
}

async function failRecord(jobId,msg){
  const records=await getLibrary();
  const r=records.find(x=>x.id===jobId);
  jobs.delete(jobId);
  if(r){r.status='error';r.error=msg;await saveLibrary(records)}
  await notify();
}

async function stitchJob(jobId,job,filename){
  await ensureOffscreen();
  jobs.set(jobId,{received:0,total:job.urls.length});
  const res=await chrome.runtime.sendMessage({type:'OFFSCREEN_STITCH',jobId,primary:job.primary,urls:job.urls,duration:job.duration});
  if(!res?.ok)throw Error(res?.error||'Assembly failed');
  const dlId=await chrome.downloads.download({url:res.blobUrl,filename,saveAs:false,conflictAction:'uniquify'});
  const note=res.audio?'':`no audio stream found (${res.stats?.fetched??0}/${res.stats?.parts??0} parts)`;
  await bindRecord(jobId,dlId,note);
}

chrome.runtime.onMessage.addListener((m,sender,reply)=>{
  if(m.type==='STITCH_PROGRESS'){jobs.set(m.jobId,{received:m.received,total:m.total});return false}
  (async()=>{
    if(m.type==='IGMS_SETTINGS')return getSettings();
    if(m.type==='IGMS_LIBRARY')return getLibrary();
    if(m.type==='IGMS_PROGRESS')return getProgress();

    if(m.type==='IGMS_SET'){
      const next={...await getSettings(),...m.value};
      next.folder=folder(next.folder);
      next.opacity=Math.min(100,Math.max(25,Number(next.opacity)||86));
      next.blur=Math.min(50,Math.max(0,Number(next.blur)||22));
      await chrome.storage.local.set({[SET]:next});
      await notify();
      return next;
    }

    if(m.type==='IGMS_FORGET'){
      await saveLibrary((await getLibrary()).filter(x=>x.id!==m.id));
      await notify();
      return true;
    }

    if(m.type==='IGMS_SHOW'){await chrome.downloads.show(m.id);return true}
    if(m.type==='IGMS_FOLDER'){await chrome.downloads.showDefaultFolder();return true}

    if(m.type==='IGMS_START'){
      if(!allowed(m.url))throw Error('No accessible Instagram media URL');
      const ext=m.kind==='image'?'jpg':'mp4';
      const filename=folder((await getSettings()).folder)+'/'+clean(m.label)+'_'+stampNow()+'.'+ext;
      const id=await chrome.downloads.download({url:m.url,filename,saveAs:false,conflictAction:'uniquify'});
      const records=await getLibrary();
      records.push({id,url:m.url,filename,kind:m.kind||'video',poster:m.poster||'',label:m.label||'media',status:'downloading',created:Date.now()});
      await saveLibrary(records.slice(-150));
      await notify();
      return {id};
    }

    if(m.type==='IGMS_STITCH'){
      const primary=m.primary;
      if(!allowed(primary))throw Error('No accessible Instagram media URL');
      const urls=[primary,...(m.urls||[])].filter((u,i,arr)=>allowed(u)&&arr.indexOf(u)===i).slice(0,80);
      const jobId='job-'+Date.now()+'-'+Math.random().toString(36).slice(2,7);
      const filename=folder((await getSettings()).folder)+'/'+clean(m.label)+'_'+stampNow()+'.mp4';
      const records=await getLibrary();
      records.push({id:jobId,url:primary,filename,kind:'video',poster:m.poster||'',label:m.label||'@instagram',status:'downloading',created:Date.now()});
      await saveLibrary(records.slice(-150));
      jobs.set(jobId,{received:0,total:urls.length});
      await notify();
      stitchJob(jobId,{primary,urls,duration:m.duration||0},filename).catch(e=>failRecord(jobId,e.message));
      return {id:jobId};
    }

    throw Error('Unsupported command');
  })().then(data=>reply({ok:true,data})).catch(e=>reply({ok:false,error:e.message}));
  return true;
});

chrome.downloads.onChanged.addListener(async d=>{
  if(!d.state||!['complete','interrupted'].includes(d.state.current))return;
  const records=await getLibrary(),item=records.find(x=>x.id===d.id);
  if(!item)return;
  item.status=d.state.current==='complete'?'complete':'error';
  item.error=d.error?.current||'';
  await saveLibrary(records);
  await notify();
});

chrome.runtime.onInstalled.addListener(async()=>{
  const r=await chrome.storage.local.get(SET);
  if(!r[SET])await chrome.storage.local.set({[SET]:defaults});
});

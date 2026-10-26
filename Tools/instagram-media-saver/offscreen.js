/* Extension page: host permissions let it fetch the Instagram CDN without CORS,
   and it can create blob: URLs (service workers cannot). */

// One fragment at a time, retried on transient errors. 403/404 means the signed
// URL has expired or the piece is gone, so retrying would not help.
async function fetchPart(url,tries=3){
  for(let attempt=1;attempt<=tries;attempt++){
    try{
      const r=await fetch(url);
      if(r.ok)return new Uint8Array(await r.arrayBuffer());
      if(r.status===403||r.status===404)return null;
    }catch{}
    await new Promise(res=>setTimeout(res,500*attempt));
  }
  return null;
}

async function stitch(jobId,primary,urls,duration){
  const fetched=new Map();
  for(let i=0;i<urls.length;i++){
    const data=await fetchPart(urls[i]);
    if(data)fetched.set(urls[i],data);
    chrome.runtime.sendMessage({type:'STITCH_PROGRESS',jobId,received:i+1,total:urls.length}).catch(()=>{});
  }
  const out=IGMSMux.assemble(primary,fetched,urls,{duration});
  const blobUrl=URL.createObjectURL(out.blob);
  setTimeout(()=>URL.revokeObjectURL(blobUrl),10*60*1000);
  return {blobUrl,size:out.blob.size,audio:out.hasAudio,stats:out.stats};
}

chrome.runtime.onMessage.addListener((m,sender,reply)=>{
  if(m.type!=='OFFSCREEN_STITCH')return;
  stitch(m.jobId,m.primary,m.urls,m.duration)
    .then(r=>reply({ok:true,...r}))
    .catch(e=>reply({ok:false,error:e.message}));
  return true;
});

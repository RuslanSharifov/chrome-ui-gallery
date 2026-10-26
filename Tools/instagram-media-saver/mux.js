/* MP4 fragment assembler.
   Joins DASH fragments of one video track (and its audio track, when that is a
   separate stream) into one playable fragmented MP4.
   - the video asset is chosen by matching its media length to the element's duration
   - the audio stream must end at the same time as the chosen video
   - fragments are ordered by media time (tfdt) and start at a keyframe */
(function(){
'use strict';

const dv=u=>new DataView(u.buffer,u.byteOffset,u.byteLength);
const str=(u,o,n)=>String.fromCharCode(...u.subarray(o,o+n));
const u32=(u,o)=>dv(u).getUint32(o);
const put32=(u,o,v)=>dv(u).setUint32(o,v>>>0);
const flags24=(u,b)=>(u[b.body+1]<<16)|(u[b.body+2]<<8)|u[b.body+3];
const be=n=>{const b=new Uint8Array(4);put32(b,0,n);return b};
const pathOf=url=>{try{return new URL(url).pathname}catch{return ''}};

function boxes(u,start=0,end=u.length){
  const out=[];let o=start;
  while(o+8<=end){
    let size=u32(u,o);const type=str(u,o+4,4);let hdr=8;
    if(size===1){size=Number(dv(u).getBigUint64(o+8));hdr=16}
    else if(size===0)size=end-o;
    if(size<hdr||o+size>end)break;
    out.push({type,start:o,size,body:o+hdr,end:o+size});
    o+=size;
  }
  return out;
}
const kids=(u,b)=>boxes(u,b.body,b.end);
const kid=(u,b,t)=>kids(u,b).find(x=>x.type===t)||null;

function mk(type,parts){
  const len=parts.reduce((n,p)=>n+p.length,8);
  const out=new Uint8Array(len);
  put32(out,0,len);
  for(let i=0;i<4;i++)out[4+i]=type.charCodeAt(i);
  let o=8;
  for(const p of parts){out.set(p,o);o+=p.length}
  return out;
}

/* ---- init segment (moov) ---- */
function parseInit(u,url,path){
  const top=boxes(u);
  const moov=top.find(b=>b.type==='moov');
  if(!moov)return null;
  const ftyp=top.find(b=>b.type==='ftyp');
  const tracks=kids(u,moov).filter(b=>b.type==='trak').map(trak=>{
    const tkhd=kid(u,trak,'tkhd'),mdia=kid(u,trak,'mdia');
    if(!tkhd||!mdia)return null;
    const mdhd=kid(u,mdia,'mdhd'),hdlr=kid(u,mdia,'hdlr');
    if(!mdhd||!hdlr)return null;
    return {
      trackId:u32(u,tkhd.body+(u[tkhd.body]===1?20:12)),
      handler:str(u,hdlr.body+8,4),
      timescale:u32(u,mdhd.body+(u[mdhd.body]===1?20:12)),
      bytes:u.slice(trak.start,trak.end)
    };
  }).filter(Boolean);
  const mvex=kid(u,moov,'mvex');
  const trex=mvex?kids(u,mvex).filter(b=>b.type==='trex').map(t=>({
    trackId:u32(u,t.body+4),defFlags:u32(u,t.body+20),bytes:u.slice(t.start,t.end)
  })):[];
  const mvhd=kid(u,moov,'mvhd');
  return {
    url,path,
    ftyp:ftyp?u.slice(ftyp.start,ftyp.end):null,
    mvhd:mvhd?u.slice(mvhd.start,mvhd.end):null,
    tracks,trex
  };
}

/* ---- media fragments (moof + mdat) ---- */
function parsePieces(u,url,path){
  const out=[],top=boxes(u);
  for(let i=0;i<top.length;i++){
    const m=top[i];
    if(m.type!=='moof')continue;
    const md=top[i+1];
    if(!md||md.type!=='mdat')continue;
    const P=u.slice(m.start,md.end);
    const pm=boxes(P,0,P.length)[0];
    const traf=kid(P,pm,'traf');
    const tfhd=traf&&kid(P,traf,'tfhd');
    if(!tfhd)continue;
    const tfdt=kid(P,traf,'tfdt'),trun=kid(P,traf,'trun');
    const tf=flags24(P,tfhd);
    const trackId=u32(P,tfhd.body+4);
    let p=tfhd.body+8;
    if(tf&1)p+=8;
    if(tf&2)p+=4;
    if(tf&8)p+=4;
    if(tf&0x10)p+=4;
    const defFlags=(tf&0x20)?u32(P,p):null;
    const base=tfdt?(P[tfdt.body]===1?Number(dv(P).getBigUint64(tfdt.body+4)):u32(P,tfdt.body+4)):0;
    let first=null;
    if(trun){
      const tr=flags24(P,trun),count=u32(P,trun.body+4);
      let q=trun.body+8;
      if(tr&1)q+=4;
      if(tr&4){first=u32(P,q)}
      else if((tr&0x400)&&count){first=u32(P,q+((tr&0x100)?4:0)+((tr&0x200)?4:0))}
    }
    if(first===null)first=defFlags;
    out.push({
      url,path,trackId,bytes:P,base,
      sync:first===null?null:((first&0x10000)===0),
      usable:!(tf&1)
    });
  }
  return out;
}

/* ---- helpers that edit copies in place ---- */
function setTrackId(bytes,id){
  const c=bytes.slice();
  const trak=boxes(c)[0];
  const tkhd=kid(c,trak,'tkhd');
  put32(c,tkhd.body+(c[tkhd.body]===1?20:12),id);
  return c;
}
function setNextTrackId(mvhd,next){
  const c=mvhd.slice();
  put32(c,8+(c[8]===1?108:96),next);
  return c;
}
function trexFor(init,origId,newId){
  const t=init.trex.find(x=>x.trackId===origId);
  if(!t)return mk('trex',[new Uint8Array(4),be(newId),be(1),be(0),be(0),be(0)]);
  const c=t.bytes.slice();
  put32(c,8+4,newId);
  return c;
}
function setFragTrack(bytes,id){
  const pm=boxes(bytes)[0];
  const traf=kid(bytes,pm,'traf');
  const tfhd=kid(bytes,traf,'tfhd');
  put32(bytes,tfhd.body+4,id);
}
function setSeq(bytes,n){
  const pm=boxes(bytes)[0];
  const mfhd=kid(bytes,pm,'mfhd');
  if(mfhd)put32(bytes,mfhd.body+4,n);
}
const dedupe=arr=>{
  const seen=new Set();
  return arr.filter(p=>{const k=p.trackId+':'+p.base;if(seen.has(k))return false;seen.add(k);return true});
};

/* ---- assembly ---- */
function assemble(primary,fetched,urls,opts={}){
  const duration=Number.isFinite(opts.duration)&&opts.duration>0?opts.duration:0;
  const pPath=pathOf(primary);
  const inits=[],pieces=[];
  for(const url of urls){
    const u=fetched.get(url);
    if(!u)continue;
    const path=pathOf(url);
    const init=parseInit(u,url,path);
    if(init)inits.push(init);
    pieces.push(...parsePieces(u,url,path));
  }

  const tsOf=(path,trackId)=>{
    for(const i of inits){
      if(i.path!==path)continue;
      const t=i.tracks.find(x=>x.trackId===trackId);
      if(t)return t.timescale;
    }
    return 90000;
  };
  // fragments of one track of one asset, and the media time they reach
  const stats=(path,trackId)=>{
    const ps=dedupe(pieces.filter(p=>p.path===path&&p.trackId===trackId&&p.usable));
    const ts=tsOf(path,trackId);
    const last=ps.reduce((m,p)=>Math.max(m,p.base/ts),0);
    return {ps,ts,last};
  };

  // 1) video: the asset whose length matches the element's duration
  const vCands=inits.flatMap((init,idx)=>init.tracks.filter(t=>t.handler==='vide').map(track=>({init,track,idx})))
    .map(c=>({...c,...stats(c.init.path,c.track.trackId)}))
    .filter(c=>c.ps.length>0);

  if(!vCands.length){
    // progressive (non-fragmented) file: the complete MP4 is already usable
    const whole=[fetched.get(primary),...urls.map(u=>fetched.get(u))].find(u=>u&&boxes(u).some(b=>b.type==='moov')&&boxes(u).some(b=>b.type==='mdat')&&!boxes(u).some(b=>b.type==='moof'));
    if(whole){
      const hasAudio=!!parseInit(whole,'',pPath)?.tracks.some(t=>t.handler==='soun');
      return {blob:new Blob([whole],{type:'video/mp4'}),hasAudio,stats:{parts:urls.length,fetched:fetched.size}};
    }
    throw new Error('No video fragments were captured.');
  }

  vCands.sort((a,b)=>{
    const sa=(duration?Math.abs(a.last-duration):0)+(a.init.path===pPath?0:1);
    const sb=(duration?Math.abs(b.last-duration):0)+(b.init.path===pPath?0:1);
    return (sa-sb)||(a.idx-b.idx);
  });
  const best=vCands[0];
  if(duration&&Math.abs(best.last-duration)>8)
    throw new Error('Could not match this video to its stream (length differs). Let it play, then try again.');

  const vInit=best.init,vTrack=best.track;

  // 2) audio: muxed in the same init, or a separate stream ending at the same time
  let aInit=null,aTrack=null,aPieces=[];
  const muxedSound=vInit.tracks.find(t=>t.handler==='soun');
  if(muxedSound){
    const s=stats(vInit.path,muxedSound.trackId);
    if(s.ps.length){aInit=vInit;aTrack=muxedSound;aPieces=s.ps}
  }else{
    const aCands=inits.flatMap(init=>init.tracks.filter(t=>t.handler==='soun').map(track=>({init,track})))
      .map(c=>({...c,...stats(c.init.path,c.track.trackId)}))
      .filter(c=>c.ps.length>0&&Math.abs(c.last-best.last)<=5)
      .sort((a,b)=>Math.abs(a.last-best.last)-Math.abs(b.last-best.last));
    if(aCands.length){aInit=aCands[0].init;aTrack=aCands[0].track;aPieces=aCands[0].ps}
  }

  // 3) order by media time, start at the first keyframe
  const timed=(arr,ts)=>arr.map(p=>({...p,t:p.base/ts})).sort((a,b)=>a.t-b.t);
  let V=timed(dedupe(best.ps),best.ts);
  const vDefault=vInit.trex.find(x=>x.trackId===vTrack.trackId)?.defFlags;
  V=V.map(p=>({...p,sync:p.sync!==null?p.sync:(vDefault===undefined?true:((vDefault&0x10000)===0))}));
  const firstKey=V.findIndex(p=>p.sync);
  if(firstKey<0)throw new Error('No keyframe in captured video fragments.');
  V=V.slice(firstKey);
  const startT=V[0].t;
  let A=aTrack?timed(dedupe(aPieces),tsOf(aInit.path,aTrack.trackId)).filter(p=>p.t>=startT-0.001):[];

  // 3b) completeness and a clean end: the file must reach the element's length,
  //     and nothing after that length (or after the video ends) is kept
  if(duration&&best.last<duration-2.5)
    throw new Error(`Incomplete video: captured ${best.last.toFixed(1)}s of ${duration.toFixed(1)}s. Play it to the end, then try again.`);
  const limit=duration||Infinity;
  V=V.filter(p=>p.t<limit);
  if(!V.length)throw new Error('No video fragments inside the video length.');
  const lastVt=V[V.length-1].t;
  A=A.filter(p=>p.t<limit&&p.t<=lastVt+2.5);

  // 4) moov: video = track 1, audio = track 2
  if(!vInit.mvhd||!vInit.ftyp)throw new Error('Video header is incomplete.');
  const trakParts=[setTrackId(vTrack.bytes,1)];
  const trexParts=[trexFor(vInit,vTrack.trackId,1)];
  if(aTrack){
    trakParts.push(setTrackId(aTrack.bytes,2));
    trexParts.push(trexFor(aInit,aTrack.trackId,2));
  }
  const moov=mk('moov',[
    setNextTrackId(vInit.mvhd,aTrack?3:2),
    ...trakParts,
    mk('mvex',trexParts)
  ]);

  const list=[
    ...V.map(p=>({...p,newId:1})),
    ...A.map(p=>({...p,newId:2}))
  ].sort((a,b)=>(a.t-b.t)||(a.newId-b.newId));

  const out=[vInit.ftyp,moov];
  list.forEach((p,i)=>{
    setFragTrack(p.bytes,p.newId);
    setSeq(p.bytes,i+1);
    out.push(p.bytes);
  });
  return {
    blob:new Blob(out,{type:'video/mp4'}),
    hasAudio:!!aTrack,
    stats:{parts:urls.length,fetched:fetched.size,video:V.length,audio:A.length,videoLast:+best.last.toFixed(2),duration:+duration.toFixed(2)}
  };
}

const api={assemble,_parseInit:parseInit,_parsePieces:parsePieces,_boxes:boxes};
if(typeof module!=='undefined')module.exports=api;
else self.IGMSMux=api;
})();

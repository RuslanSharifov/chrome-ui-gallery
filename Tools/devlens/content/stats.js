/* DevLens floating network analytics — local, bounded, no external dependencies. */
(function(){
'use strict';
if(window.__devlens_stats_mounted__)return;
window.__devlens_stats_mounted__=true;
const boards=new Map();
const series=[];const LIMIT=90;let seq=0;
const charts=['area','line','bars','dots'];
function sample(){
 const entries=(window.__devlens_events__||[]).filter(e=>e.category==='network'&&e.phase!=='start');
 const now=Date.now();
 return {time:now,total:entries.length,ok:entries.filter(e=>e.ok).length,errors:entries.filter(e=>e.ok===false).length,avg:entries.filter(e=>Number.isFinite(e.duration)).reduce((a,e,_,arr)=>a+e.duration/arr.length,0),recent:entries.filter(e=>now-e.time<10000).length};
}
function record(){series.push(sample());if(series.length>LIMIT)series.shift();for(const board of boards.values())draw(board)}
function clamp(value,lo,hi){return Math.max(lo,Math.min(hi,value))}
function position(board){
 const r=board.el.getBoundingClientRect();
 let x,y;
 if(board.linked){
  const hud=document.getElementById('__devlens_hud__');
  if(!hud){board.el.style.display='none';return}
  board.el.style.display='';
  const h=hud.getBoundingClientRect();
  x=h.right+12;y=h.top+(board.slot*24);
  if(x+board.el.offsetWidth>innerWidth-8)x=h.left-board.el.offsetWidth-12;
  if(x<8)x=8;
 }else{x=board.x??r.left;y=board.y??r.top}
 x=clamp(x,8,Math.max(8,innerWidth-board.el.offsetWidth-8));
 y=clamp(y,8,Math.max(8,innerHeight-board.el.offsetHeight-8));
 board.el.style.left=x+'px';board.el.style.top=y+'px';
 if(!board.linked){board.x=x;board.y=y}
}
function path(ctx,vals,w,h,fill){
 const max=Math.max(1,...vals);const step=w/Math.max(1,vals.length-1);
 ctx.beginPath();
 vals.forEach((v,i)=>{const x=i*step,y=h-(v/max)*(h-8)-4;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});
 if(fill){ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.closePath();ctx.fillStyle='rgba(121,211,189,.2)';ctx.fill()}
 ctx.strokeStyle='#a8a0ff';ctx.lineWidth=2;ctx.stroke();
}
function draw(board){
 const current=series[series.length-1]||sample();
 board.metric.textContent=current.recent+' / 10s';
 board.count.textContent=current.total+' requests · '+current.errors+' failed · '+Math.round(current.avg)+'ms avg';
 const canvas=board.canvas,ctx=canvas.getContext('2d');if(!ctx)return;
 const scale=Math.min(devicePixelRatio||1,2),w=280,h=112;canvas.width=w*scale;canvas.height=h*scale;ctx.setTransform(scale,0,0,scale,0,0);ctx.clearRect(0,0,w,h);
 ctx.strokeStyle='rgba(175,190,220,.13)';ctx.lineWidth=1;for(let y=24;y<h;y+=24){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
 const vals=series.slice(-44).map(p=>board.measure==='errors'?p.errors:board.measure==='latency'?p.avg:p.recent);
 if(!vals.length)return;
 const max=Math.max(1,...vals);
 if(board.type==='bars'){const bar=w/vals.length;ctx.fillStyle='#93dfc9';vals.forEach((v,i)=>ctx.fillRect(i*bar+1,h-4-v/max*(h-13),Math.max(1,bar-2),v/max*(h-13)))}
 else if(board.type==='dots'){ctx.fillStyle='#b7a7ff';vals.forEach((v,i)=>{ctx.beginPath();ctx.arc(i*w/Math.max(1,vals.length-1),h-4-v/max*(h-13),3,0,Math.PI*2);ctx.fill()})}
 else path(ctx,vals,w,h,board.type==='area');
}
function make(){
 if(boards.size>=6)return;
 const id=++seq;
 const board={id,linked:true,slot:boards.size,type:'area',measure:'rate'};
 const el=document.createElement('section');board.el=el;el.className='dl-stat-panel';el.dataset.devlens='true';el.setAttribute('aria-label','DevLens live network statistics');el.innerHTML='<div class="dl-stat-head"><strong>▥ Network pulse</strong><div class="dl-stat-actions"><button class="dl-stat-link" type="button" title="Detach from HUD">Unlink</button><button class="dl-stat-add" type="button" title="Open another graph">+</button><button class="dl-stat-close" type="button" title="Close chart">×</button></div></div><div class="dl-stat-summary"><b class="dl-stat-metric">0 / 10s</b><span class="dl-stat-count">0 requests</span></div><div class="dl-stat-settings"><select class="dl-stat-measure" aria-label="Metric"><option value="rate">Requests / 10s</option><option value="errors">Failed requests</option><option value="latency">Average duration</option></select><select class="dl-stat-kind" aria-label="Chart type"><option value="area">Wave area</option><option value="line">Line</option><option value="bars">Bars</option><option value="dots">Dots</option></select></div><canvas aria-label="Live network activity graph" width="280" height="112"></canvas><div class="dl-stat-foot">Live capture · last 90 samples</div>';
 board.canvas=el.querySelector('canvas');board.metric=el.querySelector('.dl-stat-metric');board.count=el.querySelector('.dl-stat-count');
 el.querySelector('.dl-stat-close').onclick=()=>{el.remove();boards.delete(id)};
 el.querySelector('.dl-stat-add').onclick=make;
 const link=el.querySelector('.dl-stat-link');link.onclick=()=>{board.linked=!board.linked;link.textContent=board.linked?'Unlink':'Link';link.title=board.linked?'Detach from HUD':'Attach to HUD';if(!board.linked){const r=el.getBoundingClientRect();board.x=r.left;board.y=r.top}position(board)};
 el.querySelector('.dl-stat-kind').onchange=e=>{board.type=e.target.value;draw(board)};
 el.querySelector('.dl-stat-measure').onchange=e=>{board.measure=e.target.value;draw(board)};
 const head=el.querySelector('.dl-stat-head');let drag=null;
 head.addEventListener('pointerdown',e=>{if(e.button!==0||e.target.closest('button'))return;const rect=el.getBoundingClientRect();if(board.linked){board.linked=false;link.textContent='Link';board.x=rect.left;board.y=rect.top}drag={sx:e.clientX,sy:e.clientY,x:rect.left,y:rect.top};head.setPointerCapture(e.pointerId);e.preventDefault()});
 head.addEventListener('pointermove',e=>{if(!drag)return;board.x=drag.x+e.clientX-drag.sx;board.y=drag.y+e.clientY-drag.sy;position(board)});
 head.addEventListener('pointerup',()=>drag=null);head.addEventListener('lostpointercapture',()=>drag=null);
 document.documentElement.appendChild(el);boards.set(id,board);position(board);draw(board);
}
window.addEventListener('devlens:stats-open',make);
window.addEventListener('devlens:hud-move',()=>boards.forEach(b=>{if(b.linked)position(b)}));
window.addEventListener('resize',()=>boards.forEach(position));
window.addEventListener('scroll',()=>boards.forEach(b=>{if(b.linked)position(b)}),true);
const interval=setInterval(()=>{if(boards.size===0)return;record();boards.forEach(b=>{if(b.linked)position(b)})},1000);
window.addEventListener('pagehide',()=>clearInterval(interval),{once:true});
})();

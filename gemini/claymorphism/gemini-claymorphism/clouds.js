/* Shared 3D clay-cloud renderer. */
(function(global){
  "use strict";
  const ID="gug-clay-cloud-world", PUFFS=7;
  const CLOUDS=[[8,13,1,-7,.2],[74,24,.82,4,1.1],[35,42,1.18,-3,1.8],[86,58,.72,6,.7],[17,70,.92,-5,1.4],[60,79,1.05,3,2],[44,8,.66,8,2.7],[92,10,.58,-4,3.2],[4,46,.70,5,2.3]];
  function ensure(host,s,mode){
    let world=host.querySelector("#"+ID);
    if(!world){world=document.createElement("div");world.id=ID;world.className="gug-clay-cloud-world";world.setAttribute("aria-hidden","true");host.appendChild(world);}
    const p=GUG.PALETTES[s.palette]||GUG.PALETTES.sky;
    while(world.children.length<s.cloudCount){
      const c=document.createElement("div");c.className="gug-clay-cloud";
      for(let i=0;i<PUFFS;i++){const q=document.createElement("i");q.className="gug-clay-puff";c.appendChild(q);}
      world.appendChild(c);
    }
    [...world.children].forEach((n,i)=>{if(i>=s.cloudCount)n.remove();});
    const duration=122-Number(s.cloudSpeed)*.82;
    world.dataset.mode=mode;
    world.style.setProperty("--gug-cloud-opacity",(s.cloudOpacity/100).toFixed(3));
    world.style.setProperty("--gug-cloud-depth",(0.35+s.cloudDepth/150).toFixed(3));
    world.style.setProperty("--gug-cloud-size",(s.cloudSize/100).toFixed(3));
    [...world.children].forEach((c,i)=>{
      const [x,y,scale,drift,phase]=CLOUDS[i%CLOUDS.length];
      c.style.setProperty("--gug-x",x+"%");c.style.setProperty("--gug-y",y+"%");
      c.style.setProperty("--gug-scale",scale);c.style.setProperty("--gug-drift",drift+"vw");
      c.style.setProperty("--gug-color-a","rgb("+p.cloud[i%p.cloud.length]+")");
      c.style.setProperty("--gug-color-b","rgb("+p.cloud[(i+1)%p.cloud.length]+")");
      c.style.animationDuration=Math.max(28,duration+phase*5)+"s";
      c.style.animationDelay=(-phase*11)+"s";c.style.zIndex=String(Math.round(i+s.cloudDepth));
    });
    return world;
  }
  function create(host,s,mode,interactive){
    const world=ensure(host,s,mode);let pointer=null;
    if(interactive){pointer=e=>{if(!s.parallax)return;const x=(e.clientX/Math.max(1,innerWidth)-.5)*16,y=(e.clientY/Math.max(1,innerHeight)-.5)*10;world.style.setProperty("--gug-pointer-x",x.toFixed(2)+"px");world.style.setProperty("--gug-pointer-y",y.toFixed(2)+"px");};window.addEventListener("pointermove",pointer,{passive:true});}
    return {update(next,nextMode){s=GUG.normalize(next);ensure(host,s,nextMode||mode);},destroy(){if(pointer)window.removeEventListener("pointermove",pointer);world.remove();}};
  }
  global.GUGCLAY={create};
})(globalThis);

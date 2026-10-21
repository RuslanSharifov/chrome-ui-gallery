"use strict";
(() => {
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const loader=document.getElementById("page-loader");
  const hide=()=>{loader?.classList.add("done");setTimeout(()=>loader?.remove(),650)};
  if(reduced){hide();return}
  addEventListener("load",hide,{once:true});
  if(document.readyState==="complete")hide();
  setTimeout(hide,1600);
  document.documentElement.classList.add("motion-ready");
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries)if(entry.isIntersecting){
      entry.target.classList.add("revealed");observer.unobserve(entry.target);
    }
  },{threshold:.07,rootMargin:"0px 0px 30px 0px"});
  function observe(){
    document.querySelectorAll(".metrics>div,.steps article,.contributor-card,.project-card,.section-title-row,.contribute-panel").forEach(el=>{
      if(!el.dataset.motion){el.dataset.motion="1";observer.observe(el)}
    });
  }
  observe();
  const grid=document.getElementById("project-grid");
  if(grid)new MutationObserver(observe).observe(grid,{childList:true});
  const fine=matchMedia("(hover: hover) and (pointer: fine)").matches;
  const glow=document.getElementById("cursor-glow");
  const card=document.querySelector(".depth-card");
  const scene=document.querySelector(".depth-scene");
  const logo=document.querySelector(".kinetic-logo");
  let mx=-999,my=-999,pending=false;
  if(fine)addEventListener("pointermove",e=>{
    mx=e.clientX;my=e.clientY;
    if(pending)return;pending=true;
    requestAnimationFrame(()=>{
      pending=false;
      if(glow){glow.style.left=mx+"px";glow.style.top=my+"px";glow.style.opacity="1"}
      if(scene&&card){
        const r=scene.getBoundingClientRect(),x=(mx-r.left)/r.width-.5,y=(my-r.top)/r.height-.5;
        card.style.transform=Math.abs(x)<.5&&Math.abs(y)<.5?"rotateY("+(-x*12)+"deg) rotateX("+(y*9)+"deg) translateZ(14px)":"";
      }
      if(logo){const r=logo.getBoundingClientRect();logo.style.transform="rotateY("+Math.max(-12,Math.min(12,(mx-r.left-r.width/2)/12))+"deg)"}
    });
  },{passive:true});
  const canvas=document.getElementById("ambient-particles"),ctx=canvas?.getContext("2d");
  if(!ctx)return;
  let w=0,h=0,dots=[];
  function resize(){
    w=innerWidth;h=innerHeight;
    const d=Math.min(devicePixelRatio||1,1.5);
    canvas.width=w*d;canvas.height=h*d;ctx.setTransform(d,0,0,d,0,0);
    dots=Array.from({length:Math.min(65,Math.max(20,Math.round(w*h/24000)))},()=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3}));
  }
  resize();addEventListener("resize",resize,{passive:true});
  function frame(){
    if(!document.hidden){
      ctx.clearRect(0,0,w,h);
      for(const p of dots){
        p.x=(p.x+p.vx+w)%w;p.y=(p.y+p.vy+h)%h;
        const dx=p.x-mx,dy=p.y-my,dist=Math.hypot(dx,dy);
        if(fine&&dist<140&&dist>1){p.x+=dx/dist*.7;p.y+=dy/dist*.7}
        ctx.beginPath();ctx.arc(p.x,p.y,1.1,0,Math.PI*2);
        ctx.fillStyle=dist<160?"rgba(183,160,255,.8)":"rgba(173,184,228,.33)";ctx.fill();
      }
    }
    requestAnimationFrame(frame);
  }
  frame();
})();
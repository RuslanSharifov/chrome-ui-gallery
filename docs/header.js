"use strict";
(() => {
  const header=document.getElementById("site-header");
  const actions=document.getElementById("header-actions");
  const toggle=document.getElementById("island-toggle");
  const close=document.getElementById("island-close");
  const links=document.getElementById("island-links");
  if(!header||!actions||!toggle||!close||!links)return;
  const items=Array.from(links.querySelectorAll("a"));
  const setOpen=open=>{
    actions.classList.toggle("is-open",open);
    toggle.setAttribute("aria-expanded",String(open));
    toggle.setAttribute("aria-label",open?"Close navigation":"Open navigation");
    links.inert=!open;
    close.tabIndex=open?0:-1;
    if(!open)items.forEach(link=>link.blur());
  };
  toggle.addEventListener("click",()=>setOpen(!actions.classList.contains("is-open")));
  close.addEventListener("click",()=>{setOpen(false);toggle.focus()});
  items.forEach(link=>link.addEventListener("click",()=>setOpen(false)));
  document.addEventListener("keydown",event=>{
    if(event.key==="Escape"&&actions.classList.contains("is-open")){setOpen(false);toggle.focus()}
  });
  document.addEventListener("pointerdown",event=>{
    if(actions.classList.contains("is-open")&&!actions.contains(event.target))setOpen(false);
  });
  let pending=false;
  function updateScroll(){
    pending=false;
    header.classList.toggle("is-scrolled",window.scrollY>36);
  }
  window.addEventListener("scroll",()=>{
    if(!pending){pending=true;requestAnimationFrame(updateScroll)}
  },{passive:true});
  updateScroll();
})();

(() => {
  "use strict";
  const root=document.documentElement, VARS="gug-vars", AMBIENT="gug-ambient";
  let settings=GUG.normalize(null), mode="", fx=null, fxFailed=false;
  function detectMode(){
    const c=root.classList;
    if(c.contains("dark-theme")||c.contains("dark"))return"dark";
    if(c.contains("light-theme")||c.contains("light"))return"light";
    const a=(root.getAttribute("data-theme")||root.getAttribute("data-color-scheme")||root.getAttribute("theme")||"").toLowerCase();
    if(a.includes("dark"))return"dark"; if(a.includes("light"))return"light";
    return matchMedia?.("(prefers-color-scheme:light)").matches?"light":"dark";
  }
  function writeVars(){
    let el=document.getElementById(VARS);if(!el){el=document.createElement("style");el.id=VARS;(document.head||root).appendChild(el);}
    const a=GUG.ACCENTS[settings.accent];
    el.textContent="html[data-gug-glass]{--gug-set-blur:"+settings.blur+"px;--gug-set-alpha:"+(settings.opacity/100).toFixed(2)+";--gug-set-sat:"+settings.saturation+"%;--gug-set-veil:"+(settings.veil/100).toFixed(2)+";--gug-set-shine:"+(settings.shine/100).toFixed(2)+";--gug-set-radius:"+settings.radius+"px;--gug-set-accent-dark:"+a.dark+";--gug-set-accent-light:"+a.light+";}";
  }
  function syncMode(){if(!settings.enabled)return;const n=detectMode();if(n!==mode){mode=n;root.setAttribute("data-gug-mode",mode);fx?.update(GUGFX.paramsFrom(settings,n==="light"));}}
  function ensureAmbient(){let el=document.getElementById(AMBIENT);if(!el){el=document.createElement("div");el.id=AMBIENT;el.innerHTML="<canvas></canvas><i></i><i></i><i></i>";el.setAttribute("aria-hidden","true");root.appendChild(el);}return el;}
  function syncFx(){const canvas=ensureAmbient().querySelector("canvas");if(!settings.enabled||!settings.fxOn||fxFailed){fx?.destroy();fx=null;root.setAttribute("data-gug-fx","css");return;}if(!fx){fx=GUGFX.create(canvas);if(!fx){fxFailed=true;root.setAttribute("data-gug-fx","css");return;}fx.start();}fx.update(GUGFX.paramsFrom(settings,mode==="light"));root.setAttribute("data-gug-fx","gl");}
  function clearVars(){document.getElementById(VARS)?.remove();document.getElementById(AMBIENT)?.remove();fx?.destroy();fx=null;}
  function apply(next){settings=next;if(!settings.enabled){["data-gug-glass","data-gug-mode","data-gug-hover3d","data-gug-fx","data-gug-drag"].forEach(a=>root.removeAttribute(a));clearVars();return;}writeVars();root.setAttribute("data-gug-glass","true");root.setAttribute("data-gug-hover3d",settings.hover3d?"on":"off");root.setAttribute("data-gug-drag",settings.dragDialogs?"on":"off");syncMode();syncFx();}
  let drag=null;
  function dialogHit(e){if(!settings.enabled||!settings.dragDialogs||e.button!==0)return null;const d=e.target instanceof Element?e.target.closest('[role="dialog"]'):null;if(!d)return null;const r=d.getBoundingClientRect();if(r.width>innerWidth*.97&&r.height>innerHeight*.97)return null;if(e.clientY-r.top>72)return null;if(e.target.closest('button,a,input,textarea,select,label,[role="button"],[contenteditable="true"]'))return null;return{d,r};}
  document.addEventListener("pointerdown",e=>{const h=dialogHit(e);if(!h)return;drag={d:h.d,id:e.pointerId,dx:e.clientX-h.r.left,dy:e.clientY-h.r.top};const s=(k,v)=>h.d.style.setProperty(k,v,"important");s("position","fixed");s("left",h.r.left+"px");s("top",h.r.top+"px");s("margin","0");s("transform","none");s("z-index","2147483000");e.preventDefault();},true);
  document.addEventListener("pointermove",e=>{if(!drag||e.pointerId!==drag.id)return;const d=drag.d;const l=Math.min(innerWidth-d.offsetWidth-8,Math.max(8,e.clientX-drag.dx));const t=Math.min(innerHeight-d.offsetHeight-8,Math.max(8,e.clientY-drag.dy));d.style.setProperty("left",l+"px","important");d.style.setProperty("top",t+"px","important");},true);
  const end=()=>drag=null;document.addEventListener("pointerup",end,true);document.addEventListener("pointercancel",end,true);
  new MutationObserver(syncMode).observe(root,{attributes:true,attributeFilter:["class","data-theme","data-color-scheme","theme"]});
  matchMedia?.("(prefers-color-scheme:light)").addEventListener?.("change",syncMode);
  chrome.storage.onChanged.addListener((c,a)=>{if(a==="local"&&c[GUG.STORAGE_KEY])apply(GUG.normalize(c[GUG.STORAGE_KEY].newValue));});
  GUG.load().then(apply).catch(console.warn);
})();

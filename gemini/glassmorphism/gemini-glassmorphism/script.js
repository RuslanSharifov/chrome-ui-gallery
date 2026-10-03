(() => {
  "use strict";
  const $=id=>document.getElementById(id);let settings=GUG.normalize(null);
  $("version").textContent="v"+chrome.runtime.getManifest().version;
  const sliders={
    fx:[["intensity","Intensity","%",0,100],["scale","Size","%",40,240],["speed","Speed","%",0,250],["caustics","Caustics","%",0,100],["rays","Light rays","%",0,100],["neon","Neon glow","%",0,100]],
    glass:[["blur","Blur","px",8,60],["opacity","Panel opacity","%",10,92],["veil","Chat area opacity","%",0,45],["saturation","Colour boost","%",100,240],["shine","Edge shine","%",0,200],["radius","Roundness","px",6,36]]
  };
  const refs={sliders:{},switches:{},choices:{}};
  function slider(def){const [key,label,unit,min,max]=def;const l=document.createElement("label");l.className="slider";const h=document.createElement("span");h.textContent=label;const o=document.createElement("output");h.appendChild(o);const i=document.createElement("input");Object.assign(i,{type:"range",min,max,step:1});l.append(h,i);refs.sliders[key]={i,o,unit,min,max};i.oninput=()=>{settings=GUG.normalize({...settings,[key]:i.value});render();clearTimeout(i._t);i._t=setTimeout(()=>GUG.save(settings),60)};return l}
  function sw(key,label){const r=document.createElement("div");r.className="row";const s=document.createElement("span");s.textContent=label;const b=document.createElement("button");b.className="switch small-switch";b.type="button";b.setAttribute("role","switch");b.setAttribute("aria-label",label);b.innerHTML="<span></span>";b.onclick=()=>update({[key]:!settings[key]});r.append(s,b);refs.switches[key]=b;return r}
  function choices(title,key,opts){const w=document.createElement("div"),h=document.createElement("div");h.className="field";h.textContent=title;w.appendChild(h);const box=document.createElement("div");box.className="chips";refs.choices[key]=[];opts.forEach(([v,t])=>{const b=document.createElement("button");b.className="pill";b.type="button";b.textContent=t;b.dataset.value=v;b.onclick=()=>update({[key]:v});box.appendChild(b);refs.choices[key].push(b)});w.appendChild(box);return w}
  const fx=$("panel-fx"),glass=$("panel-glass"),more=$("panel-more");
  fx.append(sw("fxOn","Dynamic light background"),choices("Palette","palette",Object.entries(GUG.PALETTES).map(([k,v])=>[k,v.label])),...sliders.fx.map(slider),sw("mouseGlow","Light follows cursor"),choices("Quality","quality",[["low","Low"],["medium","Medium"],["high","High"]]));
  glass.append(choices("Accent","accent",Object.entries(GUG.ACCENTS).map(([k,v])=>[k,v.label])),...sliders.glass.map(slider));
  more.append(sw("hover3d","3D chat hover"),sw("dragDialogs","Draggable dialogs"));
  Object.entries(GUG.PRESETS).forEach(([k,p])=>{const b=document.createElement("button");b.className="pill";b.type="button";b.textContent=p.label;b.dataset.preset=k;b.onclick=()=>update(p.patch);$("presets").appendChild(b)});
  const tabs=[...document.querySelectorAll(".tab")];function tab(name){tabs.forEach(t=>{const on=t.dataset.tab===name;t.setAttribute("aria-selected",on);$("panel-"+t.dataset.tab).hidden=!on})}tabs.forEach(t=>t.onclick=()=>tab(t.dataset.tab));tab("fx");
  $("enabled").onclick=()=>update({enabled:!settings.enabled});$("reset").onclick=()=>update({...GUG.DEFAULTS});
  let preview=null;function previewFx(){const c=$("preview");if(!settings.fxOn){preview?.destroy();preview=null;c.style.display="none";return}c.style.display="block";if(!preview){preview=GUGFX.create(c);if(!preview)return;preview.start()}preview.update(GUGFX.paramsFrom({...settings,quality:"low"},false))}
  function update(p){settings=GUG.normalize({...settings,...p});render();GUG.save(settings)}
  function render(){
    $("enabled").setAttribute("aria-checked",settings.enabled);$("stateText").textContent=settings.enabled?"Active on Gemini":"Disabled";$("controls").style.opacity=settings.enabled?"1":".45";$("controls").style.pointerEvents=settings.enabled?"auto":"none";
    Object.entries(refs.switches).forEach(([k,b])=>b.setAttribute("aria-checked",settings[k]));
    Object.entries(refs.sliders).forEach(([k,x])=>{x.i.value=settings[k];x.o.textContent=settings[k]+x.unit;x.i.style.setProperty("--fill",((settings[k]-x.min)/(x.max-x.min))*100+"%")});
    Object.entries(refs.choices).forEach(([k,list])=>list.forEach(b=>b.setAttribute("aria-pressed",b.dataset.value===settings[k])));
    $("presets").querySelectorAll(".pill").forEach(b=>{const p=GUG.PRESETS[b.dataset.preset].patch;b.setAttribute("aria-pressed",Object.keys(p).every(k=>settings[k]===p[k]))});
    document.documentElement.style.setProperty("--accent",GUG.ACCENTS[settings.accent].dark);previewFx();
  }
  chrome.tabs.query({active:true,currentWindow:true}).then(([tab])=>{$("tabNotice").hidden=!/^https:\/\/gemini\.google\.com\//.test(tab?.url||"")}).catch(()=>{});
  GUG.load().then(s=>{settings=s;render()});
})();

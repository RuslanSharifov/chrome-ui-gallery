"use strict";

/* Paths are official repository source links so the showcase works both
   locally and when GitHub Pages serves only the /docs directory. */
const BASE = "https://github.com/RuslanSharifov/chrome-ui-gallery/";
const projects = [
  {id:"chatgpt-glass",category:"ui",platform:"chatgpt",name:"ChatGPT Glassmorphism",style:"Glassmorphism",description:"Translucent surfaces, ambient glow and customizable glass controls for ChatGPT.",tags:["Glass","AI","Theme"],icon:"C",palette:["#22223f","#40375c","#ac99fd"],doc:"chatgpt/glassmorphism/ai-prompt-tool/design.md",folder:"chatgpt/glassmorphism/ai-prompt-tool"},
  {id:"chatgpt-clay",category:"ui",platform:"chatgpt",name:"ChatGPT Claymorphism",style:"Claymorphism",description:"Soft rounded surfaces, sculpted panels and a playful, tactile ChatGPT look.",tags:["Clay","Depth","AI"],icon:"C",palette:["#52414f","#77565e","#f0baae"],doc:"chatgpt/claymorphism/design.md",folder:"chatgpt/claymorphism"},
  {id:"dark-gpt",category:"ui",platform:"chatgpt",name:"DARK GPT",style:"Dark / Particle FX",description:"A bold dark-red theme with interactive particle welcome text and pointer glow.",tags:["Dark","Particles","3D"],icon:"D",palette:["#28131e","#601d35","#ff526f"],doc:"chatgpt/DARK%20GPT/design.md",folder:"chatgpt/DARK%20GPT"},
  {id:"gemini-glass",category:"ui",platform:"gemini",name:"Gemini Glassmorphism",style:"Glassmorphism",description:"Adaptive frosted panels, flowing atmosphere and fine-tuned Gemini lighting.",tags:["Glass","Lighting","AI"],icon:"G",palette:["#132d40","#35516a","#9fcbff"],doc:"gemini/glassmorphism/gemini-glassmorphism/design.md",folder:"gemini/glassmorphism/gemini-glassmorphism"},
  {id:"gemini-clay",category:"ui",platform:"gemini",name:"Gemini Claymorphism",style:"Claymorphism",description:"Soft 3D clay shapes, warm color and gentle interactive clouds.",tags:["Clay","Clouds","Motion"],icon:"G",palette:["#4b364e","#75577b","#dbbaf2"],doc:"gemini/claymorphism/gemini-claymorphism/design.md",folder:"gemini/claymorphism/gemini-claymorphism"},
  {id:"github-glass",category:"ui",platform:"github",name:"GitHub Glassmorphism",style:"Glassmorphism",description:"A sleek translucent developer experience layered over GitHub.",tags:["Glass","Dev","Theme"],icon:"GH",palette:["#132836","#1d4c54","#78d4c1"],doc:"github/glassmorphism/github-glassmorphism/design.md",folder:"github/glassmorphism/github-glassmorphism"},
  {id:"github-liquid",category:"ui",platform:"github",name:"GitHub Liquid Glass",style:"Liquid Glass",description:"Fluid refractive surfaces, ambient backgrounds and detailed visual controls.",tags:["Liquid","Glass","Effects"],icon:"GH",palette:["#172d3f","#37576a","#6db9f2"],doc:"github/github-liquid-glass/design.md",folder:"github/github-liquid-glass"},
  {id:"github-3d",category:"ui",platform:"github",name:"3D GitHub",style:"3D / Glassmorphism",description:"Mouse-aware 3D depth, glass panels and reactive proximity animations.",tags:["3D","Depth","Motion"],icon:"3D",palette:["#2a243f","#46375c","#a690fe"],doc:"github/3D%20github/design.md",folder:"github/3D%20github"},
  {id:"lovable-glass",category:"ui",platform:"lovable",name:"Lovable Glassmorphism",style:"Glassmorphism",description:"A luminous gradient-infused glass makeover for the Lovable workspace.",tags:["Glass","Gradient","Studio"],icon:"L",palette:["#3f1f3f","#71425e","#f6a7d9"],doc:"lovable/glassmorphism/lovable-glassmorphism/design.md",folder:"lovable/glassmorphism/lovable-glassmorphism"},
  {id:"lag-fixer",category:"tool",platform:"chatgpt",name:"ChatGPT Lag Fixer",style:"Performance Tool",description:"Helps long ChatGPT conversations run more smoothly by optimizing older messages.",tags:["Speed","Productivity","Utility"],icon:"↯",palette:["#133c36","#216456","#6cdbc5"],doc:"Tools/chatgpt-lag-fixer/README.md",folder:"Tools/chatgpt-lag-fixer"},
  {id:"cookie-manager",category:"tool",platform:"browser",name:"Cookie Manager Pro",style:"Browser Utility",description:"Inspect, add, edit, delete and organize cookies with a dedicated extension.",tags:["Cookies","Utility","Privacy"],icon:"◎",palette:["#3e2e1d","#735233","#eec28c"],doc:"Tools/cookie-manager-pro/README.md",folder:"Tools/cookie-manager-pro"}
];

const grid = document.getElementById("project-grid");
const count = document.getElementById("results-count");
const empty = document.getElementById("empty-state");
const search = document.getElementById("search");
const categoryButtons = Array.from(document.querySelectorAll("[data-category]"));
const platformButtons = Array.from(document.querySelectorAll("[data-platform]"));
const state = {category:"all",platform:"all",query:""};

function node(tag,className,text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}
function sourceLink(path,isFolder) {
  return BASE + (isFolder ? "tree/main/" : "blob/main/") + path;
}
function buildCard(project) {
  const card=node("article","project-card");
  const visual=node("div","project-visual" + (project.category==="tool"?" tool-visual":""));
  visual.style.setProperty("--v1",project.palette[0]);
  visual.style.setProperty("--v2",project.palette[1]);
  visual.style.setProperty("--glow",project.palette[2]);
  visual.append(node("span","visual-top-label",project.category==="ui"?"VISUAL EXPERIMENT":"BROWSER TOOL"));
  const windowEl=node("div","visual-window");
  const dots=node("div","visual-window-head");
  for(let i=0;i<3;i++) dots.append(node("i"));
  windowEl.append(dots);
  const lines=node("div","visual-window-lines");
  for(let i=0;i<3;i++) lines.append(node("i"));
  windowEl.append(lines);
  visual.append(windowEl,node("span","visual-monogram",project.icon));
  const info=node("div","project-info");
  const kicker=node("div","project-kicker");
  kicker.append(node("span","",project.platform.toUpperCase()),node("span","",project.style));
  info.append(kicker,node("h3","",project.name),node("p","",project.description));
  const tags=node("div","tags");
  for(const tag of project.tags) tags.append(node("span","",tag));
  info.append(tags);
  const actions=node("div","project-actions");
  const primary=node("a","",project.category==="tool"?"View tool →":"Explore design →");
  primary.href=sourceLink(project.doc,false);
  primary.target="_blank";primary.rel="noopener noreferrer";
  primary.setAttribute("aria-label","Read documentation for "+project.name+" on GitHub");
  const source=node("a","","Source ↗");source.href=sourceLink(project.folder,true);
  source.target="_blank";source.rel="noopener noreferrer";
  source.setAttribute("aria-label","View source files for "+project.name+" on GitHub");
  actions.append(primary,source);
  info.append(actions);
  card.append(visual,info);
  return card;
}
function setActive(buttons,key,value) {
  for(const button of buttons) {
    const selected=button.dataset[key]===value;
    button.classList.toggle("active",selected);
    button.setAttribute("aria-pressed",String(selected));
  }
}
function render() {
  const query=state.query.trim().toLowerCase();
  const matched=projects.filter(item=>{
    if(state.category!=="all"&&item.category!==state.category) return false;
    if(state.platform!=="all"&&item.platform!==state.platform) return false;
    const text=[item.name,item.platform,item.style,item.description,...item.tags].join(" ").toLowerCase();
    return !query||text.includes(query);
  });
  grid.replaceChildren(...matched.map(buildCard));
  count.textContent=String(matched.length)+" "+(matched.length===1?"project":"projects");
  empty.hidden=matched.length>0;
}
for(const button of categoryButtons) {
  button.addEventListener("click",()=>{state.category=button.dataset.category;setActive(categoryButtons,"category",state.category);render();});
}
for(const button of platformButtons) {
  button.addEventListener("click",()=>{state.platform=button.dataset.platform;setActive(platformButtons,"platform",state.platform);render();});
}
search.addEventListener("input",()=>{state.query=search.value;render();});
document.getElementById("clear-filters").addEventListener("click",()=>{
  state.category="all";state.platform="all";state.query="";search.value="";
  setActive(categoryButtons,"category","all");setActive(platformButtons,"platform","all");render();search.focus();
});
document.addEventListener("keydown",event=>{
  const active=document.activeElement;
  const editing=active&&["INPUT","TEXTAREA"].includes(active.tagName);
  if(event.key==="/"&&!editing&&!event.ctrlKey&&!event.metaKey&&!event.altKey){event.preventDefault();search.focus();}
  if(event.key==="Escape"&&active===search){search.blur();}
});
render();

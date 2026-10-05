(() => {
  "use strict";
  const root=document.documentElement, toast=document.getElementById("toast");
  const showToast=(message)=>{toast.textContent=message;toast.classList.add("is-visible");clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove("is-visible"),1800)};
  const panels=[...document.querySelectorAll("[data-view-panel]")], sideItems=[...document.querySelectorAll(".side-item")];
  const setView=(view)=>{sideItems.forEach(item=>item.classList.toggle("is-active",item.dataset.view===view));panels.forEach(panel=>{panel.hidden=!panel.dataset.viewPanel.split(" ").includes(view)})};
  sideItems.forEach(item=>item.addEventListener("click",()=>setView(item.dataset.view)));
  document.querySelectorAll("[data-toast]").forEach(el=>el.addEventListener("click",()=>showToast(el.dataset.toast)));
  document.getElementById("newRepo").addEventListener("click",()=>showToast("New repository flow opened"));
  const graph=document.getElementById("graph"),levels=[0,1,2,0,3,2,1,4,2,3,0,1,2,4,3,2,1,0];
  for(let i=0;i<91;i++){const cell=document.createElement("i");cell.dataset.level=levels[(i*7+i%5)%levels.length];graph.appendChild(cell)}
  const bindRange=(id,output,suffix)=>{const input=document.getElementById(id),out=document.getElementById(output);const sync=()=>{const value=Number(input.value);out.textContent=value+suffix;if(id==="blur")root.style.setProperty("--blur",value+"px");if(id==="opacity")root.style.setProperty("--glass",value/100);if(id==="glow")root.style.setProperty("--glow",value/100)};input.addEventListener("input",sync);sync()};
  bindRange("blur","blurValue","px");bindRange("opacity","opacityValue","%");bindRange("glow","glowValue","%");
  document.getElementById("search").addEventListener("input",(event)=>{const query=event.target.value.toLowerCase().trim();document.querySelectorAll(".repo-row").forEach(row=>{row.hidden=!!query&&!row.textContent.toLowerCase().includes(query)})});
})();
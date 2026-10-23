(()=>{"use strict";const wrapper=document.querySelector(".support-corner");if(!wrapper)return;const trigger=wrapper.querySelector(".support-trigger"),card=wrapper.querySelector(".support-card"),close=wrapper.querySelector(".support-dismiss");let lastFocus=null;
const setOpen=open=>{if(open){lastFocus=document.activeElement;card.hidden=false;requestAnimationFrame(()=>card.classList.add("shown"))}else{card.classList.remove("shown");card.hidden=true}trigger.setAttribute("aria-expanded",String(open));if(!open&&lastFocus===close)trigger.focus()};
trigger.addEventListener("click",()=>setOpen(card.hidden));
close.addEventListener("click",()=>setOpen(false));
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!card.hidden)setOpen(false)});
document.addEventListener("pointerdown",e=>{if(!card.hidden&&!wrapper.contains(e.target))setOpen(false)});
})();

"use strict";
const block=document.getElementById("block"),skip=document.getElementById("skip");
const headline=document.getElementById("headline"),statusLine=document.getElementById("status");
const message=document.getElementById("message"),dot=document.getElementById("dot");
async function request(data){
  const r=await chrome.runtime.sendMessage(data);
  if(!r?.ok)throw Error(r?.error||"Settings could not be saved");
  return r.status;
}
function render(s){
  block.checked=s.adBlockEnabled;skip.checked=s.autoSkipEnabled;
  const mismatch=s.adBlockEnabled!==s.networkActive;
  const both=s.adBlockEnabled&&s.autoSkipEnabled,any=s.adBlockEnabled||s.autoSkipEnabled;
  headline.textContent=mismatch?"Check network rules":both?"Both shields active":any?"Custom protection":"Protection paused";
  statusLine.textContent=mismatch?"Chrome's network rules could not be synchronized":
    both?"Ad requests filtered · Ad skip ready":!any?"Both features are off":
    s.adBlockEnabled?"Ad request blocking enabled":"Automatic ad skip enabled";
  dot.classList.toggle("ok",any&&!mismatch);
}
async function change(key,value,input){
  block.disabled=skip.disabled=true;
  message.textContent="Saving…";message.classList.remove("error");
  try{
    render(await request({type:"SET_PREFERENCE",key,value}));
    message.textContent="Saved locally. Reload YouTube if an ad was already loaded.";
  }catch(e){
    input.checked=!value;
    message.textContent=e.message;message.classList.add("error");
    try{render(await request({type:"GET_STATUS"}));}catch{/* Keep original error. */}
  }finally{block.disabled=skip.disabled=false;}
}
block.addEventListener("change",()=>change("adBlockEnabled",block.checked,block));
skip.addEventListener("change",()=>change("autoSkipEnabled",skip.checked,skip));
request({type:"GET_STATUS"}).then(render).catch(e=>{
  headline.textContent="Unable to load";statusLine.textContent="Reload the extension at chrome://extensions.";
  message.textContent=e.message;message.classList.add("error");
  block.disabled=skip.disabled=true;
});

const BASE="http://127.0.0.1:41739";
const store=()=>chrome.storage.local.get(["token"]);
async function request(path,body,token,timeout=24000){
 const response=await fetch(BASE+path,{method:"POST",headers:{"content-type":"application/json",...(token?{"authorization":"Bearer "+token}:{})},body:JSON.stringify(body),signal:AbortSignal.timeout(timeout)});
 const data=await response.json();if(!response.ok)throw Error(data.error||"Bridge error");return data;
}
async function inventory(){
 const all=await chrome.management.getAll();
 return all.filter(e=>e.type==="extension").map(e=>({id:e.id,name:e.name,enabled:e.enabled,mayDisable:e.mayDisable,type:e.type}));
}
let revision=0;
const snapshot=async()=>({extensions:await inventory(),inventoryAt:Math.max(Date.now(),++revision)});
let running=false,restartRequested=false,stopped=false;
async function pushInventory(){
 const {token}=await store();if(!token)return;
 try{await request("/inventory",await snapshot(),token,8000)}catch(e){console.warn("Companion inventory push failed",String(e.message||e))}
}
async function execute(cmd,token){
 let result=true;
 if(cmd.type==="set-enabled"){
  if(cmd.extensionId===chrome.runtime.id)throw Error("Companion cannot disable itself");
  const item=await chrome.management.get(cmd.extensionId);
  if(!item.mayDisable)throw Error("Chrome does not permit changing this extension");
  if(item.enabled!==!!cmd.enabled)await chrome.management.setEnabled(cmd.extensionId,!!cmd.enabled);
  const current=await chrome.management.get(cmd.extensionId);
  if(current.enabled!==!!cmd.enabled)throw Error("Chrome did not change the extension state");
  result={enabled:current.enabled};
 }else if(cmd.type!=="refresh")throw Error("Unknown command");
 return result;
}
async function syncOnce(token){
 const data=await request("/poll",await snapshot(),token);
 for(const cmd of data.commands||[]){
  let outcome={id:cmd.id,ok:false};
  try{outcome={id:cmd.id,ok:true,result:await execute(cmd,token)}}catch(e){outcome.error=String(e.message||e)}
  try{await request("/response",{...outcome,...await snapshot()},token,9000)}catch(e){console.warn("Companion response failed",String(e.message||e))}
 }
}
async function loop(){
 if(running)return
 running=true;stopped=false;
 try{
  while(!stopped){
   const {token}=await store();if(!token)break;
   try{await syncOnce(token)}
   catch(e){
    if(String(e.message).includes("Not paired")){
     const latest=(await store()).token;
     if(latest===token)await chrome.storage.local.remove("token");
    }
    break;
   }
  }
 }finally{
  running=false;
  if(restartRequested){restartRequested=false;setTimeout(()=>loop(),0)}
 }
}
async function start(){await chrome.alarms.create("sync",{periodInMinutes:0.5});loop()}
chrome.runtime.onInstalled.addListener(start);
chrome.runtime.onStartup.addListener(start);
chrome.alarms.onAlarm.addListener(a=>{if(a.name==="sync")loop()});
chrome.management.onEnabled.addListener(()=>pushInventory());
chrome.management.onDisabled.addListener(()=>pushInventory());
chrome.management.onInstalled.addListener(()=>pushInventory());
chrome.management.onUninstalled.addListener(()=>pushInventory());
chrome.runtime.onMessage.addListener((msg,_sender,reply)=>{
 (async()=>{
  if(msg.type==="pair"){
   const d=await request("/pair",{code:String(msg.code).trim().toUpperCase()},null,10000);
   await chrome.storage.local.set({token:d.token});
   stopped=true;restartRequested=true;
   if(!running){restartRequested=false;loop()}
   await pushInventory();return{paired:true};
  }
  if(msg.type==="disconnect"){stopped=true;restartRequested=false;await chrome.storage.local.remove("token");return{paired:false}}
  if(msg.type==="status"){const {token}=await store();if(token){loop();pushInventory()}return{paired:!!token}}
  if(msg.type==="sync"){await pushInventory();loop();return{started:true}}
  return{error:"Unknown message"};
 })().then(reply).catch(e=>reply({error:String(e.message||e)}));return true
});
start();

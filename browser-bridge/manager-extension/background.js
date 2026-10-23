const BASE="http://127.0.0.1:41739";
const store=()=>chrome.storage.local.get(["token"]);
async function request(path,body,token,timeout=25000){
 const response=await fetch(BASE+path,{method:"POST",headers:{"content-type":"application/json",...(token?{"authorization":"Bearer "+token}:{})},body:JSON.stringify(body),signal:AbortSignal.timeout(timeout)});
 const data=await response.json();if(!response.ok)throw Error(data.error||"Bridge error");return data;
}
async function inventory(){const all=await chrome.management.getAll();return all.filter(e=>e.type==="extension").map(e=>({id:e.id,name:e.name,enabled:e.enabled,mayDisable:e.mayDisable,type:e.type}))}
let running=false,stop=false;
async function syncOnce(token){
 const data=await request("/poll",{extensions:await inventory()},token);
 for(const cmd of data.commands||[]){
  try{
   let result=true;
   if(cmd.type==="set-enabled"){
    if(cmd.extensionId===chrome.runtime.id)throw Error("Companion cannot disable itself");
    const item=await chrome.management.get(cmd.extensionId);
    if(!item.mayDisable)throw Error("Chrome does not allow managing this extension");
    if(item.enabled!==!!cmd.enabled)await chrome.management.setEnabled(cmd.extensionId,!!cmd.enabled);
    const current=await chrome.management.get(cmd.extensionId);
    if(current.enabled!==!!cmd.enabled)throw Error("Chrome did not change this extension");
    result={enabled:current.enabled};
   }else if(cmd.type!=="refresh")throw Error("Unknown command");
   await request("/response",{id:cmd.id,ok:true,result,extensions:await inventory()},token,10000);
  }catch(e){await request("/response",{id:cmd.id,ok:false,error:String(e.message||e),extensions:await inventory()},token,10000).catch(()=>{})}
 }
}
async function loop(){
 if(running)return;running=true;stop=false;
 try{
  for(let i=0;i<12&&!stop;i++){
   const {token}=await store();if(!token)break;
   try{await syncOnce(token)}catch(e){
    if(String(e.message).includes("Not paired")){await chrome.storage.local.remove("token");break}
    break;
   }
  }
 }finally{running=false}
}
async function init(){await chrome.alarms.create("sync",{periodInMinutes:0.5});loop()}
chrome.runtime.onInstalled.addListener(init);
chrome.runtime.onStartup.addListener(init);
chrome.alarms.onAlarm.addListener(a=>{if(a.name==="sync")loop()});
chrome.management.onEnabled.addListener(()=>loop());
chrome.management.onDisabled.addListener(()=>loop());
chrome.runtime.onMessage.addListener((msg,_sender,reply)=>{
 (async()=>{
  if(msg.type==="pair"){const d=await request("/pair",{code:String(msg.code).trim().toUpperCase()},null,10000);await chrome.storage.local.set({token:d.token});stop=true;setTimeout(loop,100);return{paired:true}}
  if(msg.type==="disconnect"){stop=true;await chrome.storage.local.remove("token");return{paired:false}}
  if(msg.type==="status"){const {token}=await store();if(token)loop();return{paired:!!token}}
  if(msg.type==="sync"){loop();return{started:true}}
  return{error:"Unknown message"}
 })().then(reply).catch(e=>reply({error:String(e.message||e)}));return true
});
init();

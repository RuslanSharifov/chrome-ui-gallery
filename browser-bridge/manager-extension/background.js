const BASE="http://127.0.0.1:41739";
const store=()=>chrome.storage.local.get(["token"]);
async function request(path,body,token){const response=await fetch(BASE+path,{method:"POST",headers:{"content-type":"application/json",...(token?{"authorization":"Bearer "+token}:{})},body:JSON.stringify(body),signal:AbortSignal.timeout(6000)});const data=await response.json();if(!response.ok)throw Error(data.error||"Bridge error");return data}
async function inventory(){const all=await chrome.management.getAll();return all.filter(e=>e.type==="extension").map(e=>({id:e.id,name:e.name,enabled:e.enabled,mayDisable:e.mayDisable,type:e.type}))}
async function poll(){const {token}=await store();if(!token)return;try{
 const data=await request("/poll",{extensions:await inventory()},token);
 for(const cmd of data.commands||[]){try{
  let result=true;
  if(cmd.type==="set-enabled"){if(cmd.extensionId===chrome.runtime.id)throw Error("Companion cannot disable itself");const item=await chrome.management.get(cmd.extensionId);if(!item.mayDisable)throw Error("Chrome does not allow managing this extension");await chrome.management.setEnabled(cmd.extensionId,!!cmd.enabled)}
  else if(cmd.type!=="refresh")throw Error("Unknown command");
  await request("/response",{id:cmd.id,ok:true,result},token);
 }catch(e){await request("/response",{id:cmd.id,ok:false,error:e.message},token).catch(()=>{})}}
 }catch(e){if(String(e.message).includes("Not paired"))await chrome.storage.local.remove("token")}}
chrome.runtime.onInstalled.addListener(()=>chrome.alarms.create("sync",{periodInMinutes:0.5}));
chrome.runtime.onStartup.addListener(()=>chrome.alarms.create("sync",{periodInMinutes:0.5}));
chrome.alarms.onAlarm.addListener(a=>{if(a.name==="sync")poll()});
chrome.runtime.onMessage.addListener((msg,_sender,reply)=>{
 (async()=>{if(msg.type==="pair"){const d=await request("/pair",{code:String(msg.code).trim().toUpperCase()});await chrome.storage.local.set({token:d.token});await poll();return{paired:true}}if(msg.type==="disconnect"){await chrome.storage.local.remove("token");return{paired:false}}if(msg.type==="status"){const {token}=await store();if(token)await poll();return{paired:!!(await store()).token}}return{error:"Unknown message"}})().then(reply).catch(e=>reply({error:e.message}));return true;
});

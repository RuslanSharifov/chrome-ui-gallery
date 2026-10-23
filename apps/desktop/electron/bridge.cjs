const http=require("node:http");
const crypto=require("node:crypto");
const PORT=41739;
const rand=n=>crypto.randomBytes(n).toString("hex");
const json=(res,status,data)=>{res.writeHead(status,{"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"});res.end(JSON.stringify(data))};
function createBridge(_app,notify){
 let token=null,pairCode=rand(4).toUpperCase(),connected=false,lastSeen=0,extensions=[],pending=new Map(),server=null;
 const state=()=>({connected:connected&&Date.now()-lastSeen<90000,pairCode,port:PORT,extensions,updatedAt:lastSeen});
 const signal=()=>notify();
 function queue(action){if(!state().connected)return Promise.reject(new Error("Chrome companion is not connected."));return new Promise((resolve,reject)=>{const id=rand(12);const timeout=setTimeout(()=>{pending.delete(id);reject(new Error("Chrome did not respond."))},70000);pending.set(id,{id,action,resolve,reject,timeout,dispatched:false})})}
 function handle(req,res){
  const origin=req.headers.origin;
  // Extensions make requests from chrome-extension://...; unpaired web pages must not issue commands.
  if(origin&&!/^chrome-extension:\/\/[a-p]{32}$/.test(origin))return json(res,403,{error:"Invalid origin"});
  if(!["GET","POST"].includes(req.method))return json(res,405,{error:"Method not allowed"});
  if(!["/health","/pair","/poll","/response"].includes(req.url))return json(res,404,{error:"Not found"});
  let chunks=[],size=0;req.on("data",chunk=>{size+=chunk.length;if(size>65536){req.destroy();return}chunks.push(chunk)});
  req.on("end",()=>{let body={};try{body=chunks.length?JSON.parse(Buffer.concat(chunks).toString("utf8")):{}}catch{return json(res,400,{error:"Invalid JSON"})}
   if(req.url==="/health"&&req.method==="GET")return json(res,200,{app:"chrome-ui-gallery",bridgeVersion:1});
   if(req.url==="/pair"&&req.method==="POST"){
    if(!body.code||typeof body.code!=="string"||body.code.toUpperCase()!==pairCode)return json(res,403,{error:"Pairing code is invalid"});
    token=rand(32);pairCode=rand(4).toUpperCase();connected=true;lastSeen=Date.now();extensions=[];signal();return json(res,200,{token});
   }
   if(!token||req.headers.authorization!=="Bearer "+token)return json(res,401,{error:"Not paired"});
   connected=true;lastSeen=Date.now();
   if(req.url==="/poll"&&req.method==="POST"){
    if(Array.isArray(body.extensions))extensions=body.extensions.filter(e=>e&&typeof e.id==="string"&&typeof e.name==="string").slice(0,500).map(e=>({id:e.id,name:e.name,enabled:!!e.enabled,mayDisable:!!e.mayDisable,type:e.type}));
    const commands=[...pending.values()].filter(e=>!e.dispatched).map(e=>{e.dispatched=true;return{id:e.id,...e.action}});signal();return json(res,200,{commands});
   }
   if(req.url==="/response"&&req.method==="POST"){
    if(Array.isArray(body.extensions))extensions=body.extensions.filter(e=>e&&typeof e.id==="string"&&typeof e.name==="string").slice(0,500).map(e=>({id:e.id,name:e.name,enabled:!!e.enabled,mayDisable:!!e.mayDisable,type:e.type}));
    const item=pending.get(body.id);if(item){clearTimeout(item.timeout);pending.delete(body.id);body.ok?item.resolve(body.result??true):item.reject(new Error(String(body.error||"Chrome operation failed")));}
    signal();return json(res,200,{ok:true});
   }
   return json(res,405,{error:"Method not allowed"});
  });
 }
 return {
  state,
  start:()=>new Promise((resolve,reject)=>{server=http.createServer(handle);server.on("error",reject);server.listen(PORT,"127.0.0.1",resolve)}),
  stop:()=>{for(const p of pending.values()){clearTimeout(p.timeout);p.reject(new Error("Application closing"))}pending.clear();server?.close()},
  refresh:async()=>{await queue({type:"refresh"});return state()},
  setEnabled:async({id,enabled})=>{if(typeof id!=="string"||!/^[a-p]{32}$/.test(id)||typeof enabled!=="boolean")throw new Error("Invalid extension request");const result=await queue({type:"set-enabled",extensionId:id,enabled});if(!result||result.enabled!==enabled)throw new Error("Chrome did not confirm the change");return state()},
  disconnect:()=>{token=null;pairCode=rand(4).toUpperCase();connected=false;lastSeen=0;extensions=[];for(const p of pending.values()){clearTimeout(p.timeout);p.reject(new Error("Disconnected"))}pending.clear();signal();return state()}
 }
}
module.exports={createBridge};

"use strict";
const fs=require("node:fs"),path=require("node:path");
function createDiagnostics(app){
 const dir=path.join(app.getPath("userData"),"diagnostics"),file=path.join(dir,"bridge-diagnostics.jsonl");
 fs.mkdirSync(dir,{recursive:true});
 function log(event,data={}){
  const safe={};for(const [key,value] of Object.entries(data)){if(/token|secret|code|cookie|url|password|name|folder|path|extensionId/i.test(key))continue;if(["string","number","boolean"].includes(typeof value))safe[key]=typeof value==="string"?value.slice(0,180):value}
  try{if(fs.existsSync(file)&&fs.statSync(file).size>2*1024*1024){const backup=path.join(dir,"bridge-diagnostics.previous.jsonl");fs.rmSync(backup,{force:true});fs.renameSync(file,backup)}fs.appendFileSync(file,JSON.stringify({time:new Date().toISOString(),event,...safe})+"\n")}catch(err){console.error("Diagnostic log write failed:",err.message)}
 }
 return{file,log};
}
module.exports={createDiagnostics};

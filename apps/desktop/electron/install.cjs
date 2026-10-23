"use strict";
const https=require("node:https");
const fs=require("node:fs");
const path=require("node:path");
const os=require("node:os");
const {spawn}=require("node:child_process");
const AdmZip=require("adm-zip");
const MAX_ZIP=30*1024*1024,MAX_UNPACKED=100*1024*1024;
const VALID_ID=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PREFIX="https://ruslansharifov.github.io/chrome-ui-gallery/downloads/";
function fetchZip(url,redirects=0){
 return new Promise((resolve,reject)=>{
  if(redirects>2)return reject(new Error("Too many redirects"));
  const target=new URL(url);
  if(target.protocol!=="https:"||target.hostname!=="ruslansharifov.github.io"||!target.pathname.startsWith("/chrome-ui-gallery/downloads/"))return reject(new Error("Untrusted download URL"));
  https.get(target,{timeout:20000,headers:{"user-agent":"Chrome-UI-Gallery-Desktop"}},res=>{
   if([301,302,307,308].includes(res.statusCode)){const next=new URL(res.headers.location||"",target);res.resume();fetchZip(next.toString(),redirects+1).then(resolve,reject);return}
   if(res.statusCode!==200){res.resume();reject(new Error("Extension ZIP unavailable (HTTP "+res.statusCode+")"));return}
   const pieces=[];let size=0;
   res.on("data",chunk=>{size+=chunk.length;if(size>MAX_ZIP){res.destroy(new Error("Extension ZIP too large"));return}pieces.push(chunk)});
   res.on("end",()=>resolve(Buffer.concat(pieces)));res.on("error",reject);
  }).on("timeout",function(){this.destroy(new Error("Download timed out"))}).on("error",reject);
 });
}
function prepareInstaller(app,shell){
 return async function prepare(id){
  if(typeof id!=="string"||!VALID_ID.test(id)||id.length>110)throw new Error("Invalid extension catalog ID");
  const data=await fetchZip(PREFIX+encodeURIComponent(id)+".zip");
  const zip=new AdmZip(data),entries=zip.getEntries();
  if(!entries.length||entries.length>2000)throw new Error("Invalid extension archive");
  const names=entries.map(e=>e.entryName.replace(/\\/g,"/"));
  if(names.some(n=>n.startsWith("/")||n.split("/").some(p=>p===".."||p==="."||p==="")||/^[A-Za-z]:/.test(n)))throw new Error("Unsafe paths in extension archive");
  const roots=new Set(names.map(n=>n.split("/")[0]));
  if(roots.size!==1)throw new Error("Archive must contain one extension folder");
  const root=[...roots][0];
  if(!names.includes(root+"/manifest.json"))throw new Error("Extension archive has no root manifest.json");
  let total=0;
  for(const e of entries){total+=e.header.size;if(total>MAX_UNPACKED)throw new Error("Extension archive exceeds extraction limit")}
  let manifest;
  try{manifest=JSON.parse(zip.getEntry(root+"/manifest.json").getData().toString("utf8"))}catch{throw new Error("Invalid manifest.json")}
  if(manifest.manifest_version!==3||typeof manifest.name!=="string")throw new Error("Not a supported Chrome Manifest V3 extension");
  const base=path.join(app.getPath("userData"),"prepared-extensions"),dest=path.join(base,id),stage=path.join(base,id+"-staging");
  fs.mkdirSync(base,{recursive:true});
  fs.rmSync(stage,{recursive:true,force:true});fs.mkdirSync(stage,{recursive:true});
  try{
   for(const e of entries){if(e.isDirectory)continue;const rel=e.entryName.replace(/\\/g,"/").split("/").slice(1).join("/");if(!rel)continue;
    const target=path.resolve(stage,rel);if(!target.startsWith(stage+path.sep))throw new Error("Invalid extraction path");
    fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,e.getData(),{flag:"w"});
   }
   fs.rmSync(dest,{recursive:true,force:true});fs.renameSync(stage,dest);
  }catch(err){fs.rmSync(stage,{recursive:true,force:true});throw err}
  await shell.openPath(dest);
  return {folder:dest,name:manifest.name,message:"Extension downloaded and extracted. In Chrome: enable Developer mode → Load unpacked → choose the opened folder."};
 }
}
function openChromeExtensions(){
 const candidates=process.platform==="win32"?[
  path.join(process.env.PROGRAMFILES||"C:\\Program Files","Google","Chrome","Application","chrome.exe"),
  path.join(process.env["PROGRAMFILES(X86)"]||"C:\\Program Files (x86)","Google","Chrome","Application","chrome.exe"),
  path.join(process.env.LOCALAPPDATA||"","Google","Chrome","Application","chrome.exe")]:
 process.platform==="darwin"?["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"]:
 ["/usr/bin/google-chrome","/usr/bin/google-chrome-stable","/usr/bin/chromium","/usr/bin/chromium-browser"];
 const exe=candidates.find(p=>p&&fs.existsSync(p));
 if(!exe)return {opened:false,message:"Open Chrome and visit chrome://extensions manually."};
 const child=spawn(exe,["chrome://extensions/"],{detached:true,stdio:"ignore"});child.on("error",()=>{});child.unref();
 return {opened:true,message:"Chrome extension manager requested."};
}
module.exports={prepareInstaller,openChromeExtensions};

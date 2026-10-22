#!/usr/bin/env node
/**
 * Chrome UI Gallery — zero-dependency catalog generator.
 *
 * Usage: node scripts/build-catalog.mjs
 * Discovers Chrome Manifest V3 extensions and writes docs/catalog.json.
 *
 * A valid Tool lives at Tools/<unique-slug>/manifest.json.
 * A valid visual design lives at <platform>/<style>[/<design>]/manifest.json.
 * Optional gallery.json customizes display without changing website code.
 *
 * This script does NOT approve contributions or audit their security.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const uiExcluded = new Set(["Tools", "ui", "docs", "setup", "templates", "scripts", ".github", "node_modules", ".git"]);
const palettes = [
  ["#22223f", "#40375c", "#ac99fd"],
  ["#133c36", "#216456", "#6cdbc5"],
  ["#132d40", "#35516a", "#9fcbff"],
  ["#4b364e", "#75577b", "#dbbaf2"],
  ["#3e2e1d", "#735233", "#eec28c"],
  ["#28131e", "#601d35", "#ff526f"]
];

const rel = file => path.relative(root, file).split(path.sep).join("/");
const visibleDirs = dir => fs.existsSync(dir) ? fs.readdirSync(dir, {withFileTypes:true})
  .filter(item => item.isDirectory() && !item.name.startsWith(".") && item.name !== "node_modules")
  .map(item => path.join(dir,item.name))
  .sort((a,b)=>a.localeCompare(b,"en")) : [];
const exists = file => fs.existsSync(file) && fs.statSync(file).isFile();
const titleCase = name => name.replace(/[-_]+/g," ").replace(/\s+/g," ").trim()
  .split(" ").map(word=> /^(3d|ui|ai|gpt)$/i.test(word) ? word.toUpperCase() : word.charAt(0).toUpperCase()+word.slice(1)).join(" ");
const safeText = (input,key,maximum) => {
  if (typeof input !== "string" || !input.trim() || input.length > maximum || /[\u0000-\u001f]/.test(input))
    throw new Error(key+" must be a nonempty string under "+maximum+" characters");
  return input.trim();
};
const isInside = (folder,target) => {
  const result = path.relative(folder,target);
  return result && result !== ".." && !result.startsWith(".."+path.sep) && !path.isAbsolute(result);
};
function readJSON(file) {
  try { return JSON.parse(fs.readFileSync(file,"utf8")); }
  catch(e) { throw new Error(rel(file)+": "+e.message); }
}
function hash(s) {
  let value=0;
  for(const c of s) value=(value*31+c.charCodeAt(0))>>>0;
  return value;
}
function inferPlatform(manifest) {
  const hosts=[...(manifest.host_permissions??[]),...(manifest.content_scripts??[]).flatMap(item=>item.matches??[])].join(" ").toLowerCase();
  if(hosts.includes("chatgpt.com")||hosts.includes("chat.openai.com"))return "chatgpt";
  if(hosts.includes("gemini.google.com"))return "gemini";
  if(hosts.includes("github.com"))return "github";
  if(hosts.includes("lovable.dev"))return "lovable";
  return "browser";
}
function readMeta(dir) {
  const file=path.join(dir,"gallery.json");
  if(!exists(file)) return {};
  const v=readJSON(file);
  if(!v || typeof v !== "object" || Array.isArray(v))throw new Error(rel(file)+": metadata must be an object");
  const allowed=new Set(["name","description","platform","style","tags","palette","icon","author","preview","previews"]);
  for(const key of Object.keys(v))if(!allowed.has(key))throw new Error(rel(file)+": unknown field "+key);
  for(const key of ["name","description","platform","style","icon"])if(v[key]!==undefined)safeText(v[key],rel(file)+"."+key,key==="description"?500:100);
  if(v.platform!==undefined&&!/^[a-z0-9][a-z0-9-]*$/.test(v.platform))throw new Error(rel(file)+": platform must be a lowercase slug");
  if(v.tags!==undefined&&(!Array.isArray(v.tags)||v.tags.length>6||v.tags.some(t=>typeof t!=="string"||t.length>24||!t.trim())))throw new Error(rel(file)+": tags must contain at most 6 short strings");
  if(v.palette!==undefined&&(!Array.isArray(v.palette)||v.palette.length!==3||v.palette.some(c=>typeof c!=="string"||!/^#[0-9a-fA-F]{6}$/.test(c))))throw new Error(rel(file)+": palette must be 3 hex RGB colors");
  if(v.icon!==undefined&&v.icon.length>4)throw new Error(rel(file)+": icon may contain at most 4 characters");
  if(v.author!==undefined) {
    if(!v.author || typeof v.author!=="object"||Array.isArray(v.author))throw new Error(rel(file)+": author must be an object");
    safeText(v.author.name,rel(file)+".author.name",80);
    if(v.author.url!==undefined&&(!/^https:\/\/github\.com\/[A-Za-z0-9-]+\/?$/.test(v.author.url)))throw new Error(rel(file)+": author.url must be a GitHub profile URL");
  }
  if(v.preview!==undefined){
    safeText(v.preview,rel(file)+".preview",200);
    const target=path.resolve(dir,v.preview);
    if(!isInside(dir,target)||!exists(target)||!/\.(png|jpg|jpeg|webp|svg|gif)$/i.test(target))
      throw new Error(rel(file)+": preview must be an existing local image within its design directory");
  }
  if(v.previews!==undefined){
    if(!Array.isArray(v.previews)||v.previews.length>20||v.previews.some(p=>typeof p!=="string"))
      throw new Error(rel(file)+": previews must be an array of up to 20 image paths");
    for(const preview of v.previews){
      safeText(preview,rel(file)+".previews",200);
      const target=path.resolve(dir,preview);
      if(!isInside(dir,target)||!exists(target)||!/\.(png|jpg|jpeg|webp|svg|gif)$/i.test(target))
        throw new Error(rel(file)+": previews must contain existing local images");
    }
  }
  return v;

function findManifests(dir,depth=0){
  if(depth>4) return [];
  return visibleDirs(dir).flatMap(child=>{
    const manifest=path.join(child,"manifest.json");
    if(exists(manifest)) return [manifest];
    return findManifests(child,depth+1);
  });
}
function addProject(manifestFile,category) {
  const folder=path.dirname(manifestFile);
  const folderPath=rel(folder);
  const parts=folderPath.split("/");
  if(category==="tool"&&parts.length!==2)
    throw new Error(folderPath+": tools must use Tools/<slug>/manifest.json");
  if(category==="ui"&&parts.length<2)
    throw new Error(folderPath+": UI designs need a platform/style folder");
  const manifest=readJSON(manifestFile);
  if(manifest.manifest_version!==3)throw new Error(folderPath+": Chrome Manifest V3 is required");
  const docs=category==="tool" ? ["README.md"] : ["design.md","DESIGN.md"];
  const documentation=docs.find(name=>exists(path.join(folder,name)));
  if(!documentation) throw new Error(folderPath+": missing "+docs.join(" or "));
  const meta=readMeta(folder);
  const platform=category==="ui" ? parts[0] : meta.platform??inferPlatform(manifest);
  if(category==="ui"&&meta.platform!==undefined&&meta.platform!==parts[0])
    throw new Error(folderPath+": metadata platform must match the parent platform folder");
  const style=meta.style??(category==="tool"?"Browser Tool":titleCase(parts[1]));
  const name=meta.name??safeText(manifest.name,folderPath+" manifest.name",100);
  const description=meta.description??(typeof manifest.description==="string"&&manifest.description.trim()
    ?manifest.description.trim():"Open-source Chrome extension.");
  const tags=meta.tags??[category==="tool"?"Tool":"UI Design",style].filter((item,i,arr)=>arr.indexOf(item)===i);
  const icon=meta.icon??(platform==="github"?"GH":platform==="browser"?"◈":platform.charAt(0).toUpperCase());
  const palette=meta.palette??palettes[hash(folderPath)%palettes.length];
  return {
    id:folderPath.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""),
    category,platform,name,style,description,tags,icon,palette,
    doc:folderPath+"/"+documentation,folder:folderPath,
    version:manifest.version,
    ...(meta.author?{author:meta.author}:{}),
    ...(meta.preview?{preview:folderPath+"/"+meta.preview}:{}),
    ...(meta.previews?.length?{previews:meta.previews.map(p=>folderPath+"/"+p)}:{})
  };
}
const projects=[];
for(const manifest of findManifests(path.join(root,"Tools")))projects.push(addProject(manifest,"tool"));
for(const folder of visibleDirs(root)) {
  if(uiExcluded.has(path.basename(folder))) continue;
  for(const manifest of findManifests(folder)) projects.push(addProject(manifest,"ui"));
}
const ids=new Set();
for(const item of projects) {
  if(ids.has(item.id))throw new Error("Duplicate project ID: "+item.id);
  ids.add(item.id);
}
projects.sort((a,b)=>a.category.localeCompare(b.category)||a.platform.localeCompare(b.platform)||a.name.localeCompare(b.name));
if(!projects.length)throw new Error("No projects discovered; refusing to publish an empty catalog.");
const output={schemaVersion:1,projects};
const target=path.join(root,"docs","catalog.json");
fs.mkdirSync(path.dirname(target),{recursive:true});
fs.writeFileSync(target,JSON.stringify(output,null,2)+"\n","utf8");
const ui=projects.filter(p=>p.category==="ui").length;
console.log("Generated "+rel(target)+" with "+projects.length+" projects ("+ui+" UI / "+(projects.length-ui)+" tools).");

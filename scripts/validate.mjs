#!/usr/bin/env node
/* Zero-dependency structural validation; NOT a security or license audit. */
import fs from "node:fs";
import path from "node:path";
import {execFileSync} from "node:child_process";
import {fileURLToPath} from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const errors=[],warnings=[],stats={md:0,links:0,manifests:0,catalog:0};
const ignored=new Set([".git","node_modules",".next","dist","build"]);
function allFiles(dir){
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{
    if(ignored.has(e.name))return [];
    const p=path.join(dir,e.name);
    return e.isDirectory()?allFiles(p):e.isFile()?[p]:[];
  });
}
const files=allFiles(root);
const rel=p=>path.relative(root,p).split(path.sep).join("/");
function inside(p){const v=path.relative(root,p);return v===""||(v!==".."&&!v.startsWith(".."+path.sep)&&!path.isAbsolute(v));}
function check(source,uri,label){
  let l=uri.split("#")[0].split("?")[0].replace(/^<|>$/g,"");
  if(!l||/^(https?:|mailto:|tel:|data:|javascript:|\/\/)/i.test(l))return;
  try{l=decodeURIComponent(l)}catch{errors.push(rel(source)+": invalid encoded "+label+" "+uri);return}
  if(l.startsWith("/")){warnings.push(rel(source)+": absolute URL not checked "+l);return}
  const target=path.resolve(path.dirname(source),l);
  if(!inside(target)||!fs.existsSync(target))errors.push(rel(source)+": missing "+label+" "+uri);
}
for(const p of files.filter(f=>/\.md$/i.test(f))){
  stats.md++;
  const body=fs.readFileSync(p,"utf8").replace(/~~~[\s\S]*?~~~/g,"").replace(/\x60[^\x60\n]+\x60/g,"");
  for(const match of body.matchAll(/!?\[[^\]\n]*\]\((<[^>]*>|[^)\s]+)(?:\s+"[^"]*")?\)/g)){
    stats.links++;check(p,match[1],"Markdown link");
  }
}
for(const p of files.filter(f=>path.basename(f)==="manifest.json")){
  stats.manifests++;
  let m;try{m=JSON.parse(fs.readFileSync(p,"utf8"))}catch(e){errors.push(rel(p)+": JSON error "+e.message);continue}
  if(m.manifest_version!==3)errors.push(rel(p)+": manifest_version must be 3");
  if(typeof m.name!=="string"||!m.name.trim())errors.push(rel(p)+": missing name");
  if(typeof m.version!=="string"||!/^\d+\.\d+\.\d+(?:\.\d+)?$/.test(m.version))errors.push(rel(p)+": version must be semver");
  const required=[];
  function add(x){if(typeof x==="string")required.push(x)}
  function icons(x){if(typeof x==="string")add(x);else if(x)Object.values(x).forEach(add)}
  add(m.action?.default_popup);icons(m.action?.default_icon);icons(m.icons);
  add(m.background?.service_worker);add(m.options_page);add(m.options_ui?.page);add(m.side_panel?.default_path);
  for(const c of m.content_scripts??[]){(c.js??[]).forEach(add);(c.css??[]).forEach(add)}
  for(const file of required){
    const target=path.resolve(path.dirname(p),file);
    if(/^(https?:|\/\/)/i.test(file)||!inside(target)||!fs.existsSync(target)||!fs.statSync(target).isFile()){
      errors.push(rel(p)+": missing or remote manifest resource "+file);
    }
  }
  if(m.host_permissions?.includes("<all_urls>"))warnings.push(rel(p)+": broad permission <all_urls> needs human review");
  const folder=rel(path.dirname(p)).split("/");
  if(folder[0]==="Tools"&&folder.length===2&&!fs.existsSync(path.join(path.dirname(p),"README.md")))errors.push(rel(p)+": missing tool README.md");
  if(folder[0]==="ui-designs"&&!["design.md","DESIGN.md"].some(f=>fs.existsSync(path.join(path.dirname(p),f))))errors.push(rel(p)+": missing design.md");
}
for(const dir of fs.readdirSync(path.join(root,"Tools"),{withFileTypes:true})){
  if(dir.isDirectory()&&!fs.existsSync(path.join(root,"Tools",dir.name,"manifest.json")))errors.push("Tools/"+dir.name+": missing manifest.json");
}
const site=path.join(root,"docs","catalog.json");
if(!fs.existsSync(site))errors.push("docs/catalog.json missing: run node scripts/build-catalog.mjs");
else{
  try{
    const catalog=JSON.parse(fs.readFileSync(site,"utf8"));
    if(catalog.schemaVersion!==1||!Array.isArray(catalog.projects))throw new Error("invalid catalog format");
    const expected=files.filter(p=>path.basename(p)==="manifest.json"&&!rel(p).startsWith("templates/")).length;
    stats.catalog=catalog.projects.length;
    if(catalog.projects.length!==expected)errors.push("Catalog contains "+catalog.projects.length+" projects, but found "+expected+" source manifests. Run node scripts/build-catalog.mjs");
    const ids=new Set();
    for(const item of catalog.projects){
      if(typeof item.id!=="string"||ids.has(item.id))errors.push("Duplicate or missing catalog ID");
      ids.add(item.id);
      if(!["tool","ui"].includes(item.category))errors.push("Unexpected category for "+item.id);
      for(const key of ["doc","folder"]){
        if(typeof item[key]!=="string"){errors.push("Invalid catalog "+key);continue}
        const dest=path.resolve(root,item[key]);
        if(!inside(dest)||!fs.existsSync(dest))errors.push("Broken catalog "+key+": "+item[key]);
      }
      if(item.preview!==undefined){
        const image=path.resolve(root,item.preview);
        if(!inside(image)||!fs.existsSync(image))errors.push("Missing preview: "+item.preview);
      }
    }
  }catch(e){errors.push("Invalid generated catalog: "+e.message)}
}
try{
  const index=execFileSync("git",["ls-files","--stage"],{cwd:root,encoding:"utf8",stdio:["ignore","pipe","ignore"]});
  for(const line of index.split("\n"))if(line.startsWith("160000 "))errors.push("Nested Git submodule/gitlink: "+line);
}catch{warnings.push("Git index check skipped; run in git checkout for gitlink detection");}
console.log("Gallery validation: "+stats.md+" Markdown files, "+stats.links+" links, "+stats.manifests+" manifests, "+stats.catalog+" catalog items");
for(const w of warnings)console.warn("WARN "+w);
for(const e of errors)console.error("ERROR "+e);
if(errors.length){console.error("FAIL "+errors.length+" issue(s)");process.exitCode=1}
else console.log("PASS: all checked local paths exist and required project docs are present.");

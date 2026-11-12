#!/usr/bin/env node
/** Check README → platform → style → project routes without network access. */
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const exists=relative=>fs.existsSync(path.join(root,relative));
const read=relative=>fs.readFileSync(path.join(root,relative),"utf8");
const errors=[];
const check=(condition,message)=>{if(!condition)errors.push(message);};
const dirs=relative=>fs.readdirSync(path.join(root,relative),{withFileTypes:true})
  .filter(entry=>entry.isDirectory()&&!entry.name.startsWith(".")).map(entry=>entry.name);
const platformIndex=read("ui-designs/README.md");
const galleryIndex=read("ui/README.md");
const home=read("README.md");
const platforms=dirs("ui-designs");
check(!exists("youtube"),"Duplicate root-level youtube/ folder");
check(!exists("ui-designs/youtube-ambient-light"),"Legacy ambient folder still present");
for(const platform of platforms){
  const base="ui-designs/"+platform;
  const index=base+"/README.md";
  check(exists(index),"Platform index missing: "+index);
  if(!exists(index))continue;
  const body=read(index);
  check(platformIndex.includes("./"+platform+"/README.md"),"Collection index lacks "+platform);
  check(galleryIndex.includes("../ui-designs/"+platform+"/README.md"),"UI gallery index lacks "+platform);
  check(home.includes("./ui-designs/"+platform+"/README.md"),"Home index lacks "+platform);
  for(const style of dirs(base)){
    const stylePath=base+"/"+style;
    const styleReadme=stylePath+"/README.md";
    check(exists(styleReadme),"Missing style README: "+stylePath);
    check(body.includes("./"+encodeURIComponent(style)+"/README.md"),
      "Platform README lacks style: "+stylePath);
    if(!exists(styleReadme))continue;
    const contents=read(styleReadme);
    if(exists(stylePath+"/manifest.json"))
      check(contents.includes("./design.md"),"Style extension lacks design link: "+stylePath);
    for(const name of dirs(stylePath)){
      const leaf=stylePath+"/"+name;
      if(!exists(leaf+"/manifest.json"))continue;
      check(exists(leaf+"/README.md"),"Missing project README: "+leaf);
      check(exists(leaf+"/design.md"),"Missing project design.md: "+leaf);
      check(contents.includes("./"+encodeURIComponent(name)+"/README.md")||
            contents.includes("./"+encodeURIComponent(name)+"/design.md"),
        "Style README lacks project: "+leaf);
    }
  }
}
const toolIndex=read("Tools/README.md");
for(const tool of dirs("Tools"))
  check(toolIndex.includes("./"+tool+"/"),"Tools index lacks "+tool);
const projects=[
  "ui-designs/youtube/glassmorphism/youtube-ambient-light",
  "ui-designs/youtube/utilities/youtube-ad-guard"
];
const catalog=JSON.parse(read("docs/catalog.json"));
for(const target of projects){
  check(exists(target+"/manifest.json"),"Missing YouTube extension: "+target);
  check(exists(target+"/design.md"),"Missing YouTube design notes: "+target);
  check(exists(target+"/README.md"),"Missing YouTube README: "+target);
  if(exists(target+"/gallery.json")){
    const meta=JSON.parse(read(target+"/gallery.json"));
    check(meta.category==="tool","Platform extension category changed: "+target);
  }
  check(catalog.projects.some(item=>item.folder===target&&item.category==="tool"),
    "Missing Tool-category catalog item: "+target);
}
check(!catalog.projects.some(item=>item.folder.startsWith("youtube/")||
  item.folder==="ui-designs/youtube-ambient-light"),
  "Legacy YouTube folder in catalog");
if(errors.length){
  for(const e of errors)console.error("ERROR "+e);
  console.error("FAIL: "+errors.length+" navigation issues");
  process.exitCode=1;
}else console.log("PASS: "+platforms.length+" platforms with linked styles, designs and YouTube utilities.");

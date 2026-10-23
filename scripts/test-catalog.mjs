#!/usr/bin/env node
/** Integration test: new tool and UI platform automatically appear in catalog. */
import fs from "node:fs";
import path from "node:path";
import {execFileSync} from "node:child_process";
import {fileURLToPath} from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const tool=path.join(root,"Tools","catalog-auto-test-tool");
const ui=path.join(root,"ui-designs","catalog-auto-test-platform","minimal","sample");
const catalog=()=>JSON.parse(fs.readFileSync(path.join(root,"docs","catalog.json"),"utf8")).projects;
const build=()=>execFileSync(process.execPath,["scripts/build-catalog.mjs"],{cwd:root,encoding:"utf8"});
let failure;
try {
  if(fs.existsSync(tool)||fs.existsSync(ui))throw new Error("Reserved test folders already exist");
  const before=catalog().length;
  fs.mkdirSync(tool,{recursive:true});
  fs.writeFileSync(path.join(tool,"manifest.json"),JSON.stringify({manifest_version:3,name:"Fixture Tool",description:"Test tool",version:"0.1.0"}));
  fs.writeFileSync(path.join(tool,"README.md"),"# Test tool\n");
  fs.writeFileSync(path.join(tool,"gallery.json"),JSON.stringify({platform:"browser",author:{name:"Example",url:"https://github.com/example"}}));
  fs.mkdirSync(ui,{recursive:true});
  fs.writeFileSync(path.join(ui,"manifest.json"),JSON.stringify({manifest_version:3,name:"Fixture UI",description:"Test UI",version:"0.1.0"}));
  fs.writeFileSync(path.join(ui,"design.md"),"# Test UI\n");
  build();
  const after=catalog();
  if(after.length!==before+2)throw new Error("New projects were not discovered");
  if(!after.some(p=>p.folder==="Tools/catalog-auto-test-tool"&&p.author?.name==="Example"))throw new Error("Tool or author metadata missing");
  if(!after.some(p=>p.folder==="ui-designs/catalog-auto-test-platform/minimal/sample"&&p.category==="ui"))throw new Error("UI platform missing");
  console.log("PASS: new tools and UI platforms automatically appear in the generated catalog.");
}catch(e){failure=e}
finally{
  fs.rmSync(tool,{recursive:true,force:true});
  fs.rmSync(path.join(root,"ui-designs","catalog-auto-test-platform"),{recursive:true,force:true});
  build();
}
if(failure)throw failure;

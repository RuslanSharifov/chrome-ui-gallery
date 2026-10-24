import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const config=JSON.parse(fs.readFileSync(path.join(root,"docs/support-config.json"),"utf8"));
if(config.provider!=="ko-fi"||!/^[A-Za-z0-9_-]{2,64}$/.test(config.account)||typeof config.enabled!=="boolean")throw Error("Invalid support-config.json");
const account=config.account;
const funding=path.join(root,".github/FUNDING.yml");
fs.writeFileSync(funding,config.enabled?"ko_fi: "+account+"\n":"# Support links are disabled in docs/support-config.json\n");
const readmePath=path.join(root,"README.md");
let readme=fs.readFileSync(readmePath,"utf8");
readme=readme.replace(/https:\/\/ko-fi\.com\/[A-Za-z0-9_-]+/g,"https://ko-fi.com/"+account);
if(!config.enabled){readme=readme.replace(/\| Support the project \|.*\n/g,"");}
fs.writeFileSync(readmePath,readme);
console.log("GitHub metadata synchronized from docs/support-config.json");

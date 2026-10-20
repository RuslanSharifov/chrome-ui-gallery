#!/usr/bin/env node
/** Dependency-free local HTTP preview for docs/. */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..","docs");
const mime={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".ico":"image/x-icon"};
const server=http.createServer((request,response)=>{
  let decoded;
  try{decoded=decodeURIComponent(new URL(request.url,"http://localhost").pathname)}
  catch{response.writeHead(400).end("Invalid URL");return}
  const target=path.resolve(root,"."+decoded.replace(/\/$/,"/index.html"));
  if(!(target===root||target.startsWith(root+path.sep))||path.basename(target).startsWith(".")){
    response.writeHead(403).end("Forbidden");return;
  }
  fs.readFile(target,(error,body)=>{
    if(error){response.writeHead(404).end("Not found");return}
    response.writeHead(200,{"Content-Type":mime[path.extname(target)]??"application/octet-stream","X-Content-Type-Options":"nosniff"});
    response.end(body);
  });
});
server.listen(4173,"127.0.0.1",()=>console.log("Gallery preview: http://127.0.0.1:4173/ (Ctrl+C to stop)"));

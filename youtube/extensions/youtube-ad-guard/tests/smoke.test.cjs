"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),read=f=>fs.readFileSync(path.join(root,f),"utf8");
test("manifest is MV3 and referenced resources exist",()=>{
 const m=JSON.parse(read("manifest.json"));
 assert.equal(m.manifest_version,3);
 assert.ok(m.permissions.includes("storage"));
 assert.ok(m.permissions.includes("declarativeNetRequest"));
 for(const f of [m.background.service_worker,m.action.default_popup,
   m.declarative_net_request.rule_resources[0].path,...m.content_scripts.flatMap(x=>x.js||[])])
   assert.ok(fs.existsSync(path.join(root,f)),f);
 assert.equal(m.declarative_net_request.rule_resources[0].enabled,false);
});
test("rules are scoped to YouTube and do not target normal video",()=>{
 const rules=JSON.parse(read("rules/ads.json"));
 assert.ok(rules.length>=4);
 assert.equal(new Set(rules.map(r=>r.id)).size,rules.length);
 for(const rule of rules){
  assert.equal(rule.action.type,"block");
  assert.deepEqual(rule.condition.initiatorDomains,["youtube.com"]);
  assert.ok(rule.condition.urlFilter.startsWith("||"));
  assert.doesNotMatch(rule.condition.urlFilter,/videoplayback|youtubei\/v1\/player/);
 }
});
test("JavaScript syntax and independent switches",()=>{
 for(const f of ["background.js","content.js","popup.js"])
  assert.doesNotThrow(()=>new vm.Script(read(f),{filename:f}));
 const html=read("popup.html");
 assert.match(html,/id="block"/);assert.match(html,/id="skip"/);
 assert.match(html,/https:\/\/ko-fi.com\/ruslansharifov/);
 assert.match(html,/https:\/\/github.com\/RuslanSharifov\/chrome-ui-gallery/);
});

"use strict";
// All settings stay local. A single static ruleset is enabled/disabled atomically.
const DEFAULTS = {adBlockEnabled:true, autoSkipEnabled:true};
const RULESET = "youtube_ads";
let queue = Promise.resolve();
function reconcile() {
  queue = queue.catch(console.warn).then(async () => {
    const {adBlockEnabled} = await chrome.storage.local.get(DEFAULTS);
    const enabled = (await chrome.declarativeNetRequest.getEnabledRulesets()).includes(RULESET);
    if (enabled !== adBlockEnabled) {
      await chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: adBlockEnabled ? [RULESET] : [],
        disableRulesetIds: adBlockEnabled ? [] : [RULESET]
      });
    }
  });
  return queue;
}
async function status() {
  await reconcile();
  const values = await chrome.storage.local.get(DEFAULTS);
  const active = (await chrome.declarativeNetRequest.getEnabledRulesets()).includes(RULESET);
  return {adBlockEnabled:values.adBlockEnabled===true,
          autoSkipEnabled:values.autoSkipEnabled===true,networkActive:active};
}
chrome.runtime.onInstalled.addListener(() => {
  (async () => {
    const old = await chrome.storage.local.get(null);
    const missing = Object.fromEntries(Object.entries(DEFAULTS)
      .filter(([key])=>typeof old[key]!=="boolean"));
    if (Object.keys(missing).length) await chrome.storage.local.set(missing);
    await reconcile();
  })().catch(console.error);
});
chrome.runtime.onStartup.addListener(()=>{reconcile().catch(console.error);});
chrome.storage.onChanged.addListener((changes,area)=>{
  if(area==="local" && changes.adBlockEnabled) reconcile().catch(console.error);
});
chrome.runtime.onMessage.addListener((message,_sender,reply)=>{
  (async()=>{
    if(message?.type==="GET_STATUS") {
      reply({ok:true,status:await status()}); return;
    }
    if(message?.type!=="SET_PREFERENCE" ||
      !Object.hasOwn(DEFAULTS,message.key) || typeof message.value!=="boolean") {
      reply({ok:false,error:"Invalid setting"}); return;
    }
    const old = await chrome.storage.local.get(DEFAULTS);
    await chrome.storage.local.set({[message.key]:message.value});
    try {
      reply({ok:true,status:await status()});
    } catch(error) {
      await chrome.storage.local.set({[message.key]:old[message.key]});
      await reconcile().catch(console.error);
      throw error;
    }
  })().catch(err=>reply({ok:false,error:String(err.message||err)}));
  return true;
});

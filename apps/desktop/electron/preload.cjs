const {contextBridge,ipcRenderer}=require("electron");
const channels=["bridge:state","updater:state"];
contextBridge.exposeInMainWorld("galleryDesktop",Object.freeze({
  bridgeState:()=>ipcRenderer.invoke("bridge:get-state"),
  openDiagnostics:()=>ipcRenderer.invoke("diagnostics:open-folder"),
  diagnosticsPath:()=>ipcRenderer.invoke("diagnostics:get-path"),
  copyPairCode:()=>ipcRenderer.invoke("clipboard:copy-pair-code"),
  diagnosticEvent:(event,durationMs,success)=>ipcRenderer.invoke("diagnostics:ui-event",{event,durationMs,success}),
  refreshExtensions:()=>ipcRenderer.invoke("bridge:refresh"),
  setExtensionEnabled:(id,enabled)=>ipcRenderer.invoke("bridge:set-enabled",{id,enabled}),
  disconnect:()=>ipcRenderer.invoke("bridge:disconnect"),
  prepareExtension:(id)=>ipcRenderer.invoke("extensions:prepare",id),
  openChromeExtensions:()=>ipcRenderer.invoke("extensions:open-chrome"),
  openExternal:(url)=>ipcRenderer.invoke("shell:open-external",url),
  updaterState:()=>ipcRenderer.invoke("updater:get-state"),
  checkUpdates:()=>ipcRenderer.invoke("updater:check"),
  installUpdate:()=>ipcRenderer.invoke("updater:install"),
  onBridgeChange:(cb)=>{const fn=(_,s)=>cb(s);ipcRenderer.on(channels[0],fn);return()=>ipcRenderer.removeListener(channels[0],fn)},
  onUpdaterChange:(cb)=>{const fn=(_,s)=>cb(s);ipcRenderer.on(channels[1],fn);return()=>ipcRenderer.removeListener(channels[1],fn)}
}));

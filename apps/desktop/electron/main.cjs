const {app,BrowserWindow,ipcMain,shell,session}=require("electron");
const path=require("node:path");
const {createBridge}=require("./bridge.cjs");
const {autoUpdater}=require("electron-updater");
const {prepareInstaller,openChromeExtensions}=require("./install.cjs");
let win,bridge;
let updaterState={status:"idle",message:"Updates are checked automatically in installed builds.",progress:0};
function update(patch){updaterState={...updaterState,...patch};if(win&&!win.isDestroyed())win.webContents.send("updater:state",updaterState)}
const isDev=!app.isPackaged;
function createWindow(){
 win=new BrowserWindow({width:1380,height:860,minWidth:850,minHeight:590,backgroundColor:"#090b14",title:"Chrome UI Gallery",autoHideMenuBar:true,webPreferences:{preload:path.join(__dirname,"preload.cjs"),contextIsolation:true,nodeIntegration:false,sandbox:true,webSecurity:true}});
 win.webContents.setWindowOpenHandler(({url})=>{if(/^https:\/\/(github\.com|raw\.githubusercontent\.com|ruslansharifov\.github\.io)\//.test(url))shell.openExternal(url);return{action:"deny"}});
 win.webContents.on("will-navigate",(event,url)=>{if(!url.startsWith(isDev?"http://127.0.0.1:5173/":"file://"))event.preventDefault()});
 if(isDev)win.loadURL(process.env.VITE_DEV_SERVER_URL||"http://127.0.0.1:5173");else win.loadFile(path.join(__dirname,"../dist/index.html"));
}
function setupUpdater(){autoUpdater.autoDownload=false;autoUpdater.autoInstallOnAppQuit=true;
 autoUpdater.on("checking-for-update",()=>update({status:"checking",message:"Checking for updates…"}));
 autoUpdater.on("update-available",info=>{update({status:"available",version:info.version,message:"Version "+info.version+" is available."});autoUpdater.downloadUpdate().catch(e=>update({status:"error",message:e.message}))});
 autoUpdater.on("update-not-available",()=>update({status:"current",message:"You're up to date."}));
 autoUpdater.on("download-progress",p=>update({status:"downloading",progress:Math.round(p.percent),message:"Downloading update…"}));
 autoUpdater.on("update-downloaded",info=>update({status:"ready",version:info.version,progress:100,message:"Update ready. Restart to install."}));
 autoUpdater.on("error",error=>update({status:"error",message:error.message}));
 if(app.isPackaged){const check=()=>autoUpdater.checkForUpdates().catch(e=>update({status:"error",message:e.message}));setTimeout(check,7000);setInterval(check,6*60*60*1000).unref();}
 else update({status:"development",message:"Automatic updates are available in installed release builds."});
}
app.whenReady().then(async()=>{
 session.defaultSession.setPermissionRequestHandler((_wc,_permission,callback)=>callback(false));
 bridge=createBridge(app,()=>{if(win&&!win.isDestroyed())win.webContents.send("bridge:state",bridge.state())});
 try{await bridge.start()}catch(e){console.error("Bridge unavailable",e)}
 ipcMain.handle("bridge:get-state",()=>bridge.state());
 ipcMain.handle("bridge:refresh",()=>bridge.refresh());
 ipcMain.handle("bridge:set-enabled",(_event,p)=>bridge.setEnabled(p));
 ipcMain.handle("bridge:disconnect",()=>bridge.disconnect());
 ipcMain.handle("extensions:prepare",(_event,id)=>prepareInstaller(app,shell)(id));
 ipcMain.handle("extensions:open-chrome",()=>openChromeExtensions());
 ipcMain.handle("shell:open-external",(_event,url)=>{const allowed=/^https:\/\/(github\.com\/RuslanSharifov\/chrome-ui-gallery(?:\/|$)|ruslansharifov\.github\.io\/chrome-ui-gallery(?:\/|$))/.test(url);if(!allowed)throw new Error("Blocked external URL");return shell.openExternal(url)});
 ipcMain.handle("updater:get-state",()=>updaterState);
 ipcMain.handle("updater:check",()=>app.isPackaged?autoUpdater.checkForUpdates().then(()=>updaterState):updaterState);
 ipcMain.handle("updater:install",()=>{if(updaterState.status==="ready")autoUpdater.quitAndInstall(false,true);return updaterState});
 createWindow();setupUpdater();
 app.on("activate",()=>{if(BrowserWindow.getAllWindows().length===0)createWindow()});
});
app.on("before-quit",()=>bridge?.stop());
app.on("window-all-closed",()=>{if(process.platform!=="darwin")app.quit()});

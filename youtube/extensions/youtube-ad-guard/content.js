"use strict";
(() => {
  const DEFAULTS={adBlockEnabled:true,autoSkipEnabled:true};
  const SKIPS=[
    ".ytp-ad-skip-button",
    ".ytp-ad-skip-button-modern",
    ".ytp-skip-ad-button",
    ".ytp-ad-skip-button-slot button",
    ".ytp-ad-skip-button-container button"
  ].join(",");
  const CLOSES=[
    ".ytp-ad-overlay-close-button",
    ".ytp-ad-image-overlay-close-button",
    ".ytp-ad-overlay-close-container button"
  ].join(",");
  const BLOCK_CSS=[
    "#player-ads","ytd-display-ad-renderer","ytd-ad-slot-renderer",
    "ytd-in-feed-ad-layout-renderer","ytd-promoted-sparkles-web-renderer",
    "ytd-promoted-video-renderer","ytd-search-pyv-renderer",
    "ytd-companion-slot-renderer",".ytp-ad-overlay-container",
    ".ytp-ad-image-overlay"
  ].join(",") + "{display:none!important}";
  const SKIP_CSS=".html5-video-player.ad-showing video.html5-main-video{opacity:0!important}";
  let prefs={...DEFAULTS}, timer=null, session=null;
  const styles={};
  function inject(key,css,on) {
    const old=styles[key];
    if(!on){if(old)old.remove(); delete styles[key];return;}
    if(!document.documentElement)return;
    if(!old || !old.isConnected) {
      const s=document.createElement("style");
      s.setAttribute("data-youtube-ad-guard",key);
      s.textContent=css;
      (document.head||document.documentElement).appendChild(s);
      styles[key]=s;
    }
  }
  function applyStyles(){
    inject("block",BLOCK_CSS,prefs.adBlockEnabled);
    inject("skip",SKIP_CSS,prefs.autoSkipEnabled);
  }
  function isVisible(el) {
    return el.isConnected && !el.disabled &&
      el.getAttribute("aria-disabled")!=="true" && el.getClientRects().length>0;
  }
  function clickButtons(root,selectors){
    for(const btn of root.querySelectorAll(selectors))if(isVisible(btn))btn.click();
  }
  function restore(){
    if(!session)return;
    const {video,oldMuted,oldRate,muted,spedUp}=session;
    try {
      if(video.isConnected) {
        if(spedUp && video.playbackRate===16)video.playbackRate=oldRate;
        if(muted && video.muted)video.muted=oldMuted;
      }
    } catch{/* YouTube may replace player during navigation. */}
    session=null;
  }
  function tick(){
    if(!prefs.autoSkipEnabled){restore();return;}
    // Critical guard: NEVER seek, mute or change playback speed on a normal video.
    const adPlayer=document.querySelector(".html5-video-player.ad-showing");
    if(!adPlayer){restore();return;}
    clickButtons(adPlayer,SKIPS);
    clickButtons(adPlayer,CLOSES);
    const video=adPlayer.querySelector("video.html5-main-video");
    if(!video)return;
    if(session?.video!==video){
      restore();
      session={video,oldMuted:video.muted,oldRate:video.playbackRate,muted:false,spedUp:false};
    }
    try{
      if(Number.isFinite(video.duration) && video.duration>0 &&
        video.duration-video.currentTime>0.25)
        video.currentTime=Math.max(video.currentTime,video.duration-0.15);
    }catch{/* Some streams are not seekable. */}
    try{
      if(!video.muted){video.muted=true;session.muted=true;}
      if(video.playbackRate<16){video.playbackRate=16;session.spedUp=true;}
    }catch{/* Player may reject speed/mute changes. */}
  }
  function refresh(){
    applyStyles();
    if(!prefs.autoSkipEnabled){
      if(timer!==null)clearInterval(timer);
      timer=null; restore(); return;
    }
    if(timer===null)timer=setInterval(tick,350);
    tick();
  }
  chrome.storage.local.get(DEFAULTS).then(v=>{
    prefs={adBlockEnabled:v.adBlockEnabled===true,autoSkipEnabled:v.autoSkipEnabled===true};
    refresh();
  }).catch(console.error);
  chrome.storage.onChanged.addListener((changes,area)=>{
    if(area!=="local")return;
    for(const key of Object.keys(DEFAULTS))
      if(typeof changes[key]?.newValue==="boolean")prefs[key]=changes[key].newValue;
    refresh();
  });
  document.addEventListener("DOMContentLoaded",applyStyles,{once:true});
  document.addEventListener("yt-navigate-finish",()=>{applyStyles();tick();});
  document.addEventListener("play",tick,true);
  window.addEventListener("pagehide",restore);
})();

/* Shared settings for the Gemini Glassmorphism popup and content script. */
(function (global) {
  "use strict";
  const STORAGE_KEY = "geminiGlassSettings";
  const DEFAULTS = Object.freeze({
    enabled:true, accent:"gold", blur:28, opacity:54, veil:10, saturation:155, shine:95, radius:18,
    fxOn:true, palette:"ocean", intensity:58, scale:100, speed:85, caustics:72, rays:48, neon:52,
    mouseGlow:true, quality:"medium", hover3d:true, dragDialogs:true
  });
  const ACCENTS = Object.freeze({
    gold:{label:"Gold",dark:"242 199 109",light:"166 107 0"},
    purple:{label:"Purple",dark:"181 167 255",light:"103 88 201"},
    cyan:{label:"Cyan",dark:"125 220 255",light:"14 116 144"},
    rose:{label:"Rose",dark:"255 143 177",light:"190 24 93"},
    emerald:{label:"Emerald",dark:"110 231 183",light:"4 120 87"}
  });
  const PALETTES = Object.freeze({
    ocean:{label:"Ocean",colors:[[.10,.72,1],[0,.95,.80],[.32,.42,1]]},
    neon:{label:"Cyberpunk",colors:[[1,.10,.68],[.10,.90,1],[.56,.22,1]]},
    aurora:{label:"Aurora",colors:[[.20,1,.55],[.55,.35,1],[.10,.85,1]]},
    sunset:{label:"Sunset",colors:[[1,.50,.20],[1,.25,.55],[.60,.30,1]]},
    accent:{label:"Accent",colors:null}
  });
  const PRESETS = Object.freeze({
    underwater:{label:"Underwater",patch:{fxOn:true,palette:"ocean",intensity:62,scale:100,speed:85,caustics:92,rays:65,neon:25,mouseGlow:true,blur:30,opacity:50,veil:9}},
    cyberpunk:{label:"Cyberpunk",patch:{fxOn:true,palette:"neon",intensity:72,scale:92,speed:125,caustics:28,rays:22,neon:92,mouseGlow:true,blur:26,opacity:50,veil:10}},
    aurora:{label:"Aurora",patch:{fxOn:true,palette:"aurora",intensity:58,scale:118,speed:68,caustics:44,rays:58,neon:68,mouseGlow:true,blur:32,opacity:54,veil:10}},
    calm:{label:"Calm",patch:{fxOn:true,palette:"accent",intensity:32,scale:140,speed:42,caustics:36,rays:28,neon:28,mouseGlow:false,blur:34,opacity:62,veil:18}},
    minimal:{label:"Minimal",patch:{fxOn:false,blur:24,opacity:66,veil:18}}
  });
  const has=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
  function clamp(n,min,max,f){n=Number(n);return Number.isFinite(n)?Math.min(max,Math.max(min,n)):f;}
  function normalize(raw){
    const s=Object.assign({},DEFAULTS,raw&&typeof raw==="object"?raw:{});
    return {
      enabled:Boolean(s.enabled),accent:has(ACCENTS,s.accent)?s.accent:DEFAULTS.accent,
      blur:clamp(s.blur,8,60,28),opacity:clamp(s.opacity,10,92,54),veil:clamp(s.veil,0,45,10),
      saturation:clamp(s.saturation,100,240,155),shine:clamp(s.shine,0,200,95),radius:clamp(s.radius,6,36,18),
      fxOn:Boolean(s.fxOn),palette:has(PALETTES,s.palette)?s.palette:DEFAULTS.palette,
      intensity:clamp(s.intensity,0,100,58),scale:clamp(s.scale,40,240,100),speed:clamp(s.speed,0,250,85),
      caustics:clamp(s.caustics,0,100,72),rays:clamp(s.rays,0,100,48),neon:clamp(s.neon,0,100,52),
      mouseGlow:Boolean(s.mouseGlow),quality:["low","medium","high"].includes(s.quality)?s.quality:"medium",
      hover3d:Boolean(s.hover3d),dragDialogs:Boolean(s.dragDialogs)
    };
  }
  function rotateHue([r,g,b],deg){
    const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;let h=0;
    if(d){if(max===r)h=((g-b)/d)%6;else if(max===g)h=(b-r)/d+2;else h=(r-g)/d+4;}
    h=((h*60+deg)%360+360)%360;const l=(max+min)/2,s=d?d/(1-Math.abs(2*l-1)):0,c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;
    const q=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];
    return [q[0]+m,q[1]+m,q[2]+m];
  }
  function paletteColors(s){const p=PALETTES[s.palette];if(p&&p.colors)return p.colors;const b=ACCENTS[s.accent].dark.split(" ").map(v=>Number(v)/255);return [b,rotateHue(b,150),rotateHue(b,230)];}
  async function load(){const d=await chrome.storage.local.get([STORAGE_KEY]);return normalize(d[STORAGE_KEY]);}
  async function save(s){await chrome.storage.local.set({[STORAGE_KEY]:normalize(s)});}
  global.GUG={STORAGE_KEY,DEFAULTS,ACCENTS,PALETTES,PRESETS,normalize,paletteColors,load,save};
})(globalThis);

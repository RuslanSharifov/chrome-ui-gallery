/* Shared settings for Gemini Claymorphism. */
(function (global) {
  "use strict";
  const STORAGE_KEY = "geminiClaySettings";
  const DEFAULTS = Object.freeze({
    enabled: true, palette: "sky", cloudSpeed: 44, cloudSize: 100,
    cloudCount: 6, cloudOpacity: 78, cloudDepth: 72, parallax: true,
    panelOpacity: 78, shadow: 46, radius: 28, hover3d: true
  });
  const PALETTES = Object.freeze({
    sky: {label:"Sky", bg:"232 239 247", surface:"244 247 251", surface2:"224 232 242", ink:"54 64 78", accent:"104 151 190", cloud:["247 249 252","229 236 244","203 215 229"]},
    lavender: {label:"Lavender", bg:"239 236 247", surface:"248 246 252", surface2:"229 224 241", ink:"68 61 82", accent:"139 120 177", cloud:["252 250 255","236 230 247","210 201 228"]},
    peach: {label:"Peach", bg:"247 238 231", surface:"253 248 244", surface2:"239 225 215", ink:"86 67 58", accent:"190 128 103", cloud:["255 252 248","244 231 221","221 201 190"]},
    mint: {label:"Mint", bg:"229 242 237", surface:"245 251 248", surface2:"219 234 227", ink:"53 72 65", accent:"91 148 128", cloud:["249 253 251","225 239 233","197 218 209"]},
    dusk: {label:"Dusk", bg:"29 34 45", surface:"47 53 66", surface2:"37 43 55", ink:"238 241 247", accent:"157 181 211", cloud:["112 124 143","82 94 113","58 69 87"]}
  });
  const PRESETS = Object.freeze({
    cloudscape:{label:"Cloudscape",patch:{palette:"sky",cloudSpeed:44,cloudSize:100,cloudCount:6,cloudOpacity:78,cloudDepth:72,panelOpacity:78,shadow:46,radius:28}},
    lavender:{label:"Lavender",patch:{palette:"lavender",cloudSpeed:34,cloudSize:112,cloudCount:5,cloudOpacity:72,cloudDepth:66,panelOpacity:76,shadow:42,radius:30}},
    warm:{label:"Warm",patch:{palette:"peach",cloudSpeed:52,cloudSize:92,cloudCount:7,cloudOpacity:74,cloudDepth:78,panelOpacity:80,shadow:48,radius:26}},
    mint:{label:"Mint",patch:{palette:"mint",cloudSpeed:38,cloudSize:106,cloudCount:6,cloudOpacity:76,cloudDepth:70,panelOpacity:79,shadow:44,radius:28}},
    calm:{label:"Calm",patch:{palette:"sky",cloudSpeed:18,cloudSize:132,cloudCount:4,cloudOpacity:58,cloudDepth:54,panelOpacity:84,shadow:34,radius:32}}
  });
  const has=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
  const clamp=(v,min,max,f)=>{const n=Number(v);return Number.isFinite(n)?Math.min(max,Math.max(min,n)):f;};
  function normalize(raw){
    const s=Object.assign({},DEFAULTS,raw&&typeof raw==="object"?raw:{});
    return {
      enabled:Boolean(s.enabled), palette:has(PALETTES,s.palette)?s.palette:DEFAULTS.palette,
      cloudSpeed:clamp(s.cloudSpeed,0,100,44), cloudSize:clamp(s.cloudSize,55,180,100),
      cloudCount:Math.round(clamp(s.cloudCount,3,9,6)), cloudOpacity:clamp(s.cloudOpacity,20,100,78),
      cloudDepth:clamp(s.cloudDepth,20,100,72), parallax:Boolean(s.parallax),
      panelOpacity:clamp(s.panelOpacity,48,94,78), shadow:clamp(s.shadow,15,75,46),
      radius:clamp(s.radius,14,42,28), hover3d:Boolean(s.hover3d)
    };
  }
  async function load(){const d=await chrome.storage.local.get([STORAGE_KEY]);return normalize(d[STORAGE_KEY]);}
  async function save(s){await chrome.storage.local.set({[STORAGE_KEY]:normalize(s)});}
  global.GUG={STORAGE_KEY,DEFAULTS,PALETTES,PRESETS,normalize,load,save};
})(globalThis);

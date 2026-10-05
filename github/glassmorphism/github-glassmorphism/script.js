(()=>{
'use strict';
const $=id=>document.getElementById(id);

const DEFAULTS={
  // Core
  enabled:true,
  theme:'aurora',
  
  // Glass effects
  blur:24,
  opacity:58,
  shine:72,
  radius:18,
  saturation:155,
  contrast:94,
  dim:0,
  borders:true,
  
  // Ambient light
  ambient:true,
  
  // Mouse light
  mouseLight:true,
  mouseLightSize:420,
  mouseLightStrength:55,
  
  // 3D Depth & Proximity
  depth3d:true,
  depthStrength:12,
  perspective:900,
  proximitySensitivity:150,
  proximityDistance:200,
  
  // Card tilt & lift
  cardTilt:true,
  cardLift:5,
  
  // Motion & animations
  pageMotion:true,
  loadMotion:true,
  motionSpeed:55,
  
  // Visual effects
  glow:true,
  glowIntensity:35,
  
  // Matrix background
  matrix:false,
  matrixDensity:55,
  matrixSpeed:48
};

const PRESETS={
  Aurora:{theme:'aurora',blur:24,opacity:58,shine:72,saturation:155,ambient:true,mouseLight:true,depth3d:true,cardTilt:true,glow:true,glowIntensity:35,proximitySensitivity:150},
  Matrix:{theme:'matrix',blur:20,opacity:62,shine:55,saturation:125,ambient:true,mouseLight:true,depth3d:true,cardTilt:true,matrix:true,matrixDensity:58,matrixSpeed:52,glow:true},
  Ice:{theme:'ice',blur:30,opacity:50,shine:94,saturation:140,ambient:true,mouseLight:true,depth3d:true,depthStrength:10,cardTilt:true,proximitySensitivity:180},
  Neon:{theme:'neon',blur:18,opacity:54,shine:100,saturation:185,ambient:true,mouseLight:true,depth3d:true,depthStrength:16,cardTilt:true,glow:true,glowIntensity:45},
  Midnight:{theme:'midnight',blur:34,opacity:72,shine:42,saturation:125,ambient:true,mouseLight:false,depth3d:true,depthStrength:9,cardTilt:true,glow:true},
  Minimal:{theme:'minimal',blur:14,opacity:42,shine:25,saturation:110,ambient:false,mouseLight:false,depth3d:false,cardTilt:false,glow:false}
};

let settings={...DEFAULTS}, refs={};
const groups={
  theme:$('panel-theme'),
  glass:$('panel-glass'),
  depth:$('panel-depth'),
  motion:$('panel-motion')
};

function slider(parent,key,label,unit,min,max,step=1){
  const row=document.createElement('label');
  row.className='slider';
  const top=document.createElement('span');
  const name=document.createElement('b');
  name.textContent=label;
  const out=document.createElement('output');
  top.append(name,out);
  const input=document.createElement('input');
  Object.assign(input,{type:'range',min,max,step});
  row.append(top,input);
  parent.append(row);
  refs[key]={input,out,unit};
  input.addEventListener('input',()=>{
    settings[key]=step<1?Number(input.value):Number(input.value);
    settings.preset='Custom';
    render();
    broadcast();
  });
  return row;
}

function select(parent,key,label,options){
  const row=document.createElement('label');
  row.className='select-row';
  const span=document.createElement('span');
  span.textContent=label;
  const sel=document.createElement('select');
  options.forEach(([v,t])=>{
    const o=document.createElement('option');
    o.value=v;
    o.textContent=t;
    sel.append(o)
  });
  row.append(span,sel);
  parent.append(row);
  refs[key]=sel;
  sel.onchange=()=>{
    settings[key]=sel.value;
    settings.preset='Custom';
    render();
    broadcast();
  };
}

function toggle(parent,key,label,desc=''){
  const row=document.createElement('div');
  row.className='row';
  const copy=document.createElement('div');
  copy.className='row-copy';
  const t=document.createElement('b');
  t.textContent=label;
  copy.append(t);
  if(desc){
    const d=document.createElement('small');
    d.textContent=desc;
    copy.append(d)
  }
  const b=document.createElement('button');
  b.className='switch';
  b.type='button';
  b.setAttribute('role','switch');
  b.innerHTML='<span></span>';
  b.onclick=()=>{
    settings[key]=!settings[key];
    settings.preset='Custom';
    render();
    broadcast();
  };
  row.append(copy,b);
  parent.append(row);
  refs[key]=b;
}

// Theme panel
select(groups.theme,'theme','Visual theme',[
  ['aurora','Aurora Glass'],
  ['matrix','X-Matrix / Green'],
  ['ice','Ice Light'],
  ['neon','Neon Pulse'],
  ['midnight','Midnight'],
  ['minimal','Minimal Glass']
]);
slider(groups.theme,'saturation','Color intensity','%',90,210);
slider(groups.theme,'contrast','Text contrast','%',70,120);
toggle(groups.theme,'ambient','Ambient glow','Soft layered light background');

// Glass panel - new detailed glass controls
slider(groups.glass,'blur','Glass blur amount','px',6,46);
slider(groups.glass,'opacity','Glass opacity','%',25,82);
slider(groups.glass,'radius','Corner radius','px',6,30);
slider(groups.glass,'shine','Edge shine','%',0,120);
slider(groups.glass,'dim','Background dim','%',0,45);
toggle(groups.glass,'borders','Glass borders','Fine luminous outlines');

// Depth panel - 3D and proximity effects
toggle(groups.depth,'depth3d','3D depth effect','Surfaces respond to cursor');
slider(groups.depth,'depthStrength','Depth strength','%',0,28);
slider(groups.depth,'perspective','Perspective distance','px',500,1600);
slider(groups.depth,'proximityDistance','Proximity distance','px',80,400);
slider(groups.depth,'proximitySensitivity','Proximity sensitivity','%',50,300);
toggle(groups.depth,'cardTilt','Card tilt','Cards tilt toward pointer');
slider(groups.depth,'cardLift','Card lift height','px',0,14);
toggle(groups.depth,'mouseLight','Mouse spotlight','Light follows your cursor');
slider(groups.depth,'mouseLightSize','Light size','px',160,800);
slider(groups.depth,'mouseLightStrength','Light strength','%',0,100);
toggle(groups.depth,'glow','Neon glow effect','Highlight on hover');
slider(groups.depth,'glowIntensity','Glow intensity','%',10,80);

// Motion panel
slider(groups.motion,'motionSpeed','Motion speed','%',0,100);
toggle(groups.motion,'pageMotion','Smooth transitions','Buttons and cards animate');
toggle(groups.motion,'loadMotion','Load animations','Content reveals on page load');
toggle(groups.motion,'matrix','Matrix background','Animated falling code');
slider(groups.motion,'matrixDensity','Matrix density','%',10,100);
slider(groups.motion,'matrixSpeed','Matrix speed','%',10,100);

function presetButtons(){
  Object.keys(PRESETS).forEach(name=>{
    const b=document.createElement('button');
    b.className='pill';
    b.textContent=name;
    b.type='button';
    b.dataset.preset=name;
    b.onclick=()=>{
      settings={...settings,...PRESETS[name],preset:name};
      render();
      broadcast();
    };
    $('presets').append(b)
  })
}

presetButtons();

document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{
  document.querySelectorAll('.tab').forEach(x=>x.setAttribute('aria-selected',String(x===t)));
  Object.keys(groups).forEach(x=>groups[x].hidden=x!==t.dataset.tab)
});

$('enabled').onclick=()=>{
  settings.enabled=!settings.enabled;
  render();
  broadcast();
};

$('reset').onclick=()=>{
  settings={...DEFAULTS,preset:'Aurora'};
  render();
  broadcast();
  save();
};

$('save').onclick=save;

function render(){
  $('enabled').setAttribute('aria-checked',String(settings.enabled));
  $('stateText').textContent=settings.enabled?`Live · ${String(settings.theme).replace(/^./,c=>c.toUpperCase())}`:'Disabled';
  
  Object.entries(refs).forEach(([key,el])=>{
    if(el instanceof HTMLSelectElement){
      el.value=settings[key];
    }else if(el.input){
      el.input.value=settings[key];
      el.out.textContent=settings[key]+el.unit
    }else {
      el.setAttribute('aria-checked',String(!!settings[key]))
    }
  });
  
  document.querySelectorAll('.pill').forEach(b=>b.setAttribute('aria-pressed',b.dataset.preset===settings.preset));
}

async function broadcast(){
  await chrome.storage.local.set({githubGlass:settings});
  try{
    const[t]=await chrome.tabs.query({active:true,currentWindow:true});
    if(t?.id)await chrome.tabs.sendMessage(t.id,{type:'GITHUB_GLASS_UPDATE',settings})
  }catch{}
}

async function save(){
  await chrome.storage.local.set({githubGlass:settings});
  $('saveState').textContent='Saved ✓';
  setTimeout(()=>$('saveState').textContent='',1300)
}

chrome.tabs.query({active:true,currentWindow:true}).then(([t])=>{
  $('tabNotice').hidden=/^https:\/\/github\.com\//.test(t?.url||'')
}).catch(()=>{});

chrome.storage.local.get('githubGlass').then(r=>{
  settings={...DEFAULTS,...(r.githubGlass||{})};
  render()
});

/* GUG v4.1+ popup hardening: additive only. */
(function installPopupHardening(){
  const normalizeNumber=(value,fallback,min,max)=>{
    const n=Number(value);
    if(!Number.isFinite(n))return fallback;
    return Math.min(max,Math.max(min,n));
  };

  const bounds={
    blur:[6,46],opacity:[25,82],shine:[0,120],radius:[6,30],saturation:[90,210],contrast:[70,120],dim:[0,45],
    mouseLightSize:[160,800],mouseLightStrength:[0,100],depthStrength:[0,28],perspective:[500,1600],
    proximitySensitivity:[50,300],proximityDistance:[80,400],cardLift:[0,14],motionSpeed:[0,100],
    glowIntensity:[10,80],matrixDensity:[10,100],matrixSpeed:[10,100]
  };

  const sanitizeSettings=value=>{
    const next={...DEFAULTS};
    const source=value&&typeof value==='object'?value:{};
    Object.keys(DEFAULTS).forEach(key=>{
      if(typeof DEFAULTS[key]==='boolean')next[key]=Boolean(source[key]??DEFAULTS[key]);
      else if(typeof DEFAULTS[key]==='number'){
        const [min,max]=bounds[key]||[-1e6,1e6];
        next[key]=normalizeNumber(source[key],DEFAULTS[key],min,max);
      }else next[key]=typeof source[key]==='string'?source[key]:DEFAULTS[key];
    });
    if(!['aurora','matrix','ice','neon','midnight','minimal'].includes(next.theme))next.theme=DEFAULTS.theme;
    next.preset=typeof source.preset==='string'?source.preset:'Aurora';
    return next;
  };

  const originalBroadcast=broadcast;
  broadcast=async function(){
    settings=sanitizeSettings(settings);
    try{ await chrome.storage.local.set({githubGlass:settings}); }catch(e){ console.warn('GitHub Glass: storage write failed',e); }
    try{
      const[t]=await chrome.tabs.query({active:true,currentWindow:true});
      if(t?.id)await chrome.tabs.sendMessage(t.id,{type:'GITHUB_GLASS_UPDATE',settings});
    }catch{}
  };

  const originalSave=save;
  save=async function(){
    settings=sanitizeSettings(settings);
    try{
      await chrome.storage.local.set({githubGlass:settings});
      $('saveState').textContent='Saved ✓';
    }catch{
      $('saveState').textContent='Could not save';
    }
    setTimeout(()=>$('saveState').textContent='',1300);
  };

  // Keep the original UI flow while ensuring persisted values cannot escape slider ranges.
  chrome.storage.local.get('githubGlass').then(r=>{
    settings=sanitizeSettings(r.githubGlass||{});
    settings.preset=r.githubGlass?.preset||settings.preset;
    render();
  }).catch(()=>render());

  const version=document.getElementById('version');
  if(version)version.textContent='v4.1';
})();

})();

(()=>{
'use strict';
const D={
  enabled:true,theme:'aurora',blur:24,opacity:58,shine:72,radius:18,saturation:155,
  contrast:94,dim:0,borders:true,ambient:true,mouseLight:true,mouseLightSize:420,
  mouseLightStrength:55,depth3d:true,depthStrength:12,perspective:900,proximitySensitivity:150,
  proximityDistance:200,cardTilt:true,cardLift:5,pageMotion:true,loadMotion:true,
  motionSpeed:55,glow:true,glowIntensity:35,matrix:false,matrixDensity:55,matrixSpeed:48
};

const root=document.documentElement;
let settings={...D}, raf=0, lastX=0, lastY=0;
let matrixCanvas=null, ctx=null, matrixTimer=0;

const cardSelector=':is(.Box,.Box-row,.flash,.blankslate,.UnderlineNav,.SideNav,.Popover,.SelectMenu,.js-notifications-list,.repository-content .BorderGrid-cell,.feed-item,.TimelineItem,.js-discussion,.js-issue-row,.js-navigation-item,.Header,[data-testid="header"])';

function ensureAmbient(){
  let a=document.getElementById('gug-ambient');
  if(!a){
    a=document.createElement('div');
    a.id='gug-ambient';
    a.setAttribute('aria-hidden','true');
    document.documentElement.append(a)
  }
  return a
}

function remove(id){
  document.getElementById(id)?.remove()
}

function setupMatrix(){
  if(settings.matrix||settings.theme==='matrix'){
    if(!matrixCanvas){
      matrixCanvas=document.createElement('canvas');
      matrixCanvas.id='gug-matrix';
      matrixCanvas.setAttribute('aria-hidden','true');
      document.documentElement.append(matrixCanvas);
      ctx=matrixCanvas.getContext('2d')
    }
    resizeMatrix();
    cancelAnimationFrame(matrixTimer);
    drawMatrix()
  }else{
    cancelAnimationFrame(matrixTimer);
    remove('gug-matrix');
    matrixCanvas=null;
    ctx=null
  }
}

function resizeMatrix(){
  if(!matrixCanvas)return;
  matrixCanvas.width=Math.max(1,innerWidth*devicePixelRatio);
  matrixCanvas.height=Math.max(1,innerHeight*devicePixelRatio);
  matrixCanvas.style.width='100%';
  matrixCanvas.style.height='100%';
  ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0)
}

let drops=[];
function drawMatrix(){
  if(!ctx||!matrixCanvas)return;
  const w=innerWidth,h=innerHeight;
  const density=Math.max(10,settings.matrixDensity);
  const font=Math.max(10,Math.round(w/Math.max(70,density)));
  const cols=Math.ceil(w/font);
  if(drops.length!==cols)drops=Array.from({length:cols},()=>Math.random()*h/font);
  ctx.fillStyle='rgba(0,5,2,.13)';
  ctx.fillRect(0,0,w,h);
  ctx.font=`${font}px ui-monospace,monospace`;
  ctx.fillStyle='rgba(74,255,142,.75)';
  for(let i=0;i<cols;i++){
    const chars='アカサタナ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const x=i*font;
    const y=drops[i]*font;
    ctx.fillText(chars[Math.floor(Math.random()*chars.length)],x,y);
    if(y>h&&Math.random()>0.975)drops[i]=0;
    else drops[i]+=Math.max(.2,settings.matrixSpeed/70)
  }
  matrixTimer=requestAnimationFrame(drawMatrix)
}

function apply(x){
  settings={...D,...(x||{})};
  root.toggleAttribute('data-gug-glass',!!settings.enabled);
  root.dataset.gugTheme=settings.theme;
  root.dataset.gugHover=String(!!settings.pageMotion);
  root.dataset.gugMotion=String(!!settings.pageMotion);
  root.dataset.gugLoad=String(!!settings.loadMotion);
  root.dataset.gugDepth=String(!!settings.depth3d);
  root.dataset.gugTilt=String(!!settings.cardTilt);
  root.dataset.gugGlow=String(!!settings.glow);
  root.dataset.gugBorders=String(!!settings.borders);
  
  const vars={
    blur:settings.blur+'px',
    alpha:settings.opacity/100,
    shine:settings.shine/100,
    radius:settings.radius+'px',
    sat:settings.saturation+'%',
    contrast:settings.contrast+'%',
    dim:settings.dim/100,
    lightSize:settings.mouseLightSize+'px',
    lightStrength:settings.mouseLightStrength/100,
    depth:settings.depthStrength,
    perspective:settings.perspective+'px',
    lift:settings.cardLift+'px',
    speed:Math.max(.1,settings.motionSpeed/50)+'s',
    glowIntensity:settings.glowIntensity/100,
    proximitySensitivity:settings.proximitySensitivity/100,
    proximityDistance:settings.proximityDistance+'px',
    matrixSpeed:settings.matrixSpeed
  };
  Object.entries(vars).forEach(([k,v])=>root.style.setProperty('--gug-'+k,v));
  
  let a=ensureAmbient();
  a.hidden=!settings.enabled||!settings.ambient||settings.theme==='minimal';
  if(!settings.enabled)a.hidden=true;
  setupMatrix();
  
  if(settings.enabled&&!settings._loadedOnce&&settings.loadMotion){
    root.dataset.gugLoadNow='true';
    setTimeout(()=>root.dataset.gugLoadNow='false',900);
    settings._loadedOnce=true
  }
}

function calculateProximity(element, mouseX, mouseY){
  const rect=element.getBoundingClientRect();
  const centerX=rect.left+rect.width/2;
  const centerY=rect.top+rect.height/2;
  const dist=Math.hypot(mouseX-centerX, mouseY-centerY);
  return Math.max(0, 1-(dist/settings.proximityDistance));
}

function pointerMove(e){
  if(!settings.enabled)return;
  lastX=e.clientX;
  lastY=e.clientY;
  root.style.setProperty('--gug-mx',lastX+'px');
  root.style.setProperty('--gug-my',lastY+'px');
  
  if(!settings.depth3d&&!settings.cardTilt)return;
  if(raf)return;
  
  raf=requestAnimationFrame(()=>{
    raf=0;
    document.querySelectorAll(cardSelector).forEach(el=>{
      const r=el.getBoundingClientRect();
      if(r.width<30||r.height<30)return;
      
      const dx=(lastX-(r.left+r.width/2))/Math.max(1,r.width/2);
      const dy=(lastY-(r.top+r.height/2))/Math.max(1,r.height/2);
      
      // Calculate proximity
      const proximityFactor=calculateProximity(el, lastX, lastY);
      
      // Increased proximity check distance
      const checkDist=settings.proximityDistance;
      const inside=lastX>r.left-checkDist&&lastX<r.right+checkDist&&lastY>r.top-checkDist&&lastY<r.bottom+checkDist;
      
      if(!inside&&proximityFactor<0.1){
        el.style.removeProperty('--gug-rx');
        el.style.removeProperty('--gug-ry');
        el.style.removeProperty('--gug-tz');
        el.style.removeProperty('--gug-proximity');
        return
      }
      
      // Apply effects based on proximity or direct proximity
      const effectStrength=Math.max(proximityFactor,inside?1:0);
      
      if(settings.depth3d){
        const rxValue=(-dy*settings.depthStrength*0.55*effectStrength).toFixed(2);
        const ryValue=(dx*settings.depthStrength*0.55*effectStrength).toFixed(2);
        el.style.setProperty('--gug-rx',rxValue+'deg');
        el.style.setProperty('--gug-ry',ryValue+'deg');
        
        const tzValue=(-Math.abs(dx+dy)*settings.depthStrength*0.8*effectStrength).toFixed(1);
        el.style.setProperty('--gug-tz',tzValue+'px');
      }
      
      if(settings.cardTilt){
        el.style.setProperty('--gug-proximity',effectStrength.toFixed(2));
      }
    })
  })
}

chrome.storage.local.get('githubGlass').then(r=>apply(r.githubGlass)).catch(()=>apply(D));
chrome.runtime.onMessage.addListener(m=>{
  if(m?.type==='GITHUB_GLASS_UPDATE')apply(m.settings)
});

addEventListener('pointermove',pointerMove,{passive:true});
addEventListener('resize',()=>{resizeMatrix()},{passive:true});

new MutationObserver(()=>{
  if(settings.enabled&&settings.loadMotion&&!root.dataset.gugLoadNow){
    root.dataset.gugLoadNow='true';
    setTimeout(()=>root.dataset.gugLoadNow='false',500)
  }
}).observe(document.documentElement,{childList:true,subtree:true});

/* GUG v4.1+ runtime hardening: additive only. */
(function installRuntimeEnhancements(){
  const enhancementState={
    raf:0,
    lastX:0,
    lastY:0,
    cachedCards:[],
    cacheDirty:true
  };

  const refreshCardCache=()=>{
    if(!enhancementState.cacheDirty)return enhancementState.cachedCards;
    enhancementState.cachedCards=Array.from(document.querySelectorAll(cardSelector));
    enhancementState.cacheDirty=false;
    return enhancementState.cachedCards;
  };

  const clearEnhancedVars=el=>{
    el.style.removeProperty('--gug-enhanced-rx');
    el.style.removeProperty('--gug-enhanced-ry');
    el.style.removeProperty('--gug-enhanced-tz');
    el.style.removeProperty('--gug-proximity-strength');
  };

  const applyEnhancedDepth=()=>{
    enhancementState.raf=0;
    if(!settings.enabled)return;
    if(!settings.depth3d&&!settings.cardTilt)return;

    const sensitivity=Math.max(.5,Math.min(3,Number(settings.proximitySensitivity)/100||1));
    const range=Math.max(40,Number(settings.proximityDistance)||200);
    const lift=Math.max(0,Number(settings.cardLift)||0);
    const depth=Math.max(0,Number(settings.depthStrength)||0);
    const cards=refreshCardCache();

    cards.forEach(el=>{
      const rect=el.getBoundingClientRect();
      if(rect.width<30||rect.height<30||rect.bottom<0||rect.right<0||rect.left>innerWidth||rect.top>innerHeight){
        clearEnhancedVars(el);
        return;
      }
      const cx=rect.left+rect.width/2;
      const cy=rect.top+rect.height/2;
      const distance=Math.hypot(enhancementState.lastX-cx,enhancementState.lastY-cy);
      const base=Math.max(0,1-distance/range);
      const strength=Math.min(1,base*sensitivity);
      if(strength<=.01){
        clearEnhancedVars(el);
        return;
      }

      const dx=(enhancementState.lastX-cx)/Math.max(1,rect.width/2);
      const dy=(enhancementState.lastY-cy)/Math.max(1,rect.height/2);
      if(settings.depth3d){
        const rx=(-dy*depth*.55*strength).toFixed(2);
        const ry=(dx*depth*.55*strength).toFixed(2);
        const tz=(lift*strength + depth*.45*strength).toFixed(1);
        el.style.setProperty('--gug-enhanced-rx',rx+'deg');
        el.style.setProperty('--gug-enhanced-ry',ry+'deg');
        el.style.setProperty('--gug-enhanced-tz',tz+'px');
      }
      if(settings.cardTilt){
        el.style.setProperty('--gug-proximity-strength',strength.toFixed(3));
      }
    });
  };

  const onEnhancedPointerMove=e=>{
    if(!settings.enabled)return;
    enhancementState.lastX=e.clientX;
    enhancementState.lastY=e.clientY;
    if(settings.depth3d||settings.cardTilt){
      if(!enhancementState.raf)enhancementState.raf=requestAnimationFrame(applyEnhancedDepth);
    }
  };

  const observer=new MutationObserver(()=>{ enhancementState.cacheDirty=true; });
  observer.observe(document.documentElement,{childList:true,subtree:true});
  addEventListener('pointermove',onEnhancedPointerMove,{passive:true});
  addEventListener('blur',()=>refreshCardCache().forEach(clearEnhancedVars),{passive:true});
  addEventListener('mouseleave',()=>refreshCardCache().forEach(clearEnhancedVars),{passive:true});

  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  const syncMotionPreference=()=>{
    root.dataset.gugReducedMotion=String(reducedMotion.matches);
    if(reducedMotion.matches){
      cancelAnimationFrame(matrixTimer);
      if(matrixCanvas)matrixCanvas.style.display='none';
    }else{
      if(matrixCanvas)matrixCanvas.style.display='';
      if(settings.enabled)setupMatrix();
    }
  };
  syncMotionPreference();
  reducedMotion.addEventListener?.('change',syncMotionPreference);

  // Keep the original engine intact; this additive layer only supplies missing variables.
  root.style.setProperty('--gug-engine-version','4.1');
})();

})();

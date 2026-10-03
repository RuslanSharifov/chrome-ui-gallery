(function(global){
  "use strict";
  const QUALITY={low:{scale:.30,fps:24},medium:{scale:.45,fps:30},high:{scale:.70,fps:60}};
  function create(canvas){
    const gl=canvas.getContext("webgl",{alpha:false,antialias:false,powerPreference:"low-power"});
    if(!gl)return null;
    const vs="attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
    const fs="precision mediump float;uniform vec2 r;uniform float t;uniform vec2 m;uniform vec3 c1,c2,c3,b;uniform float i,s,l;void main(){vec2 u=gl_FragCoord.xy/r;float asp=r.x/r.y;vec2 q=(u-.5)*vec2(asp,1.);float tt=t*.08;vec2 p1=vec2(.34*sin(tt*.7),.30*cos(tt*.9));vec2 p2=vec2(.32*cos(tt*.55+2.),.36*sin(tt*.65+1.));vec2 p3=vec2(.40*sin(tt*.42+4.),.25*cos(tt*.72+3.));float a=exp(-dot(q-p1,q-p1)/(s*s*.35));float d=exp(-dot(q-p2,q-p2)/(s*s*.28));float e=exp(-dot(q-p3,q-p3)/(s*s*.42));float mg=exp(-dot(q-(m-.5),q-(m-.5))/.05);vec3 col=b+(c1*a+c2*d+c3*e)*i*.75+c2*mg*.18*l;col+=.015*sin(vec3(1.3,2.1,3.7)*t+u.xyx*6.);gl_FragColor=vec4(clamp(col,0.,1.),1.);}";
    function compile(type,src){const sh=gl.createShader(type);gl.shaderSource(sh,src);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));return sh;}
    let p;
    try{p=gl.createProgram();gl.attachShader(p,compile(gl.VERTEX_SHADER,vs));gl.attachShader(p,compile(gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))return null;gl.useProgram(p);}catch(_){return null;}
    const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
    const a=gl.getAttribLocation(p,"p");gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
    const loc={};["r","t","m","c1","c2","c3","b","i","s","l"].forEach(n=>loc[n]=gl.getUniformLocation(p,n));
    const state={p:{intensity:.58,scale:1,speed:.85,mouse:true,light:false,colors:[[.1,.72,1],[0,.95,.8],[.32,.42,1]],base:[.027,.035,.07],quality:"medium"},time:0,last:0,raf:0,running:false,mouse:[.5,.5],target:[.5,.5]};
    function resize(){const q=QUALITY[state.p.quality]||QUALITY.medium;canvas.width=Math.max(2,Math.round(canvas.clientWidth*q.scale));canvas.height=Math.max(2,Math.round(canvas.clientHeight*q.scale));gl.viewport(0,0,canvas.width,canvas.height);}
    function draw(){const p0=state.p;gl.uniform2f(loc.r,canvas.width,canvas.height);gl.uniform1f(loc.t,state.time);gl.uniform2f(loc.m,state.mouse[0],1-state.mouse[1]);gl.uniform3fv(loc.c1,p0.colors[0]);gl.uniform3fv(loc.c2,p0.colors[1]);gl.uniform3fv(loc.c3,p0.colors[2]);gl.uniform3fv(loc.b,p0.base);gl.uniform1f(loc.i,p0.intensity);gl.uniform1f(loc.s,p0.scale);gl.uniform1f(loc.l,p0.mouse?1:0);gl.drawArrays(gl.TRIANGLES,0,3);}
    function frame(now){state.raf=requestAnimationFrame(frame);if(document.hidden)return;const q=QUALITY[state.p.quality]||QUALITY.medium;if(now-state.last<1000/q.fps)return;const dt=Math.min(.1,(now-(state.last||now))/1000);state.last=now;state.time+=dt*state.p.speed;const e=1-Math.pow(.001,dt);state.mouse[0]+=(state.target[0]-state.mouse[0])*e;state.mouse[1]+=(state.target[1]-state.mouse[1])*e;resize();draw();}
    const move=e=>{state.target[0]=e.clientX/Math.max(1,innerWidth);state.target[1]=e.clientY/Math.max(1,innerHeight);};
    window.addEventListener("pointermove",move,{passive:true});
    return {update(x){Object.assign(state.p,x);resize();draw();},start(){if(!state.running){state.running=true;state.last=0;state.raf=requestAnimationFrame(frame);}},destroy(){state.running=false;cancelAnimationFrame(state.raf);window.removeEventListener("pointermove",move);try{gl.getExtension("WEBGL_lose_context")?.loseContext();}catch(_){}}};
  }
  function paramsFrom(s,light){return{intensity:s.intensity/100,scale:s.scale/100,speed:s.speed/100,mouse:s.mouseGlow,light,colors:GUG.paletteColors(s),base:light?[.93,.95,.98]:[.027,.035,.07],quality:s.quality};}
  global.GUGFX={create,paramsFrom};
})(globalThis);

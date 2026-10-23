/* Ambient-light renderer (WebGL 1). Renders at reduced resolution, pauses while the tab is hidden
   and falls back to the CSS blobs when WebGL is unavailable or the context is lost. */
(function (global) {
  "use strict";

  const QUALITY = {
    low: { scale: 0.3, fps: 24 },
    medium: { scale: 0.45, fps: 30 },
    high: { scale: 0.7, fps: 60 },
  };

  const VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";

  // Uniforms: r=resolution t=time m=mouse c1..c3=palette b=base colour
  //           i=intensity s=scale l=mouse-glow ca=caustics ry=rays ng=neon
  const FRAG = [
    "#ifdef GL_FRAGMENT_PRECISION_HIGH",
    "precision highp float;",
    "#else",
    "precision mediump float;",
    "#endif",
    "uniform vec2 r;uniform float t;uniform vec2 m;",
    "uniform vec3 c1,c2,c3,b;",
    "uniform float i,s,l,ca,ry,ng,mw;",
    "uniform vec2 mv;uniform vec3 rk0,rk1,rk2;",
    "vec2 rip(vec2 q,vec3 k,float asp){",
    "  if(k.z<0.)return vec2(0.);",
    "  vec2 dc=q-(k.xy-.5)*vec2(asp,1.);",
    "  float d=length(dc)+1e-4;",
    "  float R=k.z*.42;",
    "  float dd=(d-R)*11.;float ring=exp(-dd*dd);",
    "  return dc/d*ring*exp(-k.z*1.3)*sin((d-R)*34.);",
    "}",
    "void main(){",
    "  vec2 u=gl_FragCoord.xy/r;",
    "  float asp=r.x/r.y;",
    "  vec2 q0=(u-.5)*vec2(asp,1.);",
    "  vec2 mq=(m-.5)*vec2(asp,1.);",
    // cursor interaction: concentric waves around the pointer + the field is dragged along its motion
    "  vec2 dm=q0-mq;float md=length(dm)+1e-4;",
    "  float lens=exp(-md*md/.075);",
    "  vec2 wp=dm/md*sin(md*24.-t*2.4)*lens*.060*mw;",
    "  wp+=mv*lens*.55*mw;",
    // click ripples
    "  wp+=(rip(q0,rk0,asp)+rip(q0,rk1,asp)+rip(q0,rk2,asp))*.070*mw;",
    "  vec2 q=q0+wp;",
    "  float tt=t*.08;",
    "  vec2 p1=vec2(.34*sin(tt*.7),.30*cos(tt*.9));",
    "  vec2 p2=vec2(.32*cos(tt*.55+2.),.36*sin(tt*.65+1.));",
    "  vec2 p3=vec2(.40*sin(tt*.42+4.),.25*cos(tt*.72+3.));",
    "  float a=exp(-dot(q-p1,q-p1)/(s*s*.35));",
    "  float d=exp(-dot(q-p2,q-p2)/(s*s*.28));",
    "  float e=exp(-dot(q-p3,q-p3)/(s*s*.42));",
    // mouse is aspect-corrected so the glow sits exactly under the cursor on wide screens
    "  float mg=exp(-dot(q0-mq,q0-mq)/.05);",
    "  vec3 col=b+(c1*a+c2*d+c3*e)*i*.75+c2*mg*.18*l;",
    // caustics: interference of two warped sine fields -> thin bright water lines
    "  vec2 w=q/max(s,.2)*3.2;",
    "  float k1=sin(w.x*3.1+sin(w.y*2.3+t*.55)*1.7+t*.40);",
    "  float k2=sin(w.y*3.4+sin(w.x*2.1-t*.50)*1.5-t*.35);",
    "  float caus=pow(1.-abs(k1+k2)*.5,7.);",
    "  col+=c2*caus*ca*i*.55*(.45+.55*u.y)*(1.+lens*mw*1.6);",
    // light rays: diagonal beams fading toward the bottom
    "  float ang=q.x*1.5+q.y*.8;",
    "  float beams=pow(max(0.,sin(ang*6.+sin(t*.3)*1.4)),6.)*pow(max(0.,sin(ang*2.3-t*.17)),2.);",
    "  col+=c1*beams*ry*i*.35*smoothstep(.1,1.,u.y);",
    // neon: glowing contour where the blob field crosses a threshold (no pow() on negatives)
    "  float z=(a+d+e-.55)*7.;",
    "  float nl=exp(-z*z);",
    "  col+=(c3*.55+c1*.45)*nl*ng*i*.65;",
    "  col+=.015*sin(vec3(1.3,2.1,3.7)*t+u.xyx*6.);",
    "  gl_FragColor=vec4(clamp(col,0.,1.),1.);",
    "}",
  ].join("\n");

  function create(canvas, onLost) {
    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      powerPreference: "low-power",
    });
    if (!gl || gl.isContextLost()) return null;

    function compile(type, src) {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS))
        throw Error(gl.getShaderInfoLog(sh));
      return sh;
    }

    let prog, buf;
    try {
      prog = gl.createProgram();
      gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
      gl.useProgram(prog);
    } catch (err) {
      console.warn("[Gemini Glassmorphism] shader error:", err);
      return null;
    }

    buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const attr = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(attr);
    gl.vertexAttribPointer(attr, 2, gl.FLOAT, false, 0, 0);

    const loc = {};
    [
      "r",
      "t",
      "m",
      "c1",
      "c2",
      "c3",
      "b",
      "i",
      "s",
      "l",
      "ca",
      "ry",
      "ng",
      "mw",
      "mv",
      "rk0",
      "rk1",
      "rk2",
    ].forEach((n) => {
      loc[n] = gl.getUniformLocation(prog, n);
    });

    const state = {
      p: {
        intensity: 0.58,
        scale: 1,
        speed: 0.85,
        mouse: true,
        light: false,
        caustics: 0.72,
        rays: 0.48,
        neon: 0.52,
        wave: 0.7,
        ripple: true,
        colors: [
          [0.1, 0.72, 1],
          [0, 0.95, 0.8],
          [0.32, 0.42, 1],
        ],
        base: [0.027, 0.035, 0.07],
        quality: "medium",
      },
      time: 0,
      last: 0,
      raf: 0,
      running: false,
      dirty: true,
      mouse: [0.5, 0.5],
      target: [0.5, 0.5],
      vel: [0, 0],
      now: 0,
      clicks: [], // {x, y, t0} newest last, max 3
    };

    // Only touch canvas.width/height when the size really changed: assigning them reallocates the buffer.
    function resize() {
      const q = QUALITY[state.p.quality] || QUALITY.medium;
      const w = Math.max(2, Math.round(canvas.clientWidth * q.scale));
      const h = Math.max(2, Math.round(canvas.clientHeight * q.scale));
      if (canvas.width === w && canvas.height === h) return false;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      return true;
    }

    function draw() {
      const p = state.p;
      gl.uniform2f(loc.r, canvas.width, canvas.height);
      gl.uniform1f(loc.t, state.time);
      gl.uniform2f(loc.m, state.mouse[0], 1 - state.mouse[1]);
      gl.uniform3fv(loc.c1, p.colors[0]);
      gl.uniform3fv(loc.c2, p.colors[1]);
      gl.uniform3fv(loc.c3, p.colors[2]);
      gl.uniform3fv(loc.b, p.base);
      gl.uniform1f(loc.i, p.intensity);
      gl.uniform1f(loc.s, p.scale);
      gl.uniform1f(loc.l, p.mouse ? 1 : 0);
      gl.uniform1f(loc.ca, p.caustics);
      gl.uniform1f(loc.ry, p.rays);
      gl.uniform1f(loc.ng, p.neon);
      gl.uniform1f(loc.mw, p.wave);
      gl.uniform2f(loc.mv, state.vel[0], -state.vel[1]);
      for (let n = 0; n < 3; n++) {
        const c = state.clicks[state.clicks.length - 1 - n];
        const age = c ? (state.now - c.t0) / 1000 : -1;
        gl.uniform3f(loc["rk" + n], c ? c.x : 0, c ? 1 - c.y : 0, age > 4 ? -1 : age);
      }
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function frame(now) {
      state.raf = requestAnimationFrame(frame);
      if (document.hidden) return;
      const q = QUALITY[state.p.quality] || QUALITY.medium;
      if (now - state.last < 1000 / q.fps - 2) return; // -2ms slack avoids skipping every other vsync
      const dt = Math.min(0.1, (now - (state.last || now)) / 1000);
      state.last = now;
      state.time += dt * state.p.speed;
      const k = 1 - Math.pow(0.001, dt);
      const dx = state.target[0] - state.mouse[0];
      const dy = state.target[1] - state.mouse[1];
      state.mouse[0] += dx * k;
      state.mouse[1] += dy * k;
      state.now = now;
      // pointer velocity (uv/s, smoothed) drives the "drag" part of the wave effect
      const vx = Math.max(-3, Math.min(3, (dx * k) / Math.max(dt, 0.001)));
      const vy = Math.max(-3, Math.min(3, (dy * k) / Math.max(dt, 0.001)));
      state.vel[0] += (vx * 0.06 - state.vel[0]) * 0.25;
      state.vel[1] += (vy * 0.06 - state.vel[1]) * 0.25;
      state.clicks = state.clicks.filter((c) => now - c.t0 < 4000);
      const waving =
        state.p.wave > 0 &&
        (Math.abs(state.vel[0]) + Math.abs(state.vel[1]) > 0.002 ||
          state.clicks.length > 0);
      const moving =
        (state.p.mouse || state.p.wave > 0) &&
        (Math.abs(dx) + Math.abs(dy) > 0.0008 || waving);
      const resized = resize();
      // Static scene (speed 0 / reduced motion) only re-renders when something actually changed.
      if (state.p.speed > 0 || moving || resized || state.dirty) {
        draw();
        state.dirty = false;
      }
    }

    const move = (e) => {
      state.target[0] = e.clientX / Math.max(1, innerWidth);
      state.target[1] = e.clientY / Math.max(1, innerHeight);
    };
    window.addEventListener("pointermove", move, { passive: true });
    const press = (e) => {
      if (!state.p.ripple || state.p.wave <= 0 || e.button !== 0) return;
      state.clicks.push({
        x: e.clientX / Math.max(1, innerWidth),
        y: e.clientY / Math.max(1, innerHeight),
        t0: performance.now(),
      });
      if (state.clicks.length > 3) state.clicks.shift();
    };
    window.addEventListener("pointerdown", press, { passive: true, capture: true });

    const api = {
      update(x) {
        Object.assign(state.p, x);
        resize();
        draw();
        state.dirty = true;
      },
      start() {
        if (!state.running) {
          state.running = true;
          state.last = 0;
          state.raf = requestAnimationFrame(frame);
        }
      },
      destroy() {
        state.running = false;
        cancelAnimationFrame(state.raf);
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerdown", press, true);
        canvas.removeEventListener("webglcontextlost", lost);
        // Free GPU resources but keep the context usable: a canvas whose context was force-lost can never
        // produce a new one, which used to break re-enabling "Dynamic light background".
        try {
          gl.deleteBuffer(buf);
          gl.deleteProgram(prog);
        } catch (_) {}
        canvas.width = canvas.height = 1;
      },
    };

    function lost(e) {
      e.preventDefault();
      api.destroy();
      onLost?.();
    }
    canvas.addEventListener("webglcontextlost", lost, false);

    return api;
  }

  function paramsFrom(s, light) {
    const reduced =
      typeof matchMedia === "function" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches;
    return {
      intensity: s.intensity / 100,
      scale: s.scale / 100,
      speed: reduced ? 0 : s.speed / 100,
      mouse: s.mouseGlow && !reduced,
      caustics: s.caustics / 100,
      rays: s.rays / 100,
      neon: s.neon / 100,
      wave: reduced ? 0 : s.mouseWave / 100,
      ripple: s.clickRipple,
      light,
      colors: GUG.paletteColors(s),
      base: [0.012, 0.016, 0.026],
      quality: s.quality,
    };
  }

  global.GUGFX = { create, paramsFrom };
})(globalThis);

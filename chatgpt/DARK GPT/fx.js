/* WebGL background: DARK GPT red ambient glow
 * Rendered at reduced resolution (the light is soft anyway), paused when the tab is hidden.
 * Used by both the ChatGPT content script and the popup live preview.
 */
(function (global) {
  "use strict";

  const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

  const FRAG = `
precision highp float;
uniform vec2  uRes;
uniform float uTime;
uniform vec2  uMouse;      // 0..1, y up
uniform float uIntensity;  // 0..1
uniform float uScale;      // 0.4..2.4 (bigger = larger pattern)
uniform float uCaustic, uRays, uNeon, uMouseAmt; // 0..1
uniform float uLight;      // 0 dark UI, 1 light UI
uniform vec3  uC1, uC2, uC3, uBase;

#define TAU 6.28318530718

float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

// Tileable water caustics (iterated warp; after "Tileable Water Caustic" by Dave_Hoskins)
float caustic(vec2 uv, float t){
  vec2 p = mod(uv * TAU, TAU) - 250.0;
  vec2 i = p;
  float c = 1.0;
  float inten = .005;
  for (int n = 0; n < 5; n++) {
    float tt = t * (1.0 - (3.5 / float(n + 1)));
    i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
    c += 1.0 / length(vec2(p.x / (sin(i.x + tt) / inten), p.y / (cos(i.y + tt) / inten)));
  }
  c /= 5.0;
  c = 1.17 - pow(c, 1.4);
  return pow(abs(c), 8.0);
}

// Light shafts fanning out from above the screen
float rays(vec2 uv, float t, float k){
  vec2 p = uv - vec2(0.5 + 0.22 * sin(t * 0.11), 1.18);
  float a = atan(p.x, -p.y);
  float r = length(p);
  float s = sin(a * 13.0 / k + t * 0.32 + sin(a * 5.0 / k - t * 0.21) * 1.6) * 0.5 + 0.5;
  s = pow(s, 3.0) * (0.55 + 0.45 * sin(a * 29.0 / k - t * 0.47));
  return s * exp(-r * 1.35);
}

void main(){
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = frag / uRes;                       // 0..1, y up
  float asp = uRes.x / uRes.y;
  vec2 q = vec2(uv.x * asp, uv.y);             // aspect-correct
  float t = uTime;
  float k = uScale;

  // --- caustics, brighter near the "surface" (top) ---
  vec2 cuv = q * (0.95 / k) + vec2(t * 0.012, -t * 0.008);
  float ca = caustic(cuv, t * 0.5 + 23.0);
  float depth = mix(0.40, 1.0, smoothstep(0.0, 1.0, uv.y));
  ca *= depth;

  // --- neon blobs on slow Lissajous paths ---
  float s1 = 0.30 * k, s2 = 0.26 * k, s3 = 0.34 * k;
  vec2 b1 = vec2(0.50 + 0.42 * sin(t * 0.23 + 0.0), 0.50 + 0.34 * cos(t * 0.19 + 1.3));
  vec2 b2 = vec2(0.50 + 0.38 * sin(t * 0.17 + 2.1), 0.50 + 0.38 * cos(t * 0.27 + 0.4));
  vec2 b3 = vec2(0.50 + 0.44 * cos(t * 0.13 + 4.0), 0.50 + 0.30 * sin(t * 0.21 + 2.7));
  vec2 d1 = (uv - b1) * vec2(asp, 1.0), d2 = (uv - b2) * vec2(asp, 1.0), d3 = (uv - b3) * vec2(asp, 1.0);
  vec3 blobs = uC1 * exp(-dot(d1, d1) / (s1 * s1))
             + uC2 * exp(-dot(d2, d2) / (s2 * s2))
             + uC3 * exp(-dot(d3, d3) / (s3 * s3));

  // --- neon ribbons (thin glowing lines with a soft halo) ---
  vec3 ribbons = vec3(0.0);
  for (int j = 0; j < 2; j++) {
    float fj = float(j);
    float y = 0.52 + 0.20 * sin(q.x * (2.6 / k) + t * (0.55 + fj * 0.2) + fj * 2.2)
                   + 0.09 * sin(q.x * (6.8 / k) - t * (0.80 + fj * 0.3) + fj);
    float d = abs(uv.y - y);
    float line = 0.010 / (d + 0.010);
    vec3 col = j == 0 ? uC2 : uC1;
    ribbons += col * (pow(line, 2.3) * 0.85 + exp(-d * 5.5) * 0.16);
  }

  // --- cursor glow ---
  vec2 dm = (uv - uMouse) * vec2(asp, 1.0);
  vec3 mouse = mix(uC2, vec3(1.0), 0.25) * exp(-dot(dm, dm) / (0.045 * k)) * uMouseAmt;

  // --- compose ---
  vec3 lights = vec3(0.0);
  lights += mix(uC2, vec3(1.0), 0.35) * ca * uCaustic * 2.0;
  lights += mix(uC1, uC3, 0.5) * rays(uv, t, k) * uRays * 1.15;
  lights += (blobs * 0.55 + ribbons * 0.75) * uNeon;
  lights += mouse * 0.8;
  lights *= uIntensity * 1.45;

  vec3 col;
  if (uLight < 0.5) {
    // additive glow on a dark base, soft-clipped so bright spots stay coloured
    col = uBase + (1.0 - exp(-lights * 1.25)) * 0.92;
    col *= 1.0 - 0.28 * smoothstep(0.55, 1.15, length((uv - 0.5) * vec2(asp * 0.85, 1.0)));
  } else {
    // pastel tint on a light base (multiplicative, keeps text contrast high)
    float lum = max(max(lights.r, lights.g), lights.b);
    vec3 hue = lights / max(lum, 1e-4);
    float a = 1.0 - exp(-lum * 1.1);
    col = uBase * mix(vec3(1.0), hue * 0.90 + 0.10, a * 0.62);
  }
  col += (hash(frag + fract(t)) - 0.5) / 255.0; // dither: no banding in dark gradients
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

  const QUALITY = { low: { scale: 0.30, fps: 24 }, medium: { scale: 0.45, fps: 30 }, high: { scale: 0.70, fps: 60 } };

  function create(canvas) {
    const gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "low-power", preserveDrawingBuffer: false });
    if (!gl) return null;

    let prog, loc = {}, buf, ok = false;
    function compile(type, src) {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src); gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
      return sh;
    }
    function init() {
      prog = gl.createProgram();
      gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
      gl.useProgram(prog);
      buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW); // one big triangle
      const a = gl.getAttribLocation(prog, "p");
      gl.enableVertexAttribArray(a);
      gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
      ["uRes", "uTime", "uMouse", "uIntensity", "uScale", "uCaustic", "uRays", "uNeon", "uMouseAmt", "uLight", "uC1", "uC2", "uC3", "uBase"]
        .forEach((n) => { loc[n] = gl.getUniformLocation(prog, n); });
      ok = true;
    }
    try { init(); } catch (err) { console.warn("[glassmorphism] WebGL shader failed", err); return null; }

    const state = {
      params: { intensity: .6, scale: 1, speed: 1, caustics: .7, rays: .5, neon: .6, mouseGlow: true, light: false, colors: [[.1, .7, 1], [0, .9, .8], [.3, .4, 1]], base: [7 / 255, 9 / 255, 18 / 255], quality: "medium" },
      t: 23, last: 0, lastDraw: 0, raf: 0, running: false, dirty: true,
      mouse: [0.5, 0.5], target: [0.5, 0.5], lastMove: 0
    };

    function resize() {
      const q = QUALITY[state.params.quality] || QUALITY.medium;
      const w = Math.max(2, Math.round(canvas.clientWidth * q.scale)), h = Math.max(2, Math.round(canvas.clientHeight * q.scale));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); state.dirty = true; }
    }

    function draw() {
      const p = state.params;
      gl.uniform2f(loc.uRes, canvas.width, canvas.height);
      gl.uniform1f(loc.uTime, state.t);
      gl.uniform2f(loc.uMouse, state.mouse[0], state.mouse[1]);
      gl.uniform1f(loc.uIntensity, p.intensity);
      gl.uniform1f(loc.uScale, p.scale);
      gl.uniform1f(loc.uCaustic, p.caustics);
      gl.uniform1f(loc.uRays, p.rays);
      gl.uniform1f(loc.uNeon, p.neon);
      gl.uniform1f(loc.uMouseAmt, p.mouseGlow ? 1 : 0);
      gl.uniform1f(loc.uLight, p.light ? 1 : 0);
      gl.uniform3fv(loc.uC1, p.colors[0]); gl.uniform3fv(loc.uC2, p.colors[1]); gl.uniform3fv(loc.uC3, p.colors[2]);
      gl.uniform3fv(loc.uBase, p.base);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function frame(now) {
      state.raf = requestAnimationFrame(frame);
      if (document.hidden) { state.last = now; return; }
      const q = QUALITY[state.params.quality] || QUALITY.medium;
      if (now - state.lastDraw < 1000 / q.fps - 1) return;
      const dt = Math.min(0.1, (now - (state.last || now)) / 1000);
      state.last = now; state.lastDraw = now;

      const speed = state.params.speed;
      state.t += dt * speed;
      // ease the cursor light towards the pointer
      const m = state.mouse, g = state.target, ease = 1 - Math.pow(0.001, dt);
      const mx = (g[0] - m[0]) * ease, my = (g[1] - m[1]) * ease;
      m[0] += mx; m[1] += my;
      const mouseMoving = state.params.mouseGlow && (Math.abs(mx) + Math.abs(my) > 1e-4 || now - state.lastMove < 600);

      if (speed > 0 || mouseMoving || state.dirty) { resize(); draw(); state.dirty = false; }
    }

    const onMove = (e) => {
      state.target[0] = e.clientX / Math.max(1, innerWidth);
      state.target[1] = 1 - e.clientY / Math.max(1, innerHeight);
      state.lastMove = performance.now();
    };
    const onLost = (e) => { e.preventDefault(); ok = false; };
    const onRestored = () => { try { loc = {}; init(); state.dirty = true; } catch (_) { /* stays off */ } };
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", () => { state.dirty = true; });

    return {
      /** params: {intensity,scale,speed,caustics,rays,neon (0..1+), mouseGlow, light, colors, base, quality} */
      update(next) { Object.assign(state.params, next); state.dirty = true; if (!state.running) { resize(); if (ok) draw(); } },
      start() { if (state.running) return; state.running = true; state.last = 0; state.raf = requestAnimationFrame(frame); },
      stop() { state.running = false; cancelAnimationFrame(state.raf); },
      destroy() {
        this.stop();
        window.removeEventListener("pointermove", onMove);
        canvas.removeEventListener("webglcontextlost", onLost);
        canvas.removeEventListener("webglcontextrestored", onRestored);
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      }
    };
  }

  /** Convert stored settings to shader params. */
  function paramsFrom(settings, light) {
    return {
      intensity: settings.backgroundBrightness / 100,
      scale: 1.1,
      speed: 0.28,
      caustics: 0.45,
      rays: 0.28,
      neon: 0.72,
      mouseGlow: true,
      quality: "medium",
      light: Boolean(light),
      colors: [[0.95,0.04,0.10],[1.0,0.16,0.22],[0.62,0.01,0.05]],
      base: [18 / 255, 3 / 255, 7 / 255]
    };
  }

  global.CUGFX = { create, paramsFrom };
})(globalThis);

import { useEffect, useRef } from "react";
import "./liquid-bridge.css";

const vertexSource = `
  precision highp float;
  attribute vec2 aUv;
  uniform mediump float uTime;
  uniform mediump float uMorph;
  uniform vec2 uScale;
  uniform float uCenter;
  varying mediump vec3 vNormal;
  varying mediump vec3 vPosition;

  vec3 surface(vec2 uv) {
    float theta = uv.x * 6.2831853;
    float phi = uv.y * 6.2831853;
    float flow = 1.0 - uMorph;
    float wave = 0.085 * sin(theta * 3.0 + uTime * 0.53)
               + 0.055 * cos(theta * 2.0 - uTime * 0.37)
               + 0.025 * sin(theta * 5.0 + uTime * 0.23);
    float radius = 1.0 + wave * flow;
    float thickness = mix(0.115, 0.008, uMorph);
    thickness *= 1.0 + flow * 0.34 * sin(theta * 2.0 + uTime * 0.4);
    vec3 point = vec3(
      (radius + thickness * cos(phi)) * cos(theta),
      (radius + thickness * cos(phi)) * sin(theta),
      thickness * sin(phi) + flow * 0.12 * sin(theta * 2.0 - uTime * 0.3)
    );
    point.x *= mix(1.2, 1.0, uMorph);
    point.y *= mix(0.92, 1.0, uMorph);
    float tilt = flow * (0.22 + 0.08 * sin(uTime * 0.22));
    point.yz = mat2(cos(tilt), -sin(tilt), sin(tilt), cos(tilt)) * point.yz;
    float turn = flow * (-0.22 + 0.12 * sin(uTime * 0.17));
    point.xy = mat2(cos(turn), -sin(turn), sin(turn), cos(turn)) * point.xy;
    return point;
  }

  void main() {
    vec3 point = surface(aUv);
    vec3 tangent = surface(aUv + vec2(0.0002, 0.0)) - point;
    vec3 bitangent = surface(aUv + vec2(0.0, 0.0002)) - point;
    vNormal = normalize(cross(tangent, bitangent));
    vPosition = point;
    gl_Position = vec4(point.xy * uScale + vec2(0.0, uCenter), -point.z * 0.3, 1.0);
  }
`;

const fragmentSource = `
  precision mediump float;
  uniform mediump float uTime;
  uniform mediump float uMorph;
  uniform float uLight;
  varying mediump vec3 vNormal;
  varying mediump vec3 vPosition;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 view = vec3(0.0, 0.0, 1.0);
    float facing = clamp(dot(normal, view), 0.0, 1.0);
    float fresnel = 0.035 + 0.965 * pow(1.0 - facing, 3.0);
    vec3 reflected = reflect(-view, normal);
    vec3 transmitted = refract(-view, normal, 1.0 / 1.45);

    // A quiet, analytic environment bends through the glass. Transparency
    // carries the page beneath it; reflections stay local instead of forming
    // continuous bright bands around the tube.
    vec2 bent = vPosition.xy + transmitted.xy * 0.24;
    float depth = 0.5 + 0.5 * sin(bent.x * 2.1 + bent.y * 1.4 + uTime * 0.08);
    vec3 violet = mix(vec3(0.20, 0.12, 0.34), vec3(0.34, 0.25, 0.49), depth);
    vec3 pearl = vec3(0.73, 0.68, 0.85);
    float windowLight = pow(max(dot(reflected, normalize(vec3(-0.6, 0.75, 0.28))), 0.0), 22.0);
    float fillLight = pow(max(dot(reflected, normalize(vec3(0.7, -0.35, 0.55))), 0.0), 8.0);
    float edgeLight = 0.38 + 0.62 * smoothstep(-0.8, 0.8, reflected.y);
    float meniscus = pow(1.0 - facing, 9.0);
    vec3 color = violet * (0.78 + facing * 0.22);
    color += pearl * (windowLight * 0.22 + fillLight * 0.055);
    color += mix(vec3(0.43, 0.32, 0.62), pearl, edgeLight) * fresnel * 0.48;
    color += pearl * meniscus * 0.18;
    vec3 daylight = mix(vec3(0.62, 0.51, 0.78), vec3(0.90, 0.87, 0.96), facing);
    color = mix(color, daylight + pearl * windowLight * 0.08, uLight);
    float alpha = 0.14 + fresnel * 0.5 + windowLight * 0.1;
    alpha *= mix(1.0, 0.78, uLight);
    color = mix(color, vec3(0.43, 0.31, 0.65), uMorph * 0.7);
    alpha = mix(alpha, 0.48 * mix(1.0, 0.72, uLight), uMorph);
    // Match the canvas and blend mode so transparency is applied only once.
    gl_FragColor = vec4(color * alpha, alpha);
  }
`;

function shader(gl: WebGLRenderingContext, type: number, source: string) {
  const value = gl.createShader(type);
  if (!value) return null;
  gl.shaderSource(value, source);
  gl.compileShader(value);
  if (gl.getShaderParameter(value, gl.COMPILE_STATUS)) return value;
  gl.deleteShader(value);
  return null;
}

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => value * value * (3 - 2 * value);

// A single surface spans the hero and pinned search scene. Scroll changes the
// same mesh from a thick, organic loop into the search orbit; it is not a crossfade.
export function LiquidBridge() {
  const track = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = track.current;
    const element = canvas.current;
    const opening = root?.parentElement;
    const search = opening?.querySelector<HTMLElement>(".lp-search");
    const hero = opening?.querySelector<HTMLElement>(".lp-hero");
    if (!root || !element || !opening || !search || !hero) return;
    if (navigator.userAgent.includes("jsdom")) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let gl: WebGLRenderingContext | null;
    try {
      gl = element.getContext("webgl", {
        alpha: true,
        antialias: true,
        premultipliedAlpha: true,
        powerPreference: "low-power",
      });
    } catch {
      return; // The CSS/SVG loop remains visible when WebGL is unavailable.
    }
    if (!gl) return;
    const context = gl;
    const vertex = shader(context, context.VERTEX_SHADER, vertexSource);
    const fragment = shader(context, context.FRAGMENT_SHADER, fragmentSource);
    const program = context.createProgram();
    if (!vertex || !fragment || !program) {
      if (vertex) context.deleteShader(vertex);
      if (fragment) context.deleteShader(fragment);
      if (program) context.deleteProgram(program);
      return;
    }
    context.attachShader(program, vertex);
    context.attachShader(program, fragment);
    context.linkProgram(program);
    context.deleteShader(vertex);
    context.deleteShader(fragment);
    if (!context.getProgramParameter(program, context.LINK_STATUS)) {
      context.deleteProgram(program);
      return;
    }

    const segments = 192;
    const sides = 32;
    const vertices: number[] = [];
    const indices: number[] = [];
    for (let i = 0; i <= segments; i++) {
      for (let j = 0; j <= sides; j++) {
        vertices.push(i / segments, j / sides);
        if (i < segments && j < sides) {
          const a = i * (sides + 1) + j;
          const b = a + sides + 1;
          indices.push(a, b, a + 1, b, b + 1, a + 1);
        }
      }
    }
    const vertexBuffer = context.createBuffer();
    const indexBuffer = context.createBuffer();
    context.bindBuffer(context.ARRAY_BUFFER, vertexBuffer);
    context.bufferData(
      context.ARRAY_BUFFER,
      new Float32Array(vertices),
      context.STATIC_DRAW,
    );
    context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, indexBuffer);
    context.bufferData(
      context.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices),
      context.STATIC_DRAW,
    );
    context.useProgram(program);
    const uv = context.getAttribLocation(program, "aUv");
    context.enableVertexAttribArray(uv);
    context.vertexAttribPointer(uv, 2, context.FLOAT, false, 0, 0);
    context.enable(context.DEPTH_TEST);
    context.enable(context.CULL_FACE);
    context.enable(context.BLEND);
    context.blendFunc(context.ONE, context.ONE_MINUS_SRC_ALPHA);
    context.clearColor(0, 0, 0, 0);
    const uniforms = Object.fromEntries(
      ["uTime", "uMorph", "uScale", "uCenter", "uLight"].map((name) => [
        name,
        context.getUniformLocation(program, name),
      ]),
    );

    let frame = 0;
    let dirty = true;
    let visible = true;
    let lastDraw = -100;
    let elapsed = 0;
    let previousTime = 0;
    let width = 1;
    let height = 1;
    let radius = 1;
    let center = 0;
    let morph = 0;
    let light = 0;
    let lost = false;

    const measure = () => {
      const rect = element.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      const ratio = Math.min(
        window.devicePixelRatio || 1,
        width < 640 ? 1.5 : 1.75,
      );
      const pixelWidth = Math.round(width * ratio);
      const pixelHeight = Math.round(height * ratio);
      if (element.width !== pixelWidth || element.height !== pixelHeight) {
        element.width = pixelWidth;
        element.height = pixelHeight;
        context.viewport(0, 0, pixelWidth, pixelHeight);
      }
      const searchRect = search.getBoundingClientRect();
      const vh = window.innerHeight;
      const travel = Math.max(1, searchRect.height - vh);
      const progress = motion.matches
        ? 1
        : clamp((vh * 0.7 - searchRect.top) / (vh * 0.7 + travel * 0.6));
      // Start settling before search enters, then meet its actual inner orbit.
      morph = motion.matches
        ? 0
        : smooth(clamp((vh * 0.92 - searchRect.top) / (vh * 1.08)));
      const heroRadius = Math.min(width * 0.29, height * 0.43, 355);
      const orbitRadius = 260 * (0.25 + progress * 1.1);
      radius = heroRadius * (1 - morph) + orbitRadius * morph;
      center = (1 - morph) * 0.04;
      light = document.documentElement.dataset.theme === "light" ? 1 : 0;
      root.style.setProperty("--liquid-morph", morph.toFixed(3));
      root.dataset.morph = morph.toFixed(3);
      root.dataset.motion = motion.matches ? "reduced" : "full";
      dirty = false;
    };

    const draw = (now: number) => {
      frame = 0;
      if (lost) return;
      if (dirty) measure();
      if (now - lastDraw >= (width < 640 ? 33 : 22) || motion.matches) {
        if (previousTime && !motion.matches && visible && !document.hidden)
          elapsed += Math.min(now - previousTime, 50) / 1000;
        previousTime = now;
        lastDraw = now;
        context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
        context.uniform1f(uniforms.uTime, motion.matches ? 3.5 : elapsed);
        context.uniform1f(uniforms.uMorph, morph);
        context.uniform2f(
          uniforms.uScale,
          (radius * 2) / width,
          (radius * 2) / height,
        );
        context.uniform1f(uniforms.uCenter, center);
        context.uniform1f(uniforms.uLight, light);
        context.drawElements(
          context.TRIANGLES,
          indices.length,
          context.UNSIGNED_SHORT,
          0,
        );
        root.dataset.renderer = "webgl";
      }
      if (visible && !document.hidden && !motion.matches && morph < 1)
        frame = requestAnimationFrame(draw);
    };
    const queue = () => {
      dirty = true;
      if (!frame && !document.hidden && !lost)
        frame = requestAnimationFrame(draw);
    };
    const onVisibility = () => {
      previousTime = 0;
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else queue();
    };
    const onLoss = (event: Event) => {
      event.preventDefault();
      lost = true;
      cancelAnimationFrame(frame);
      frame = 0;
      delete root.dataset.renderer;
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      previousTime = 0;
      if (visible) queue();
      else {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    });
    observer.observe(opening);
    const resize = new ResizeObserver(queue);
    resize.observe(hero);
    resize.observe(search);
    const theme = new MutationObserver(queue);
    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    document.addEventListener("visibilitychange", onVisibility);
    motion.addEventListener("change", queue);
    element.addEventListener("webglcontextlost", onLoss);
    queue();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resize.disconnect();
      theme.disconnect();
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      document.removeEventListener("visibilitychange", onVisibility);
      motion.removeEventListener("change", queue);
      element.removeEventListener("webglcontextlost", onLoss);
      context.deleteBuffer(vertexBuffer);
      context.deleteBuffer(indexBuffer);
      context.deleteProgram(program);
      // Strict Mode replays effects on the same connected canvas. Release the
      // context only after a real unmount, not during that setup/cleanup probe.
      queueMicrotask(() => {
        if (!element.isConnected)
          context.getExtension("WEBGL_lose_context")?.loseContext();
      });
      delete root.dataset.renderer;
    };
  }, []);

  return (
    <div ref={track} className="liquid-track" aria-hidden="true">
      <div className="liquid-sticky">
        <div className="liquid-aura" />
        <svg
          className="liquid-fallback"
          viewBox="0 0 700 700"
          fill="none"
          focusable="false"
        >
          <defs>
            <linearGradient
              id="liquid-fallback-color"
              x1="80"
              y1="60"
              x2="600"
              y2="640"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#b0a1c9" />
              <stop offset="0.42" stopColor="#665080" />
              <stop offset="0.73" stopColor="#786293" />
              <stop offset="1" stopColor="#a89abd" />
            </linearGradient>
          </defs>
          <path
            d="M 350 82 C 476 38 580 128 590 276 C 652 414 542 552 402 582 C 254 644 112 560 102 420 C 40 286 126 152 254 132 C 290 126 310 100 350 82 Z"
            stroke="url(#liquid-fallback-color)"
            strokeOpacity="0.5"
            strokeWidth="28"
          />
          <path
            d="M 350 82 C 476 38 580 128 590 276 C 652 414 542 552 402 582 C 254 644 112 560 102 420 C 40 286 126 152 254 132 C 290 126 310 100 350 82 Z"
            stroke="#d4bdff"
            strokeOpacity="0.25"
            strokeWidth="1"
          />
        </svg>
        <canvas ref={canvas} className="liquid-canvas" />
      </div>
    </div>
  );
}

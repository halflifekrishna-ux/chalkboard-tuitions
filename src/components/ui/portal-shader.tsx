"use client";

import { useEffect, useRef, useState } from "react";
import { PortalField } from "@/components/ui/portal-field";
import { cn } from "@/lib/utils";

/**
 * PortalShader — the "portal-field" effect (MengTo/threeui) running its
 * original fragment shader on a plain WebGL canvas: two noise-warped glowing
 * arcs, a core and a fringe, with gentle mouse parallax.
 *
 * Differences from the upstream component, on purpose:
 * - No Three.js, no CDN script, no iframe — ~4 KB instead of ~600 KB.
 * - Brand colours (chalk-gold core, emerald fringe) on a transparent canvas,
 *   so it blends into the board green instead of sitting on a navy panel.
 * - Arc centred behind the right side of the hero, clear of the headline.
 * - DPR capped, paused off-screen / in background tabs, single still frame
 *   under prefers-reduced-motion, CSS <PortalField /> fallback without WebGL.
 *
 * Absolute + pointer-events-none: it can never affect layout or scroll width.
 * Used in: (marketing)/page.tsx hero.
 */

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_center;   // arc centre in device px (GL origin: bottom-left)
uniform float u_unit;    // device px per shader unit (the shorter canvas side)
uniform vec2 u_mouse;    // 0..1, eased
uniform vec2 u_radius;   // core, fringe radius in shader units
uniform vec3 u_colorCore;
uniform vec3 u_colorFringe;
uniform float u_intensity;

vec2 hash(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}
float noise(in vec2 p) {
  const float K1 = 0.366025404;
  const float K2 = 0.211324865;
  vec2 i = floor(p + (p.x + p.y) * K1);
  vec2 a = p - i + (i.x + i.y) * K2;
  vec2 o = (a.x > a.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec2 b = a - o + K2;
  vec2 c = a - 1.0 + 2.0 * K2;
  vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);
  vec3 n = h * h * h * h * vec3(dot(a, hash(i + 0.0)), dot(b, hash(i + o)), dot(c, hash(i + 1.0)));
  return dot(n, vec3(70.0));
}

float sdArc(vec2 p, float radius, float width, float warp) {
  p.y += sin(p.x * 2.0 + u_time * 0.3) * warp;
  p.x += noise(p * 1.5 + u_time * 0.1) * (warp * 0.8);
  return abs(length(p) - radius) - width;
}

void main() {
  vec2 st = (gl_FragCoord.xy - u_center) / u_unit;
  st += (u_mouse - 0.5) * 0.05;

  float d1 = sdArc(st, u_radius.x, 0.02, 0.15);
  float d2 = sdArc(st, u_radius.y, 0.06, 0.2);

  float coreGlow = exp(-d1 * 30.0);
  float fringeGlow = exp(-d2 * 10.0);
  float wash = smoothstep(1.5, -0.5, length(st)) * 0.15;

  vec3 color = u_colorCore * coreGlow
             + u_colorFringe * fringeGlow
             + u_colorFringe * wash * (sin(u_time * 0.5) * 0.2 + 0.8);
  color = vec3(1.0) - exp(-color * 1.5);

  float alpha = clamp((coreGlow + fringeGlow + wash) * u_intensity, 0.0, 1.0);
  gl_FragColor = vec4(color * alpha, alpha); // premultiplied
}
`;

// Chalkboard palette: chalk-gold core, emerald fringe (see tailwind.config).
const CORE = [0.96, 0.72, 0.16];
const FRINGE = [0.18, 0.56, 0.42];

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    gl.deleteShader(s);
    return null;
  }
  return s;
}

export function PortalShader({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    });
    if (!gl) {
      setFallback(true);
      return;
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram();
    if (!vs || !fs || !prog) {
      setFallback(true);
      return;
    }
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      setFallback(true);
      return;
    }
    gl.useProgram(prog);

    // One oversized triangle covers the whole viewport.
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = (name: string) => gl.getUniformLocation(prog, name);
    const uTime = u("u_time");
    const uCenter = u("u_center");
    const uUnit = u("u_unit");
    const uMouse = u("u_mouse");
    const uRadius = u("u_radius");
    const uIntensity = u("u_intensity");
    gl.uniform3fv(u("u_colorCore"), CORE);
    gl.uniform3fv(u("u_colorFringe"), FRINGE);
    gl.clearColor(0, 0, 0, 0);

    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;
      const mobile = w < 768;
      const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.5);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      const unit = Math.min(canvas.width, canvas.height);
      // Centre up-and-right of the headline (GL y is measured from the bottom).
      gl.uniform2f(uCenter, canvas.width * (mobile ? 0.78 : 0.72), canvas.height * 0.64);
      gl.uniform1f(uUnit, unit);
      gl.uniform2f(uRadius, mobile ? 0.82 : 0.6, mobile ? 0.88 : 0.65);
      gl.uniform1f(uIntensity, mobile ? 0.62 : 0.6);
    };
    resize();

    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mouse.tx = e.clientX / window.innerWidth;
      mouse.ty = 1 - e.clientY / window.innerHeight;
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let onScreen = true;
    let shown = false;
    const start = performance.now();

    const draw = (t: number) => {
      mouse.x += (mouse.tx - mouse.x) * 0.03;
      mouse.y += (mouse.ty - mouse.y) * 0.03;
      gl.uniform1f(uTime, t);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!shown) {
        shown = true;
        canvas.style.opacity = "1";
      }
    };

    const loop = () => {
      raf = 0;
      if (!onScreen || document.hidden) return;
      draw((performance.now() - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    const kick = () => {
      if (reduced) return;
      if (!raf && onScreen && !document.hidden) raf = requestAnimationFrame(loop);
    };

    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) draw(8);
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      kick();
    });
    io.observe(canvas);

    const onLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
      setFallback(true);
    };
    canvas.addEventListener("webglcontextlost", onLost);
    document.addEventListener("visibilitychange", kick);
    window.addEventListener("pointermove", onPointer, { passive: true });

    if (reduced) draw(8); // one still frame, no motion
    else kick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("webglcontextlost", onLost);
      document.removeEventListener("visibilitychange", kick);
      window.removeEventListener("pointermove", onPointer);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  if (fallback) return <PortalField className={className} />;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      style={{ opacity: 0, transition: "opacity 1.4s ease-out" }}
    />
  );
}

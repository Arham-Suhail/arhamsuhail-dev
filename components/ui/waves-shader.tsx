"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { perfTracker } from "@/lib/perf-measure"

const VERT = `attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`

// LAYER 2b: Specialized fragment shader containing only live code
// - Blur branch deleted (blur is 0)
// - hueRotate deleted (hue is 0)
// - Only rotate cursor effect kept (cursorEffect is 2.0)
// - Only OKLab path kept in mixColour (oklab is 1.0)
// - Palette unrolled to 3 literal steps with literal constants
const FRAG = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_cursorPresence;

const float C_SCALE = 2.35;
const float C_INTENSITY = 0.58;
const float C_WARP = 0.42;
const float C_DETAIL = 2.3;
const float C_CONTRAST = 0.92;
const float C_BRIGHTNESS = -0.02;
const float C_SATURATION = 0.85;
const float C_VIGNETTE = 0.55;
const float C_GRAIN = 0.025;
const float C_SEED = 635.0;
const float C_DRIFT = 0.08;
const float C_CURSOR_STRENGTH = 0.35;
const float C_CURSOR_RADIUS = 0.42;

float hash21(vec2 p) {
#ifndef GL_FRAGMENT_PRECISION_HIGH
  p = mod(p, 31.0);
#endif
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float grainHash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
    u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(17.0, 9.2);
    a *= 0.5;
  }
  return v;
}

vec3 srgbToLinear(vec3 c) {
  return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)),
    step(0.04045, c));
}
vec3 linearToSrgb(vec3 c) {
  return mix(c * 12.92, 1.055 * pow(max(c, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055,
    step(0.0031308, c));
}
vec3 linToOklab(vec3 c) {
  float l = 0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b;
  float m = 0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b;
  float s = 0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b;
  l = pow(max(l, 0.0), 1.0 / 3.0);
  m = pow(max(m, 0.0), 1.0 / 3.0);
  s = pow(max(s, 0.0), 1.0 / 3.0);
  return vec3(
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s);
}
vec3 oklabToLin(vec3 c) {
  float l = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;
  float m = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;
  float s = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;
  l = l * l * l; m = m * m * m; s = s * s * s;
  return vec3(
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s);
}

// Specialized: OKLab path only
vec3 mixColour(vec3 a, vec3 b, float t) {
  vec3 la = linToOklab(srgbToLinear(a));
  vec3 lb = linToOklab(srgbToLinear(b));
  return clamp(linearToSrgb(oklabToLin(mix(la, lb, t))), 0.0, 1.0);
}

// Specialized: Unrolled to 3 literal steps (colorCount - 1 = 3)
vec3 palette(float x) {
  float f = clamp(x, 0.0, 1.0) * 3.0;
  const vec3 c0 = vec3(0.035, 0.039, 0.055);
  const vec3 c1 = vec3(0.24, 0.27, 0.33);
  const vec3 c2 = vec3(0.14, 0.16, 0.20);
  const vec3 c3 = vec3(0.045, 0.05, 0.07);

  vec3 col = mixColour(c0, c1, smoothstep(0.0, 1.0, clamp(f, 0.0, 1.0)));
  col = mixColour(col, c2, smoothstep(0.0, 1.0, clamp(f - 1.0, 0.0, 1.0)));
  col = mixColour(col, c3, smoothstep(0.0, 1.0, clamp(f - 2.0, 0.0, 1.0)));
  return col;
}

vec3 shade(vec2 uv, vec2 p, float t) {
  float y = uv.y
    + sin(uv.x * (3.0 + C_INTENSITY * 9.0) + t * 0.8) * 0.08
    + (fbm(p * 2.0 + t * 0.1) - 0.5) * C_INTENSITY * 0.6;
  return palette(y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 screenUv = uv;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy)
    / min(u_resolution.x, u_resolution.y);

  // Specialized: Only rotate cursor effect (cursorEffect == 2.0)
  if (u_cursorPresence > 0.001) {
    vec2 cursor = (0.5 * u_mouse * u_resolution.xy)
      / min(u_resolution.x, u_resolution.y);
    vec2 cursorDelta = p - cursor;
    float cursorDistance = length(cursorDelta);
    float cursorMask = u_cursorPresence
      * (1.0 - smoothstep(0.0, C_CURSOR_RADIUS, cursorDistance));
    float cursorAngle = cursorMask * C_CURSOR_STRENGTH * 2.2;
    float cc = cos(cursorAngle), cs = sin(cursorAngle);
    p = cursor + mat2(cc, -cs, cs, cc) * cursorDelta;
  }

  uv = p * min(u_resolution.x, u_resolution.y) / u_resolution.xy + 0.5;
  p *= C_SCALE;
  p += C_DRIFT * vec2(sin(u_time * 0.31), cos(u_time * 0.23));
  p += C_WARP * (vec2(
    fbm(p * C_DETAIL + C_SEED),
    fbm(p * C_DETAIL + vec2(5.2, 1.3))) - 0.5);

  // Specialized: Single shade call (no blur loop)
  vec3 col = shade(uv, p, u_time);

  col = (col - 0.5) * C_CONTRAST + 0.5;

  float luma = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(luma), col, C_SATURATION);

  col += C_BRIGHTNESS;

  float vd = length(screenUv - 0.5) * 1.41421356;
  col *= 1.0 - C_VIGNETTE * smoothstep(0.35, 1.0, vd);

  col += (grainHash(
    gl_FragCoord.xy + vec2(C_SEED * 17.0, C_SEED * 31.0)) - 0.5) * C_GRAIN;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`

const pendingContextReleases = new WeakMap<HTMLCanvasElement, number>()

export function ShaderBackground({
  className,
  onReady,
}: {
  className?: string
  onReady?: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    perfTracker.log("shaderMount")

    const canvas = canvasRef.current
    if (!canvas) return
    const pendingRelease = pendingContextReleases.get(canvas)
    if (pendingRelease !== undefined) window.clearTimeout(pendingRelease)
    pendingContextReleases.delete(canvas)
    const gl = canvas.getContext("webgl", { antialias: false })
    if (!gl) return

    let disposed = false

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }
    const program = gl.createProgram()!
    const vertexShader = compile(gl.VERTEX_SHADER, VERT)
    const fragmentShader = compile(gl.FRAGMENT_SHADER, FRAG)
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    const buf = gl.createBuffer()
    let uni: {
      resolution?: WebGLUniformLocation | null
      time?: WebGLUniformLocation | null
      mouse?: WebGLUniformLocation | null
      cursorPresence?: WebGLUniformLocation | null
    } = {}

    let bounds = { width: 0, height: 0, left: 0, top: 0, right: 0, bottom: 0 }
    let raf = 0
    let lastNow: number | null = null
    let visible = true
    let inView = true
    const start = performance.now()

    let targetX = 0
    let targetY = 0
    let targetPresence = 0
    let mouseX = 0
    let mouseY = 0
    let cursorPresence = 0
    let pointerKnown = false
    let pointerClientX = 0
    let pointerClientY = 0

    // Render at 0.5 of CSS pixel size (upscaled via CSS), cap dpr at 1
    const resizeCanvas = () => {
      const dpr = 1
      const w = bounds.width > 0 ? bounds.width : (typeof window !== "undefined" ? window.innerWidth : 1280)
      const h = bounds.height > 0 ? bounds.height : (typeof window !== "undefined" ? window.innerHeight : 800)
      const width = Math.max(1, Math.round(w * 0.5 * dpr))
      const height = Math.max(1, Math.round(h * 0.5 * dpr))
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
        gl.viewport(0, 0, width, height)
      }
    }

    function requestRender() {
      if (!disposed && visible && inView && raf === 0) {
        raf = requestAnimationFrame(render)
      }
    }

    // LAYER 2a: Compile and first draw start at mount during splash, never deferred to intro:done
    const initProgramAndFirstDraw = () => {
      if (disposed) return
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
      gl.useProgram(program)

      gl.bindBuffer(gl.ARRAY_BUFFER, buf)
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 3, -1, -1, 3]),
        gl.STATIC_DRAW,
      )
      const loc = gl.getAttribLocation(program, "a_position")
      gl.enableVertexAttribArray(loc)
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

      uni = {
        resolution: gl.getUniformLocation(program, "u_resolution"),
        time: gl.getUniformLocation(program, "u_time"),
        mouse: gl.getUniformLocation(program, "u_mouse"),
        cursorPresence: gl.getUniformLocation(program, "u_cursorPresence"),
      }

      resizeCanvas()

      if (uni.resolution) gl.uniform2f(uni.resolution, canvas.width, canvas.height)
      if (uni.time) gl.uniform1f(uni.time, 0.0)
      if (uni.mouse) gl.uniform2f(uni.mouse, 0.0, 0.0)
      if (uni.cursorPresence) gl.uniform1f(uni.cursorPresence, 0.0)

      gl.drawArrays(gl.TRIANGLES, 0, 3)

      perfTracker.log("shaderFirstFrame")
      window.dispatchEvent(new CustomEvent("shader:firstframe"))

      canvas.classList.remove("opacity-0")
      canvas.classList.add("opacity-100")
      onReady?.()
    }

    // LAYER 2a: Compile and first draw start at mount during splash, never deferred to intro:done
    const ext = gl.getExtension("KHR_parallel_shader_compile")
    let compileTimer: NodeJS.Timeout | null = null
    if (ext) {
      const checkCompletion = () => {
        if (disposed) return
        if (gl.getProgramParameter(program, ext.COMPLETION_STATUS_KHR)) {
          initProgramAndFirstDraw()
        } else {
          compileTimer = setTimeout(checkCompletion, 50)
        }
      }
      compileTimer = setTimeout(checkCompletion, 50)
    } else {
      compileTimer = setTimeout(() => {
        if (!disposed) {
          initProgramAndFirstDraw()
        }
      }, 50)
    }

    const updatePointerTarget = () => {
      if (!pointerKnown) return
      if (bounds.width === 0 || bounds.height === 0) return
      const inside =
        pointerClientX >= bounds.left &&
        pointerClientX <= bounds.right &&
        pointerClientY >= bounds.top &&
        pointerClientY <= bounds.bottom
      if (!inside) {
        targetPresence = 0
        requestRender()
        return
      }
      const nextX = ((pointerClientX - bounds.left) / bounds.width) * 2 - 1
      const nextY = -(((pointerClientY - bounds.top) / bounds.height) * 2 - 1)
      if (targetPresence === 0 && cursorPresence < 0.01) {
        mouseX = nextX
        mouseY = nextY
      }
      targetX = nextX
      targetY = nextY
      targetPresence = 1
      requestRender()
    }

    const onPointerMove = (event: PointerEvent) => {
      pointerKnown = true
      pointerClientX = event.clientX
      pointerClientY = event.clientY
      bounds = canvas.getBoundingClientRect()
      updatePointerTarget()
    }

    const onPointerLeave = () => {
      pointerKnown = false
      targetPresence = 0
      requestRender()
    }

    const updateLayout = () => {
      bounds = canvas.getBoundingClientRect()
      resizeCanvas()
      updatePointerTarget()
      requestRender()
    }

    const onVisibilityChange = () => {
      visible = document.visibilityState === "visible"
      if (visible) requestRender()
      else if (raf !== 0) {
        cancelAnimationFrame(raf)
        raf = 0
        lastNow = null
      }
    }

    function render(now: number) {
      raf = 0
      if (disposed || !visible || !inView || !canvas || !gl || !uni.resolution) return
      const dt = lastNow === null ? 0 : Math.min((now - lastNow) / 1000, 0.1)
      lastNow = now
      const follow = 1 - Math.exp(-12 * dt)
      mouseX += (targetX - mouseX) * follow
      mouseY += (targetY - mouseY) * follow
      cursorPresence += (targetPresence - cursorPresence) * follow

      resizeCanvas()
      if (uni.resolution) gl.uniform2f(uni.resolution, canvas.width, canvas.height)
      if (uni.time) gl.uniform1f(uni.time, ((now - start) / 1000) * 0.65)
      if (uni.mouse) gl.uniform2f(uni.mouse, mouseX, mouseY)
      if (uni.cursorPresence) gl.uniform1f(uni.cursorPresence, cursorPresence)

      gl.drawArrays(gl.TRIANGLES, 0, 3)

      requestRender()
    }

    // LAYER 2d: Observers, listeners and continuous animation stay behind intro:done with requestIdleCallback
    let resizeObserver: ResizeObserver | null = null
    let intersectionObserver: IntersectionObserver | null = null
    let observersAttached = false

    const attachObserversAndStartLoop = () => {
      if (disposed || observersAttached) return
      observersAttached = true

      bounds = canvas.getBoundingClientRect()
      resizeCanvas()
      updatePointerTarget()

      window.addEventListener("resize", updateLayout)
      window.addEventListener("pointermove", onPointerMove, { passive: true })
      window.addEventListener("pointercancel", onPointerLeave)
      window.addEventListener("blur", onPointerLeave)
      document.documentElement.addEventListener("pointerleave", onPointerLeave)

      resizeObserver = new ResizeObserver(updateLayout)
      resizeObserver.observe(canvas)

      intersectionObserver = new IntersectionObserver(([entry]) => {
        inView = entry?.isIntersecting ?? true
        if (inView) requestRender()
        else if (raf !== 0) {
          cancelAnimationFrame(raf)
          raf = 0
          lastNow = null
        }
      })
      intersectionObserver.observe(canvas)

      document.addEventListener("visibilitychange", onVisibilityChange)
      requestRender()
    }

    let handleDone: (() => void) | null = null
    let doneTimer: NodeJS.Timeout | null = null
    const isSeen = typeof document !== "undefined" && document.documentElement.hasAttribute("data-intro-seen")
    if (isSeen) {
      if ("requestIdleCallback" in window) {
        (window as Window & { requestIdleCallback: (cb: () => void, opts: { timeout: number }) => number })
          .requestIdleCallback(attachObserversAndStartLoop, { timeout: 200 })
      } else {
        setTimeout(attachObserversAndStartLoop, 0)
      }
    } else {
      handleDone = () => {
        doneTimer = setTimeout(() => {
          if (disposed) return
          if ("requestIdleCallback" in window) {
            (window as Window & { requestIdleCallback: (cb: () => void, opts: { timeout: number }) => number })
              .requestIdleCallback(attachObserversAndStartLoop, { timeout: 2000 })
          } else {
            setTimeout(attachObserversAndStartLoop, 200)
          }
        }, 1000)
      }
      window.addEventListener("intro:done", handleDone, { once: true })
    }

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      if (compileTimer) clearTimeout(compileTimer)
      if (doneTimer) clearTimeout(doneTimer)
      if (handleDone) window.removeEventListener("intro:done", handleDone)
      if (observersAttached) {
        resizeObserver?.disconnect()
        intersectionObserver?.disconnect()
        document.removeEventListener("visibilitychange", onVisibilityChange)
        window.removeEventListener("resize", updateLayout)
        window.removeEventListener("pointermove", onPointerMove)
        window.removeEventListener("pointercancel", onPointerLeave)
        window.removeEventListener("blur", onPointerLeave)
        document.documentElement.removeEventListener("pointerleave", onPointerLeave)
      }

      gl.deleteBuffer(buf)
      gl.deleteProgram(program)
      const releaseTimer = window.setTimeout(() => {
        if (pendingContextReleases.get(canvas) !== releaseTimer) return
        pendingContextReleases.delete(canvas)
        gl.getExtension("WEBGL_lose_context")?.loseContext()
        canvas.width = 1
        canvas.height = 1
      }, 0)
      pendingContextReleases.set(canvas, releaseTimer)
    }
  }, [onReady])

  // LAYER 2a: Canvas fades in over 600ms once ready, CSS background gradient stays as fallback
  return (
    <canvas
      ref={canvasRef}
      className={cn(
        className,
        "opacity-0 transition-opacity duration-600 ease-out",
      )}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  )
}

"use client";

import { useState, useRef, useEffect, useCallback, useSyncExternalStore } from "react";
import { motion, useMotionValue, useSpring, animate, useReducedMotion, useInView } from "framer-motion";
import Image from "next/image";
import { RotateCw, ArrowRight } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { siteData } from "../../data/site";
import { cn } from "@/lib/utils";

function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max);
}

function subscribeFinePointer(callback: () => void) {
  const mql = window.matchMedia("(pointer: fine)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getFinePointerSnapshot() {
  return window.matchMedia("(pointer: fine)").matches;
}

function getFinePointerServerSnapshot() {
  return false;
}

export function HangingBadge() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasBeenFlipped, setHasBeenFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { margin: "-20px" });
  const prefersReducedMotion = useReducedMotion();
  const isFinePointer = useSyncExternalStore(
    subscribeFinePointer,
    getFinePointerSnapshot,
    getFinePointerServerSnapshot
  );

  // Motion values
  const rotateZ = useMotionValue(0);
  const flipAngle = useMotionValue(0);

  // Hover tilt springs (stiffness 120, damping 18, max 7deg)
  const rawTiltX = useMotionValue(0);
  const rawTiltY = useMotionValue(0);
  const tiltX = useSpring(rawTiltX, { stiffness: 120, damping: 18 });
  const tiltY = useSpring(rawTiltY, { stiffness: 120, damping: 18 });

  // Holographic sheen position lerp (~0.12/frame)
  const currentSheen = useRef({ x: 50, y: 50 });
  const targetSheen = useRef({ x: 50, y: 50 });

  // Physics state refs for pendulum integrator
  const thetaRef = useRef(0); // in radians
  const omegaRef = useRef(0); // in radians/sec
  const rafId = useRef<number | null>(null);
  const lastTime = useRef<number | null>(null);
  const isInteracting = isHovered || isDragging;

  // Pointer drag tracking
  const isPointerCaptured = useRef(false);
  const pointerStart = useRef({ x: 0, y: 0, time: 0 });
  const hasDraggedPast6px = useRef(false);
  const lastPointerX = useRef(0);
  const lastPointerTime = useRef(0);
  const targetDragTheta = useRef(0);

  // Tab visibility tracking
  const isTabVisible = useRef(true);

  const stepPhysicsRef = useRef<(now: number) => void>(() => {});

  // Semi-implicit Euler pendulum integrator
  // alpha = -(g/L) * sin(theta) - c * omega + tau_ext
  // omega = omega + alpha * dt
  // theta = theta + omega * dt
  const stepPhysics = useCallback((now: number) => {
    rafId.current = null;
    if (prefersReducedMotion) return;

    if (lastTime.current === null) {
      lastTime.current = now;
      rafId.current = requestAnimationFrame((nextNow) => stepPhysicsRef.current(nextNow));
      return;
    }

    const dt = Math.min((now - lastTime.current) / 1000, 1 / 30);
    lastTime.current = now;

    // Physical parameters
    const gOverL = 16.0; // natural pendulum frequency ~4 rad/s (~1.6s period)
    const damping = 1.15; // smooth deceleration

    let tauExt = 0;

    // Idle sway forcing term (active only while badge in view, tab visible, intro seen, and not dragging)
    const isIntroSeen = typeof document !== "undefined" && (document.documentElement.hasAttribute("data-intro-seen") || !document.getElementById("intro-splash-overlay"));
    const canIdleSway = isIntroSeen && isInView && isTabVisible.current && !isPointerCaptured.current;
    if (canIdleSway) {
      // Gentle sinusoidal forcing producing ~ +/- 1.2 deg oscillation
      tauExt = 0.055 * Math.sin(now * 0.0019);
    }

    if (isPointerCaptured.current) {
      // Dragging: theta follows pointer with lerp 0.25 (clamped to +/-35 deg)
      const prevTheta = thetaRef.current;
      thetaRef.current = thetaRef.current + (targetDragTheta.current - thetaRef.current) * 0.25;
      omegaRef.current = dt > 0 ? (thetaRef.current - prevTheta) / dt : 0;
    } else {
      // Semi-implicit Euler integration
      const alpha = -gOverL * Math.sin(thetaRef.current) - damping * omegaRef.current + tauExt;
      omegaRef.current += alpha * dt;
      thetaRef.current += omegaRef.current * dt;
    }

    // Holo sheen lerp toward target (~0.12/frame)
    if (cardRef.current && isHovered) {
      currentSheen.current.x += (targetSheen.current.x - currentSheen.current.x) * 0.12;
      currentSheen.current.y += (targetSheen.current.y - currentSheen.current.y) * 0.12;
      cardRef.current.style.setProperty("--mx", `${currentSheen.current.x.toFixed(2)}%`);
      cardRef.current.style.setProperty("--my", `${currentSheen.current.y.toFixed(2)}%`);
    }

    // Update rotateZ motion value (converting radians to degrees)
    const deg = thetaRef.current * (180 / Math.PI);
    rotateZ.set(deg);

    // Sleep condition: when motionless, not dragging, and idle sway is inactive
    const isMotionless =
      Math.abs(thetaRef.current) < 0.0005 &&
      Math.abs(omegaRef.current) < 0.0005 &&
      !isPointerCaptured.current;

    if (!canIdleSway && isMotionless) {
      thetaRef.current = 0;
      omegaRef.current = 0;
      rotateZ.set(0);
      return; // sleep
    }

    rafId.current = requestAnimationFrame((nextNow) => stepPhysicsRef.current(nextNow));
  }, [isInView, isHovered, prefersReducedMotion, rotateZ]);

  useEffect(() => {
    stepPhysicsRef.current = stepPhysics;
  }, [stepPhysics]);

  // Wake up the pendulum integrator loop
  const wakeLoop = useCallback(() => {
    if (prefersReducedMotion) return;
    const isIntroSeen = typeof document !== "undefined" && (document.documentElement.hasAttribute("data-intro-seen") || !document.getElementById("intro-splash-overlay"));
    if (!isIntroSeen && !isPointerCaptured.current) return;
    if (rafId.current === null) {
      lastTime.current = null;
      rafId.current = requestAnimationFrame((now) => stepPhysicsRef.current(now));
    }
  }, [prefersReducedMotion]);

  // Start or resume loop on view or tab visibility changes
  useEffect(() => {
    const handleVisibility = () => {
      isTabVisible.current = document.visibilityState === "visible";
      if (isTabVisible.current) {
        wakeLoop();
      }
    };

    const handleIntroDone = () => {
      if (isInView) {
        wakeLoop();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("intro:done", handleIntroDone, { once: true });
    if (isInView) {
      wakeLoop();
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("intro:done", handleIntroDone);
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    };
  }, [isInView, wakeLoop]);

  // Flip handler: soft spring (stiffness 90, damping 18, mass 0.9) + kicks omega
  const toggleFlip = useCallback(() => {
    setHasBeenFlipped(true);
    const nextFlipped = !isFlipped;
    setIsFlipped(nextFlipped);

    if (prefersReducedMotion) {
      flipAngle.set(nextFlipped ? 180 : 0);
      return;
    }

    // 3D Flip spring
    animate(flipAngle, nextFlipped ? 180 : 0, {
      type: "spring",
      stiffness: 90,
      damping: 18,
      mass: 0.9,
    });

    // Angular kick to pendulum
    const kick = nextFlipped ? -0.75 : 0.75;
    omegaRef.current += kick;
    wakeLoop();
  }, [isFlipped, prefersReducedMotion, flipAngle, wakeLoop]);

  // Pointer interactions (drag, impulse with hit offset, hover tilt, holo sheen)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    isPointerCaptured.current = true;
    hasDraggedPast6px.current = false;
    pointerStart.current = { x: e.clientX, y: e.clientY, time: performance.now() };
    lastPointerX.current = e.clientX;
    lastPointerTime.current = performance.now();

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    wakeLoop();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    // 1. Calculate hit position on card for holo sheen & tilt
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const nx = clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100);
      const ny = clamp(((e.clientY - rect.top) / rect.height) * 100, 0, 100);
      targetSheen.current = { x: nx, y: ny };

      // Hover tilt: max 7deg, stiffness 120, damping 18
      const rx = -((e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)) * 7;
      const ry = ((e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)) * 7;
      rawTiltX.set(clamp(rx, -7, 7));
      rawTiltY.set(clamp(ry, -7, 7));
    }

    // 2. Drag handling
    if (isPointerCaptured.current) {
      const dx = e.clientX - pointerStart.current.x;
      const dy = e.clientY - pointerStart.current.y;

      if (!hasDraggedPast6px.current && Math.hypot(dx, dy) >= 6) {
        hasDraggedPast6px.current = true;
        setIsDragging(true);
      }

      if (hasDraggedPast6px.current && cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const clipX = rect.left + rect.width / 2;
        const clipY = rect.top;
        const angleRad = Math.atan2(e.clientX - clipX, Math.max(40, e.clientY - clipY));
        const maxAngleRad = (35 * Math.PI) / 180;
        targetDragTheta.current = clamp(angleRad, -maxAngleRad, maxAngleRad);
        wakeLoop();
      }
      return;
    }

    // 3. Pointer impulse over card (velocity proportional + hit offset from clip)
    if (!isFinePointer || prefersReducedMotion) return;

    const now = performance.now();
    const dt = (now - lastPointerTime.current) / 1000;

    if (dt > 0.035 && cardRef.current) {
      const dx = e.clientX - lastPointerX.current;
      const vx = dx / (dt || 0.016); // px/sec
      lastPointerTime.current = now;
      lastPointerX.current = e.clientX;

      if (Math.abs(vx) > 40) {
        const rect = cardRef.current.getBoundingClientRect();
        // Hit offset from clip: hitting bottom gives more torque than near top
        const hitOffset = clamp((e.clientY - rect.top) / rect.height, 0.15, 1.0);
        const impulse = clamp(vx * hitOffset * 0.0016, -2.2, 2.2);
        omegaRef.current += impulse;
        wakeLoop();
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isPointerCaptured.current) return;
    isPointerCaptured.current = false;
    setIsDragging(false);

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    if (!hasDraggedPast6px.current) {
      // Movement under 6px counts as a tap -> toggle flip
      toggleFlip();
    } else {
      // Release velocity is naturally preserved in omegaRef by the integrator
      wakeLoop();
    }
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    rawTiltX.set(0);
    rawTiltY.set(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleFlip();
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center select-none w-full max-w-[280px] mx-auto py-2"
    >
      {/* HANGING RIG: Sagging wire + Pin + Clip */}
      <div className="w-full flex flex-col items-center relative z-10 pointer-events-none">
        {/* Sagging SVG Wire across column */}
        <svg
          viewBox="0 0 280 24"
          className="w-full h-6 overflow-visible text-white/20"
          aria-hidden="true"
        >
          <path
            d="M 6 8 Q 140 22 274 8"
            stroke="currentColor"
            strokeWidth="1.25"
            fill="none"
          />
          <circle
            cx="140"
            cy="15"
            r="3.5"
            className="fill-neutral-300 stroke-neutral-700"
            strokeWidth="1.2"
          />
          <circle
            cx="139"
            cy="14"
            r="1"
            className="fill-white"
          />
        </svg>

        {/* Short string dropping from pin to clip */}
        <div className="w-[1.5px] h-7 bg-gradient-to-b from-neutral-300 via-neutral-500 to-neutral-700 -mt-2" />

        {/* Rounded metal-style clip */}
        <div className="w-6 h-7 rounded-md border border-neutral-400 bg-gradient-to-b from-neutral-200 via-neutral-400 to-neutral-600 shadow-md relative z-20 flex flex-col items-center justify-between py-1 -mb-3">
          <div className="w-2.5 h-1 rounded-full bg-neutral-700/60" />
          <div className="w-3.5 h-2 rounded-[2px] bg-neutral-800/80 border border-neutral-500/40" />
        </div>
      </div>

      {/* SWINGING CARD ASSEMBLY (transform-origin is the clip) */}
      <motion.div
        style={{
          transformOrigin: "top center",
          rotateZ: prefersReducedMotion ? 0 : rotateZ,
        }}
        className={cn(
          "relative z-20 pt-2 cursor-grab active:cursor-grabbing focus-visible:outline-none",
          isInteracting && "will-change-transform"
        )}
      >
        {/* 3D Perspective Wrapper - NO overflow:hidden, NO filters, NO backdrop-filter here to avoid flattening 3D */}
        <div
          ref={cardRef}
          role="button"
          tabIndex={0}
          aria-pressed={isFlipped}
          aria-label={
            isFlipped
              ? "Arham Suhail ID Badge, currently showing profile back. Click or press Enter to flip to front."
              : "Arham Suhail ID Badge, currently showing front photo. Click or press Enter to flip to back."
          }
          onKeyDown={handleKeyDown}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onMouseEnter={() => {
            setIsHovered(true);
            wakeLoop();
          }}
          onMouseLeave={handlePointerLeave}
          className={cn(
            "w-[260px] aspect-[5/7] rounded-3xl relative [perspective:1000px] transition-shadow",
            "focus-visible:ring-2 focus-visible:ring-ice/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg focus-visible:outline-none",
            isHovered
              ? "shadow-[0_20px_45px_rgba(0,0,0,0.6)]"
              : "shadow-[0_12px_32px_rgba(0,0,0,0.45)]"
          )}
        >
          {/* Tilt container */}
          <motion.div
            style={{
              rotateX: prefersReducedMotion ? 0 : tiltX,
              rotateY: prefersReducedMotion ? 0 : tiltY,
              transformStyle: "preserve-3d",
            }}
            className="w-full h-full relative [transform-style:preserve-3d]"
          >
            {/* 3D Flipping Chassis - animates rotateY 0 to 180 */}
            <motion.div
              style={{
                rotateY: prefersReducedMotion ? (isFlipped ? 180 : 0) : flipAngle,
                transformStyle: "preserve-3d",
              }}
              className="w-full h-full relative [transform-style:preserve-3d]"
            >
              {/* ========================================================= */}
              {/* FRONT FACE - pre-oriented at rotateY(0deg) */}
              {/* ========================================================= */}
              <div
                style={{
                  transform: "rotateY(0deg)",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
                className={cn(
                  "absolute inset-0 rounded-3xl border border-white/10 bg-gradient-to-b from-[#14161a] to-[#0d0e10] p-4 flex flex-col justify-between select-none overflow-hidden",
                  "[transform:rotateY(0deg)] [backface-visibility:hidden] [-webkit-backface-visibility:hidden]"
                )}
              >
                {/* Top Slot Punch Hole */}
                <div className="w-7 h-1.5 rounded-full bg-[#08090b] border border-white/10 mx-auto -mt-1 mb-1.5 shrink-0" />

                {/* Top Meta Row */}
                <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-muted uppercase">
                  <span className="text-ice/90 font-semibold">ID / 001</span>
                  <span>PK / WORLDWIDE</span>
                </div>

                {/* Photo Tile with Soft Ice Gradient Background */}
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 my-2 bg-gradient-to-b from-white/10 via-steel/10 to-transparent shadow-inner shrink-0">
                  <Image
                    src="/images/arham-hero.png"
                    alt="Arham Suhail"
                    fill
                    sizes="260px"
                    priority
                    className="object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e10]/80 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Name & Role */}
                <div className="my-auto py-1">
                  <h3 className="text-lg font-bold text-white tracking-tight leading-none">
                    Arham Suhail
                  </h3>
                  <p className="text-xs text-muted leading-tight mt-1 font-medium">
                    AI Automation and Web Developer
                  </p>
                </div>

                {/* Hairline Divider */}
                <div className="w-full h-px bg-white/10 my-1" />

                {/* Footer with Flip Action */}
                <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-muted pt-0.5">
                  <span className="text-[10px]">FLIP</span>
                  <span className="p-1 rounded-full bg-white/5 border border-white/10 text-ice transition-colors">
                    <RotateCw size={11} className={cn("transition-transform duration-500", isHovered && "rotate-180")} />
                  </span>
                </div>

                {/* Holographic Sheen Overlay on Front Face */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-[inherit] z-30 transition-opacity duration-300"
                  style={{
                    opacity: isHovered ? 0.55 : 0,
                    mixBlendMode: "screen",
                    background:
                      "radial-gradient(circle at var(--mx, 50%) var(--my, 50%), rgba(200, 230, 255, 0.7) 0%, rgba(190, 180, 255, 0.45) 35%, rgba(160, 240, 220, 0.35) 65%, transparent 85%)",
                  }}
                />
              </div>

              {/* ========================================================= */}
              {/* BACK FACE - pre-oriented at rotateY(180deg) */}
              {/* ========================================================= */}
              <div
                style={{
                  transform: "rotateY(180deg)",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
                className={cn(
                  "absolute inset-0 rounded-3xl border border-white/10 bg-gradient-to-b from-[#14161a] to-[#0d0e10] p-4 flex flex-col justify-between select-none overflow-hidden",
                  "[transform:rotateY(180deg)] [backface-visibility:hidden] [-webkit-backface-visibility:hidden]"
                )}
              >
                {/* Top Slot Punch Hole */}
                <div className="w-7 h-1.5 rounded-full bg-[#08090b] border border-white/10 mx-auto -mt-1 mb-1.5 shrink-0" />

                {/* Top Meta Row */}
                <div className="flex items-center justify-between text-[10px] font-mono tracking-widest uppercase">
                  <span className="text-ice font-semibold">PROFILE / 001</span>
                  <span className="p-1 rounded-full bg-white/5 border border-white/10 text-ice transition-colors">
                    <RotateCw size={10} className={cn("transition-transform duration-500", isHovered && "rotate-180")} />
                  </span>
                </div>

                {/* Name & Role & Bio Line */}
                <div className="pt-0.5">
                  <h3 className="text-base font-bold text-white tracking-tight leading-tight">
                    Arham Suhail
                  </h3>
                  <p className="text-[11px] text-muted leading-tight font-medium mt-0.5">
                    AI Automation and Web Developer
                  </p>
                  <p className="text-[10.5px] text-text/80 leading-snug italic mt-1.5 line-clamp-2">
                    I build AI that does the boring work. Automations, calling agents and websites that get things done.
                  </p>
                </div>

                {/* WHAT I BUILD with Three Hairline Rows */}
                <div className="my-auto py-1">
                  <span className="text-[9.5px] font-bold uppercase tracking-wider text-steel block mb-1">
                    WHAT I BUILD
                  </span>
                  <div className="space-y-0.5">
                    <div className="border-b border-white/10 py-1 text-[11px] text-text/90 font-medium flex items-center justify-between">
                      <span>AI Automation</span>
                      <ArrowRight size={11} className="text-muted/60" />
                    </div>
                    <div className="border-b border-white/10 py-1 text-[11px] text-text/90 font-medium flex items-center justify-between">
                      <span>AI Calling Agents</span>
                      <ArrowRight size={11} className="text-muted/60" />
                    </div>
                    <div className="border-b border-white/10 py-1 text-[11px] text-text/90 font-medium flex items-center justify-between">
                      <span>Websites</span>
                      <ArrowRight size={11} className="text-muted/60" />
                    </div>
                  </div>
                </div>

                {/* QR Code Section */}
                <div className="flex flex-col items-center justify-center py-1">
                  <div className="p-1.5 rounded-xl bg-white/5 border border-white/10 shadow-sm w-[64px] h-[64px] flex items-center justify-center">
                    {hasBeenFlipped ? (
                      <QRCodeSVG
                        value={siteData.calendlyUrl}
                        size={52}
                        fgColor="#dce6f2"
                        bgColor="transparent"
                        level="M"
                      />
                    ) : (
                      <div className="w-[52px] h-[52px]" />
                    )}
                  </div>
                  <span className="text-[8.5px] font-mono tracking-wider text-muted uppercase text-center mt-1">
                    SCAN TO BOOK A CALL
                  </span>
                </div>

                {/* Email at the Bottom */}
                <div className="pt-1 border-t border-white/10 text-center">
                  <span className="text-[9.5px] font-mono text-steel">
                    {siteData.email}
                  </span>
                </div>

                {/* Holographic Sheen Overlay on Back Face */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-[inherit] z-30 transition-opacity duration-300"
                  style={{
                    opacity: isHovered ? 0.55 : 0,
                    mixBlendMode: "screen",
                    background:
                      "radial-gradient(circle at var(--mx, 50%) var(--my, 50%), rgba(200, 230, 255, 0.7) 0%, rgba(190, 180, 255, 0.45) 35%, rgba(160, 240, 220, 0.35) 65%, transparent 85%)",
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default HangingBadge;

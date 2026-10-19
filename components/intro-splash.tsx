"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { siteData } from "../data/site";
import { introStore } from "@/lib/intro-store";
import { perfTracker } from "@/lib/perf-measure";

const EASE_TOKEN = "cubic-bezier(0.16, 1, 0.3, 1)";

export default function IntroSplash() {
  const introText = (siteData as { introText?: string; introEnabled?: boolean }).introText || "Automations.";
  const chars = introText.split("");

  const [isUnmounted, setIsUnmounted] = useState(() => {
    if (typeof window === "undefined") return false;
    const freq = (siteData as { introFrequency?: string }).introFrequency || "always";
    const isSeen = (freq === "session" && sessionStorage.getItem("introSeen") === "1") || document.documentElement.hasAttribute("data-intro-seen");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const introEnabled = (siteData as { introText?: string; introEnabled?: boolean }).introEnabled !== false;
    return Boolean(isSeen || prefersReducedMotion || !introEnabled);
  });

  const overlayRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const skipLabelRef = useRef<HTMLDivElement>(null);

  const activeSessionRef = useRef<{
    triggerSkip: () => void;
  } | null>(null);

  const handleSkip = useCallback(() => {
    activeSessionRef.current?.triggerSkip();
  }, []);

  useEffect(() => {
    if (isUnmounted) {
      document.documentElement.setAttribute("data-intro-seen", "1");
      document.documentElement.setAttribute("data-hero-state", "revealed");
      introStore.setShaderReady();
      introStore.setIntroDone();
      window.dispatchEvent(new CustomEvent("intro:reveal"));
      window.dispatchEvent(new CustomEvent("intro:done"));
      return;
    }

    perfTracker.log("splashMount");
    document.body.style.overflow = "hidden";

    // All flags and session state live in one object discarded on cleanup (StrictMode safe)
    const session = {
      disposed: false,
      completed: false,
      exiting: false,
      hasRefined: false,
      t0: performance.now(),
      overlayAnim: null as Animation | null,
      skipAnim: null as Animation | null,
      watchdogIntervalId: null as ReturnType<typeof setInterval> | null,
      finalGuaranteeTimeoutId: null as ReturnType<typeof setTimeout> | null,
      fallbackTimeoutId: null as ReturnType<typeof setTimeout> | null,
      scheduledDelay: 3100,
      fadeDuration: 400,
    };

    const completeExit = () => {
      if (session.disposed || session.completed) return;
      session.completed = true;

      perfTracker.onSplashGone();

      document.body.style.overflow = "";
      const freq = (siteData as { introFrequency?: string }).introFrequency || "always";
      if (freq === "session") sessionStorage.setItem("introSeen", "1");
      document.documentElement.setAttribute("data-intro-seen", "1");

      introStore.setIntroDone();
      window.dispatchEvent(new CustomEvent("intro:done"));

      // SEQUENCE: dispatch intro:reveal only after the fade finishes plus one requestAnimationFrame,
      // not at exit start. The page shows the smoke background alone for that moment, then the Hero content enters.
      requestAnimationFrame(() => {
        perfTracker.log("heroEntrance");
        document.documentElement.setAttribute("data-hero-state", "revealed");
        window.dispatchEvent(new CustomEvent("intro:reveal"));

        const unmount = () => {
          if (!session.disposed) {
            setIsUnmounted(true);
          }
        };

        if ("requestIdleCallback" in window) {
          (window as Window & { requestIdleCallback: (cb: () => void, opts: { timeout: number }) => number })
            .requestIdleCallback(unmount, { timeout: 1000 });
        } else {
          setTimeout(unmount, 500);
        }
      });
    };

    const forceRemoveOverlay = () => {
      if (session.disposed || session.completed) return;
      const overlay = overlayRef.current || document.getElementById("intro-splash-overlay");
      if (overlay) {
        overlay.style.display = "none";
      }
      completeExit();
    };

    const scheduleFade = (delayMs: number, fadeDuration: number) => {
      if (session.disposed || session.completed) return;

      // Master deadline: delay must never be later than t0 + 3100 ms
      const timeSinceT0 = performance.now() - session.t0;
      const masterRemaining = Math.max(0, 3100 - timeSinceT0);
      const effectiveDelay = Math.max(0, Math.min(delayMs, masterRemaining));

      // Cancel any existing WAAPI animations
      if (session.overlayAnim) {
        try {
          session.overlayAnim.cancel();
        } catch {}
        session.overlayAnim = null;
      }
      if (session.skipAnim) {
        try {
          session.skipAnim.cancel();
        } catch {}
        session.skipAnim = null;
      }
      if (session.finalGuaranteeTimeoutId) {
        clearTimeout(session.finalGuaranteeTimeoutId);
        session.finalGuaranteeTimeoutId = null;
      }
      if (session.fallbackTimeoutId) {
        clearTimeout(session.fallbackTimeoutId);
        session.fallbackTimeoutId = null;
      }

      const overlay = overlayRef.current || document.getElementById("intro-splash-overlay");
      const skipLabel = skipLabelRef.current || document.getElementById("intro-skip-button");
      if (!overlay) {
        completeExit();
        return;
      }

      session.scheduledDelay = effectiveDelay;
      session.fadeDuration = fadeDuration;

      perfTracker.log("exitFadeStart");

      // Animate skip button
      if (skipLabel) {
        try {
          const skipAnim = skipLabel.animate(
            [
              { opacity: 1, visibility: "visible" },
              { opacity: 0, visibility: "hidden" },
            ],
            {
              duration: fadeDuration === 200 ? 50 : 80,
              delay: effectiveDelay,
              fill: "forwards",
              easing: EASE_TOKEN,
            }
          );
          session.skipAnim = skipAnim;
          skipAnim.finished.catch(() => {});
        } catch {}
      }

      // Animate overlay with WAAPI
      try {
        const anim = overlay.animate(
          [
            { opacity: 1, visibility: "visible" },
            { opacity: 0, visibility: "hidden" },
          ],
          {
            duration: fadeDuration,
            delay: effectiveDelay,
            fill: "forwards",
            easing: EASE_TOKEN,
          }
        );
        session.overlayAnim = anim;

        anim.finished
          .then(() => {
            if (!session.disposed && !session.completed) {
              completeExit();
            }
          })
          .catch(() => {
            // Rejection on cancel is normal when replaced or cleaned up
          })
          .finally(() => {
            // Unmount in finally path if this anim finished and wasn't superseded
            if (!session.disposed && !session.completed && session.overlayAnim === anim && anim.playState === "finished") {
              completeExit();
            }
          });
      } catch {
        session.fallbackTimeoutId = setTimeout(() => {
          if (!session.disposed && !session.completed) {
            completeExit();
          }
        }, effectiveDelay + fadeDuration);
      }

      // Final guarantee: 600 ms after the expected end of the fade, if the overlay is still in the DOM,
      // force it removed (display none, then unmount) regardless of animation state.
      const expectedEndMs = effectiveDelay + fadeDuration;
      session.finalGuaranteeTimeoutId = setTimeout(() => {
        if (!session.disposed && !session.completed) {
          const el = overlayRef.current || document.getElementById("intro-splash-overlay");
          if (el && window.getComputedStyle(el).display !== "none") {
            forceRemoveOverlay();
          }
        }
      }, expectedEndMs + 600);
    };

    const triggerSkip = () => {
      if (session.disposed || session.completed) return;
      session.exiting = true;
      scheduleFade(0, 200);
    };

    activeSessionRef.current = {
      triggerSkip,
    };

    // Master deadline: hard exit fade scheduled at t0 + 3100 ms immediately on effect run
    scheduleFade(3100, 400);

    const tryRefineWithVideo = () => {
      if (session.disposed || session.completed || session.hasRefined) return;
      const video = videoRef.current;
      if (!video) return;

      const duration = video.duration;
      const isDurationValid = Number.isFinite(duration) && duration > 0;
      if (!isDurationValid) return;

      const isPlaying = !video.paused && !video.ended;
      if (isPlaying) {
        session.hasRefined = true;
        perfTracker.log("videoPlaying");
        const remainingDelay = Math.max(0, (duration - 0.35 - video.currentTime) * 1000);
        scheduleFade(remainingDelay, 400);
      }
    };

    const video = videoRef.current;

    // Refinement: inspect video at effect start
    if (video) {
      if (video.readyState >= 1) {
        perfTracker.log("videoLoadedMetadata", video.duration);
        tryRefineWithVideo();
      }
    }

    const handleLoadedMetadata = () => {
      if (video) perfTracker.log("videoLoadedMetadata", video.duration);
      tryRefineWithVideo();
    };

    const handlePlaying = () => {
      tryRefineWithVideo();
    };

    const handleEnded = () => {
      perfTracker.log("mediaEnd");
      if (!session.disposed && !session.completed) {
        if (!session.exiting) {
          session.exiting = true;
          scheduleFade(0, 200);
        } else {
          forceRemoveOverlay();
        }
      }
    };

    if (video) {
      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      video.addEventListener("playing", handlePlaying);
      video.addEventListener("ended", handleEnded);
    }

    // Watchdog: 250 ms interval (cleared in cleanup) that triggers exit if the overlay is still present
    // and any of these is true: video.ended, currentTime at least duration - 0.05, performance.now() - t0 above 3600.
    session.watchdogIntervalId = setInterval(() => {
      if (session.disposed || session.completed) return;

      const overlay = overlayRef.current || document.getElementById("intro-splash-overlay");
      if (!overlay) {
        completeExit();
        return;
      }

      const cs = window.getComputedStyle(overlay);
      if (cs.display === "none" || (parseFloat(cs.opacity) === 0 && cs.visibility === "hidden")) {
        completeExit();
        return;
      }

      const v = videoRef.current;
      const isVideoEnded = v ? v.ended : false;
      const isTimeNearEnd = Boolean(
        v && Number.isFinite(v.duration) && v.duration > 0 && v.currentTime >= v.duration - 0.05
      );
      const isPastMasterCutoff = performance.now() - session.t0 > 3600;

      if (isVideoEnded || isTimeNearEnd || isPastMasterCutoff) {
        if (!session.exiting) {
          session.exiting = true;
          scheduleFade(0, 200);
        } else {
          forceRemoveOverlay();
        }
      }
    }, 250);

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " " || e.key === "Enter") {
        triggerSkip();
      }
    };
    window.addEventListener("keydown", handleKey);

    return () => {
      session.disposed = true;
      if (activeSessionRef.current?.triggerSkip === triggerSkip) {
        activeSessionRef.current = null;
      }

      if (video) {
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        video.removeEventListener("playing", handlePlaying);
        video.removeEventListener("ended", handleEnded);
      }
      window.removeEventListener("keydown", handleKey);

      if (session.watchdogIntervalId) {
        clearInterval(session.watchdogIntervalId);
        session.watchdogIntervalId = null;
      }
      if (session.finalGuaranteeTimeoutId) {
        clearTimeout(session.finalGuaranteeTimeoutId);
        session.finalGuaranteeTimeoutId = null;
      }
      if (session.fallbackTimeoutId) {
        clearTimeout(session.fallbackTimeoutId);
        session.fallbackTimeoutId = null;
      }
      if (session.overlayAnim) {
        try {
          session.overlayAnim.cancel();
        } catch {}
        session.overlayAnim = null;
      }
      if (session.skipAnim) {
        try {
          session.skipAnim.cancel();
        } catch {}
        session.skipAnim = null;
      }
    };
  }, [isUnmounted]);

  if (isUnmounted) {
    return null;
  }

  return (
    <div
      ref={overlayRef}
      id="intro-splash-overlay"
      className="fixed inset-0 z-[9999] flex items-center justify-center cursor-pointer select-none"
      style={{ backgroundColor: "#020106", opacity: 1 }}
      onClick={handleSkip}
    >
      <style dangerouslySetInnerHTML={{__html: `
        html[data-intro-seen="1"] #intro-splash-overlay,
        @media (prefers-reduced-motion: reduce) {
          #intro-splash-overlay {
            display: none !important;
          }
        }
        #intro-content-group {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        #intro-video {
          width: 68vw;
          opacity: 0;
          animation: introVideoFadeIn 300ms ease-in forwards;
        }
        @media (min-width: 768px) {
          #intro-video {
            width: min(52vh, 460px);
          }
        }
        .intro-text-container {
          margin-top: 16px;
          font-family: var(--font-anton);
          color: var(--ice);
          font-size: clamp(1.6rem, 4vw, 2.6rem);
          letter-spacing: 0.03em;
        }
        .intro-char {
          display: inline-block;
          opacity: 0;
          transform: translateY(10px);
          filter: blur(6px);
          animation: introCharReveal 450ms ease-out both;
          animation-delay: calc(800ms + var(--i) * 45ms);
        }
        
        @keyframes introVideoFadeIn {
          to { opacity: 1; }
        }
        @keyframes introCharReveal {
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }
      `}} />

      <div id="intro-content-group">
        <video
          ref={videoRef}
          id="intro-video"
          muted
          playsInline
          autoPlay
          preload="auto"
          aria-hidden="true"
          poster="/intro/origami-poster.jpg"
          className="object-cover"
        >
          <source src="/intro/origami.webm" type="video/webm" />
          <source src="/intro/origami.mp4" type="video/mp4" />
        </video>

        <div className="intro-text-container" aria-hidden="true">
          {chars.map((char, i) => (
            <span
              key={i}
              className="intro-char"
              style={{
                "--i": i,
                color: char === "." ? "var(--steel)" : "inherit"
              } as React.CSSProperties}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </div>
        <span className="sr-only">{introText}</span>
      </div>

      <div
        ref={skipLabelRef}
        id="intro-skip-button"
        className="absolute bottom-6 right-6 text-sm uppercase tracking-wide text-muted font-semibold z-10"
      >
        Skip
      </div>
    </div>
  );
}

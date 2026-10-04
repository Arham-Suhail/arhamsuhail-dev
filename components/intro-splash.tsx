"use client";

import { useEffect } from "react";
import { siteData } from "../data/site";

export default function IntroSplash() {
  const introText = (siteData as { introText?: string, introEnabled?: boolean }).introText || "Automations.";
  const chars = introText.split("");

  const skipIntro = () => {
    const overlay = document.getElementById("intro-splash-overlay");
    if (!overlay || overlay.classList.contains("intro-skip-fade")) return;
    
    if (document.documentElement.hasAttribute("data-intro-seen")) return;

    overlay.classList.add("intro-skip-fade");
    window.dispatchEvent(new CustomEvent("intro:reveal"));
    
    setTimeout(() => {
      document.body.style.overflow = "";
      const freq = (siteData as { introFrequency?: string }).introFrequency || "always";
      if (freq === "session") sessionStorage.setItem("introSeen", "1");
      document.documentElement.setAttribute("data-intro-seen", "1");
      overlay.style.display = "none";
    }, 300);
  };

  useEffect(() => {
    const freq = (siteData as { introFrequency?: string }).introFrequency || "always";
    const isSeen = (freq === "session" && sessionStorage.getItem("introSeen") === "1") || document.documentElement.hasAttribute("data-intro-seen");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const introEnabled = (siteData as { introText?: string, introEnabled?: boolean }).introEnabled !== false;

    if (isSeen || prefersReducedMotion || !introEnabled) {
      document.documentElement.setAttribute("data-intro-seen", "1");
      window.dispatchEvent(new CustomEvent("intro:reveal"));
      const overlay = document.getElementById("intro-splash-overlay");
      if (overlay) overlay.style.display = "none";
      return;
    }

    document.body.style.overflow = "hidden";

    let revealed = false;
    const handleReveal = () => {
      if (!revealed) {
        revealed = true;
        window.dispatchEvent(new CustomEvent("intro:reveal"));
      }
    };

    const handleDone = () => {
      document.body.style.overflow = "";
      if (freq === "session") sessionStorage.setItem("introSeen", "1");
      document.documentElement.setAttribute("data-intro-seen", "1");
      const overlay = document.getElementById("intro-splash-overlay");
      if (overlay) overlay.remove();
    };

    const revealTimer = setTimeout(handleReveal, 2700);
    const doneTimer = setTimeout(handleDone, 3400);

    const handleKey = () => skipIntro();
    window.addEventListener("keydown", handleKey);

    return () => {
      clearTimeout(revealTimer);
      clearTimeout(doneTimer);
      window.removeEventListener("keydown", handleKey);
    };
  }, []);

  return (
    <div
      id="intro-splash-overlay"
      className="fixed inset-0 z-[9999] flex items-center justify-center cursor-pointer select-none"
      style={{ backgroundColor: "#020106" }}
      onClick={skipIntro}
    >
      <style dangerouslySetInnerHTML={{__html: `
        #intro-splash-overlay {
          animation: introDissolve 700ms ease forwards;
          animation-delay: 2700ms;
        }
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
          animation: introGroupFade 400ms ease-in forwards;
          animation-delay: 2500ms;
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
        @keyframes introGroupFade {
          from {
            opacity: 1;
            transform: scale(1);
            filter: blur(0);
          }
          to {
            opacity: 0;
            transform: scale(1.04);
            filter: blur(6px);
          }
        }
        @keyframes introDissolve {
          from {
            opacity: 1;
            visibility: visible;
          }
          to {
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
          }
        }

        .intro-skip-fade {
          animation: introSkipFade 300ms ease-out forwards !important;
        }
        @keyframes introSkipFade {
          to {
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
          }
        }
      `}} />

      <div id="intro-content-group">
        <video
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

      <div className="absolute bottom-6 right-6 text-sm uppercase tracking-wide text-muted font-semibold z-10">
        Skip
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";

export default function Logo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const isSeen =
      typeof document !== "undefined" &&
      document.documentElement.hasAttribute("data-intro-seen");

    if (isSeen) {
      video.play().catch(() => {});
      return;
    }

    let idleId: number | null = null;
    let timerId: NodeJS.Timeout | null = null;

    const startPlaying = () => {
      const play = () => {
        video.play().catch(() => {});
      };
      if ("requestIdleCallback" in window) {
        idleId = (window as Window & { requestIdleCallback: (cb: () => void, opts: { timeout: number }) => number })
          .requestIdleCallback(play, { timeout: 1200 });
      } else {
        timerId = setTimeout(play, 800);
      }
    };

    window.addEventListener("intro:done", startPlaying, { once: true });
    return () => {
      window.removeEventListener("intro:done", startPlaying);
      if (idleId && "cancelIdleCallback" in window) {
        (window as Window & { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(idleId);
      }
      if (timerId) clearTimeout(timerId);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      src="/arham-wordmark.mp4"
      poster="/arham-wordmark.png"
      preload="none"
      loop
      muted
      playsInline
      className="h-12 w-auto object-contain mix-blend-screen"
    />
  );
}

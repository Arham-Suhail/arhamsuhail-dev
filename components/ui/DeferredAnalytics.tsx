"use client";

import { useState, useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import GoogleAnalytics from "./Analytics";

export default function DeferredAnalytics() {
  const [shouldLoad, setShouldLoad] = useState(() => {
    if (typeof window === "undefined") return false;
    return document.documentElement.hasAttribute("data-intro-seen");
  });

  useEffect(() => {
    if (shouldLoad) return;
    let idleId: number | null = null;
    let timerId: NodeJS.Timeout | null = null;

    const handleDone = () => {
      const initAnalytics = () => {
        if ("requestIdleCallback" in window) {
          idleId = (window as Window & { requestIdleCallback: (cb: () => void, opts: { timeout: number }) => number })
            .requestIdleCallback(() => setShouldLoad(true), { timeout: 2000 });
        } else {
          setShouldLoad(true);
        }
      };

      timerId = setTimeout(initAnalytics, 1200);
    };
    window.addEventListener("intro:done", handleDone, { once: true });
    return () => {
      window.removeEventListener("intro:done", handleDone);
      if (idleId && "cancelIdleCallback" in window) {
        (window as Window & { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(idleId);
      }
      if (timerId) clearTimeout(timerId);
    };
  }, [shouldLoad]);

  if (!shouldLoad) return null;

  return (
    <>
      <Analytics />
      <GoogleAnalytics />
    </>
  );
}

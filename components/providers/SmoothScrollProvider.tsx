"use client";

import { ReactNode, useEffect, createContext, useContext, useState } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import { useReducedMotion } from "framer-motion";

export const SmoothScrollContext = createContext<{
  scrollTo: (target: string | HTMLElement, offset?: number) => void;
}>({
  scrollTo: () => {},
});

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}

function AnchorRouter({ children }: { children: ReactNode }) {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (href && href.startsWith("#") && href.length > 1) {
        const el = document.querySelector(href);
        if (el) {
          e.preventDefault();
          lenis.scrollTo(el as HTMLElement, { offset: -90 });
        }
      } else if (href === "#" || href === "#top") {
        e.preventDefault();
        lenis.scrollTo(0, { offset: 0 });
      }
    };

    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, [lenis]);

  const scrollTo = (target: string | HTMLElement, offset = -90) => {
    if (lenis) {
      lenis.scrollTo(target, { offset });
    } else if (typeof target === "string") {
      const el = document.querySelector(target);
      el?.scrollIntoView({ behavior: "smooth" });
    } else {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <SmoothScrollContext.Provider value={{ scrollTo }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const prefersReducedMotion = useReducedMotion();
  const [shouldInitLenis, setShouldInitLenis] = useState(() => {
    if (typeof window === "undefined") return false;
    const isSeen = document.documentElement.hasAttribute("data-intro-seen");
    return isSeen || prefersReducedMotion;
  });

  useEffect(() => {
    if (shouldInitLenis || prefersReducedMotion) return;

    let idleId: number | null = null;
    let timerId: NodeJS.Timeout | null = null;

    const handleSplashGone = () => {
      const scheduleInit = () => {
        if ("requestIdleCallback" in window) {
          idleId = (window as Window & { requestIdleCallback: (cb: () => void, opts: { timeout: number }) => number }).requestIdleCallback(() => {
            setShouldInitLenis(true);
          }, { timeout: 2000 });
        } else {
          setShouldInitLenis(true);
        }
      };

      // Defer Lenis initialization until 1100ms after intro:done (after the 900ms Hero entrance finishes)
      timerId = setTimeout(scheduleInit, 1100);
    };

    window.addEventListener("intro:done", handleSplashGone, { once: true });
    return () => {
      window.removeEventListener("intro:done", handleSplashGone);
      if (idleId && "cancelIdleCallback" in window) {
        (window as Window & { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(idleId);
      }
      if (timerId) clearTimeout(timerId);
    };
  }, [shouldInitLenis, prefersReducedMotion]);

  if (prefersReducedMotion || !shouldInitLenis) {
    return <AnchorRouter>{children}</AnchorRouter>;
  }

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        smoothWheel: true,
      }}
    >
      <AnchorRouter>{children}</AnchorRouter>
    </ReactLenis>
  );
}

export default SmoothScrollProvider;

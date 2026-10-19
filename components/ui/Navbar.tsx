"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { useLenis } from "lenis/react";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import { siteData } from "../../data/site";
import { cn } from "@/lib/utils";

const links = [
  { name: "About", href: "#about", id: "about" },
  { name: "Services", href: "#services", id: "services" },
  { name: "Work", href: "#work", id: "work" },
  { name: "Contact", href: "#contact", id: "contact" },
];

const sectionNames: Record<string, string> = {
  about: "About",
  services: "Services",
  work: "Work",
  contact: "Contact",
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isTouchExpanded, setIsTouchExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");

  const pathname = usePathname();
  const router = useRouter();
  const lenis = useLenis();
  const collapseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 2px scroll progress along bottom edge inside the pill
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  // Track scroll position for compacting (> 80px)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
      if (window.scrollY < 120) {
        setActiveSection("");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Track active section with IntersectionObserver (deferred until after splash is gone)
  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    let idleId: number | null = null;
    let timerId: NodeJS.Timeout | null = null;

    const startObserver = () => {
      const sectionIds = ["about", "services", "work", "contact"];
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(entry.target.id);
            }
          });
        },
        {
          rootMargin: "-45% 0px -50% 0px",
        }
      );
      observer = obs;

      sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) obs.observe(el);
      });
    };

    const isSeen = typeof document !== "undefined" && document.documentElement.hasAttribute("data-intro-seen");
    if (isSeen) {
      if ("requestIdleCallback" in window) {
        idleId = (window as Window & { requestIdleCallback: (cb: () => void, opts: { timeout: number }) => number }).requestIdleCallback(startObserver, { timeout: 1200 });
      } else {
        timerId = setTimeout(startObserver, 800);
      }
    } else {
      const handleDone = () => {
        timerId = setTimeout(() => {
          if ("requestIdleCallback" in window) {
            idleId = (window as Window & { requestIdleCallback: (cb: () => void, opts: { timeout: number }) => number }).requestIdleCallback(startObserver, { timeout: 2000 });
          } else {
            startObserver();
          }
        }, 1100);
      };
      window.addEventListener("intro:done", handleDone, { once: true });
    }

    return () => {
      if (idleId && "cancelIdleCallback" in window) {
        (window as Window & { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(idleId);
      }
      if (timerId) clearTimeout(timerId);
      observer?.disconnect();
    };
  }, []);

  const clearCollapseTimer = () => {
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
  };

  const handleMouseEnter = () => {
    clearCollapseTimer();
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    clearCollapseTimer();
    // 120ms collapse delay to avoid flicker
    collapseTimerRef.current = setTimeout(() => {
      setIsHovered(false);
      setIsTouchExpanded(false);
    }, 120);
  };

  const handleFocus = () => {
    clearCollapseTimer();
    setIsFocused(true);
  };

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      clearCollapseTimer();
      collapseTimerRef.current = setTimeout(() => {
        setIsFocused(false);
        setIsTouchExpanded(false);
      }, 120);
    }
  };

  const bookCallUrl = siteData.calendlyUrl || siteData.whatsappLink;

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsOpen(false);
    setIsHovered(false);
    setIsFocused(false);
    setIsTouchExpanded(false);

    if (pathname !== "/") {
      router.push(`/${href}`);
      return;
    }

    if (lenis) {
      const target = document.querySelector(href);
      if (target) {
        lenis.scrollTo(target as HTMLElement, { offset: -90 });
      }
    } else {
      const target = document.querySelector(href);
      target?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      setIsOpen(false);
      setIsHovered(false);
      setIsFocused(false);
      setIsTouchExpanded(false);
      if (lenis) {
        lenis.scrollTo(0, { offset: 0 });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const isCompacted = isScrolled && !isHovered && !isFocused && !isTouchExpanded;
  const activeSectionName = (activeSection && sectionNames[activeSection]) || "Overview";

  // Handle touch toggle on compact island
  const handleTouchIslandToggle = () => {
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
      if (isCompacted) {
        setIsTouchExpanded(true);
      } else if (isScrolled) {
        setIsTouchExpanded(false);
      }
    }
  };

  return (
    <div className="fixed top-4 inset-x-0 z-50 flex justify-center pointer-events-none px-4 pt-0 overflow-visible">
      {/* Desktop Floating Pill Island */}
      <motion.header
        layout
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={handleTouchIslandToggle}
        className="hidden md:flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.37)] pointer-events-auto relative overflow-hidden"
      >
        {/* Arham. Logo Left */}
        <Link
          href="/"
          onClick={handleLogoClick}
          className="flex items-center pr-2 [&_video]:h-7 [&_video]:w-auto shrink-0 select-none"
          aria-label="Arham Suhail Home"
        >
          <Logo />
        </Link>

        {/* Dynamic Compacted vs Full Expanded View (crossfaded) */}
        <AnimatePresence mode="popLayout" initial={false}>
          {isCompacted ? (
            <motion.div
              key="compacted"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-2 cursor-pointer"
              title="Expand menu"
            >
              {/* Current Section Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-semibold uppercase tracking-wider text-ice whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-ice animate-pulse" />
                <span>{activeSectionName}</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3"
            >
              {/* Links Center with Framer layoutId sliding pill */}
              <nav className="flex items-center gap-1 px-1">
                {links.map((link) => {
                  const isActive = activeSection === link.id;
                  return (
                    <a
                      key={link.id}
                      href={link.href}
                      onClick={(e) => handleLinkClick(e, link.href)}
                      className={cn(
                        "relative px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-full transition-colors whitespace-nowrap active:scale-[0.98]",
                        isActive ? "text-white" : "text-neutral-400 hover:text-white"
                      )}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="navbar-active-pill"
                          className="absolute inset-0 rounded-full bg-white/10 border border-white/15"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">{link.name}</span>
                    </a>
                  );
                })}
              </nav>

              {/* Book a Call Pill Right */}
              <a
                href={bookCallUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative rounded-full bg-ice text-bg px-4 py-1.5 text-xs font-semibold uppercase tracking-wider hover:bg-ice-hover transition-colors whitespace-nowrap shadow-[0_0_15px_rgba(220,230,242,0.25)] shrink-0 active:scale-[0.98]"
              >
                Book a Call
              </a>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2px Scroll-Progress Line at Bottom Edge Inside Pill */}
        <motion.div
          style={{ scaleX }}
          className="absolute bottom-0 inset-x-4 h-[2px] bg-gradient-to-r from-ice/40 via-ice to-ice/40 origin-left rounded-full pointer-events-none"
        />
      </motion.header>

      {/* Mobile Floating Pill & Downward Expanding Sheet */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
        className={cn(
          "md:hidden flex flex-col border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.37)] pointer-events-auto transition-all w-full max-w-sm relative overflow-hidden",
          isOpen ? "rounded-3xl p-4 bg-surface/95" : "rounded-full px-4 py-2"
        )}
      >
        {/* Mobile Pill Row */}
        <div className="flex items-center justify-between gap-2 w-full">
          <Link
            href="/"
            onClick={handleLogoClick}
            className="flex items-center [&_video]:h-7 [&_video]:w-auto shrink-0 select-none"
            aria-label="Arham Suhail Home"
          >
            <Logo />
          </Link>

          <div className="flex items-center gap-2">
            <a
              href={bookCallUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-ice text-bg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider hover:bg-ice-hover transition-colors whitespace-nowrap shadow-sm active:scale-[0.98]"
            >
              Book a Call
            </a>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
              className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer active:scale-[0.98]"
            >
              {isOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* 2px Scroll-Progress Line at Bottom Edge on Mobile */}
        <motion.div
          style={{ scaleX }}
          className="absolute bottom-0 inset-x-3 h-[2px] bg-gradient-to-r from-ice/40 via-ice to-ice/40 origin-left rounded-full pointer-events-none"
        />

        {/* Downward Expanding Sheet */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-2 pt-4 mt-3 border-t border-white/10 w-full overflow-hidden"
            >
              {links.map((link) => {
                const isActive = activeSection === link.id;
                return (
                  <a
                    key={link.id}
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-2xl text-xs uppercase tracking-widest font-semibold transition-colors active:scale-[0.98]",
                      isActive
                        ? "bg-white/10 text-white border border-white/15"
                        : "text-neutral-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <span>{link.name}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-ice" />
                    )}
                  </a>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

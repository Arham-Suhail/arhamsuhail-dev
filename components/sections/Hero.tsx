"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { Variants } from "framer-motion";
import { siteData } from "../../data/site";
import { ArrowRight, GraduationCap, Globe, Cpu, Rocket } from "lucide-react";
import Image from "next/image";

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [revealState, setRevealState] = useState<"ssr" | "hidden" | "revealed">("ssr");

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const freq = (siteData as { introFrequency?: string }).introFrequency || "always";
    const isSeen = (freq === "session" && sessionStorage.getItem("introSeen") === "1") || document.documentElement.hasAttribute("data-intro-seen");
    const introEnabled = (siteData as { introEnabled?: boolean }).introEnabled !== false;

    if (prefersReducedMotion || isSeen || !introEnabled) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRevealState("revealed");
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRevealState("hidden");
      let revealed = false;
      const handleReveal = () => {
        if (!revealed) {
          revealed = true;
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setRevealState("revealed");
        }
      };
      window.addEventListener("intro:reveal", handleReveal);
      const maxTimer = setTimeout(handleReveal, 4000);
      return () => {
        window.removeEventListener("intro:reveal", handleReveal);
        clearTimeout(maxTimer);
      };
    }
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const nameY = useTransform(scrollYProgress, [0, 1], ["0px", "80px"]);
  const photoY = useTransform(scrollYProgress, [0, 1], ["0px", "40px"]);

  const scrollToServices = (e: React.MouseEvent) => {
    e.preventDefault();
    document.querySelector("#services")?.scrollIntoView({ behavior: "smooth" });
  };

  const bookCallUrl = siteData.calendlyUrl || siteData.whatsappLink;

  const chips = [
    { icon: <GraduationCap size={16} />, text: "BS Software Engineering" },
    { icon: <Globe size={16} />, text: "Clients in Pakistan and worldwide" },
    { icon: <Cpu size={16} />, text: "AI-first approach" },
    { icon: <Rocket size={16} />, text: "End-to-end delivery" },
  ];

  const giantNameVariants: Variants = {
    ssr: { opacity: 1, y: 0, scale: 1 },
    hidden: { opacity: 0, y: 24, scale: 1.03, transition: { duration: 0 } },
    revealed: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.9, ease: "easeOut" } },
  };

  const photoVariants: Variants = {
    ssr: { opacity: 1, y: 0 },
    hidden: { opacity: 0, y: 16, transition: { duration: 0 } },
    revealed: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.15, ease: "easeOut" } },
  };

  const contentVariants: Variants = {
    ssr: { opacity: 1, y: 0 },
    hidden: { opacity: 0, y: 20, transition: { duration: 0 } },
    revealed: (i: number) => ({
      opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.35 + i * 0.09, ease: "easeOut" }
    })
  };

  return (
    <section ref={containerRef} className="relative w-full lg:min-h-screen bg-bg overflow-hidden flex flex-col lg:flex-row lg:items-end pt-[88px] lg:pt-0">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-glow rounded-full blur-[100px] pointer-events-none z-0 opacity-50" />

      {/* LAYER 1: Giant Name */}
      <motion.div 
        id="giant-name"
        style={{ y: nameY }}
        className="relative lg:absolute lg:top-[15vh] w-full lg:max-w-[1680px] mx-auto px-5 lg:px-[5vw] flex flex-col lg:flex-row items-start lg:items-center justify-start lg:justify-between z-10 pointer-events-none select-none text-ice font-display"
      >
        <motion.div 
          className="w-full flex flex-col lg:flex-row items-start lg:items-center justify-start lg:justify-between origin-center"
          variants={giantNameVariants}
          initial="ssr"
          animate={revealState}
        >
          <div id="giant-name-text" className="hidden lg:block text-[14vw] leading-[0.85] tracking-tight">ARHAM</div>
          <div className="hidden lg:block text-[14vw] leading-[0.85] tracking-tight">SUHAIL</div>
          <div className="block lg:hidden text-[min(26vw,150px)] leading-[0.85] tracking-tight text-left">
            <div>ARHAM</div>
            <div>SUHAIL</div>
          </div>
        </motion.div>
      </motion.div>

      {/* LAYER 2: Photo */}
      <motion.div 
        style={{ y: photoY }}
        className="relative lg:absolute lg:bottom-0 left-1/2 2xl:left-[52%] -translate-x-1/2 w-[min(82vw,420px)] lg:w-auto h-auto lg:h-[min(90vh,50vw)] lg:[@media(max-height:700px)]:h-[min(86vh,50vw)] aspect-[1400/1954] z-20 pointer-events-none mt-[-25%] sm:mt-[-20%] md:mt-[-15%] lg:mt-0"
      >
        <motion.div 
          className="relative w-full h-full"
          style={{ maskImage: "linear-gradient(to bottom, black 85%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, black 85%, transparent 100%)" }}
          variants={photoVariants}
          initial="ssr"
          animate={revealState}
        >
          <Image
            src="/images/arham-hero.png"
            alt="Arham Suhail"
            fill
            priority
            className="object-cover lg:object-contain object-bottom"
          />
        </motion.div>
      </motion.div>

      {/* LAYER 3: Content */}
      <div 
        id="content-wrapper" 
        className="relative z-30 w-full lg:min-h-[100dvh] flex flex-col max-w-[640px] lg:max-w-[1680px] mx-auto px-5 lg:px-[5vw] pointer-events-none pb-12 lg:pb-32 lg:[@media(max-height:700px)]:pb-12 lg:pt-[calc(15vh+11.9vw+40px)] lg:mt-0"
      >
        
        {/* Bottom Content Area */}
        <div className="mt-auto flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 lg:gap-12 w-full relative z-30">
          
          {/* Bottom Left: Main Pitch */}
          <div id="left-block" className="flex flex-col items-start gap-4 lg:gap-3 xl:gap-4 w-full lg:max-w-[26vw] xl:max-w-[28vw] 2xl:max-w-[26vw] pointer-events-auto">
            
            {/* Mobile Signature */}
            <motion.div
              variants={contentVariants}
              custom={0}
              initial="ssr"
              animate={revealState}
              className="ml-2 lg:hidden"
            >
              <span className="font-script text-4xl text-ice -rotate-6 inline-block">Arham Suhail</span>
            </motion.div>

            <motion.div
              variants={contentVariants}
              custom={1}
              initial="ssr"
              animate={revealState}
              className="space-y-2 w-full"
            >
              <h1 className="text-[clamp(1.6rem,3vw,2.9rem)] font-semibold leading-[1.1] text-text">
                I build AI systems <br className="hidden lg:block" />that run your <br className="hidden lg:block" />business.
              </h1>
            </motion.div>
            
            <motion.div
              variants={contentVariants}
              custom={2}
              initial="ssr"
              animate={revealState}
              className="w-full"
            >
              <p className="text-sm xl:text-lg text-muted leading-relaxed max-w-[90%]">
                AI automation, AI calling agents, and modern websites for businesses that want to save time and never miss a customer.
              </p>
            </motion.div>

            <motion.div
              variants={contentVariants}
              custom={3}
              initial="ssr"
              animate={revealState}
              className="flex flex-col xl:flex-row items-stretch xl:items-center gap-2 xl:gap-4 w-full mt-1 lg:mt-0"
            >
              <a
                href={bookCallUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full xl:w-auto bg-ice text-bg px-6 py-3 lg:px-6 lg:py-3 xl:px-8 xl:py-3.5 rounded-full text-sm xl:text-base font-semibold uppercase tracking-wider hover:bg-ice-hover transition-colors flex items-center justify-center gap-2 group whitespace-nowrap"
              >
                Book a Call
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <button
                onClick={scrollToServices}
                className="w-full xl:w-auto px-6 py-3 lg:px-6 lg:py-3 xl:px-8 xl:py-3.5 rounded-full text-sm xl:text-base font-semibold uppercase tracking-wider text-text border border-border hover:border-steel transition-colors whitespace-nowrap"
              >
                View Services
              </button>
            </motion.div>
          </div>

          {/* Bottom Right: Signature and Stat Chips */}
          <div
            id="right-block"
            className="flex flex-col gap-2 pointer-events-auto w-full lg:w-[22vw] lg:min-w-[210px] xl:w-[320px] self-start lg:self-end mt-4 lg:mt-0"
          >
            {/* Desktop Signature */}
            <motion.div 
              variants={contentVariants}
              custom={4}
              initial="ssr"
              animate={revealState}
              className="hidden lg:flex justify-end mb-[4vh] mr-2"
            >
              <span className="font-script text-[clamp(40px,4vw,64px)] text-ice -rotate-6">Arham Suhail</span>
            </motion.div>

            <div className="grid grid-cols-2 lg:flex lg:flex-col gap-2 w-full">
              {chips.map((chip, i) => (
                <motion.div 
                  key={i} 
                  variants={contentVariants}
                  custom={5 + i}
                  initial="ssr"
                  animate={revealState}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-2 xl:gap-4 text-xs lg:text-[11px] xl:text-sm text-text bg-surface/80 backdrop-blur-md px-3 py-2 sm:px-4 sm:py-3 lg:px-3 lg:py-2 xl:px-5 xl:py-3.5 rounded-xl border border-border hover:border-steel/50 transition-colors w-full h-full"
                >
                  <span className="text-steel shrink-0">{chip.icon}</span>
                  <span className="font-medium tracking-wide leading-tight">{chip.text}</span>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { siteData } from "../../data/site";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { RevealText } from "../ui/reveal-text";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { ShaderBackground } from "@/components/ui/waves-shader";
import { introStore } from "@/lib/intro-store";
import { BorderBeam } from "@/components/ui/border-beam";

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const nameY = useTransform(scrollYProgress, [0, 1], ["0px", "80px"]);
  const photoY = useTransform(scrollYProgress, [0, 1], ["0px", "40px"]);

  const bookCallUrl = siteData.calendlyUrl || siteData.whatsappLink;

  const specs = [
    { label: "FOCUS", value: "AI Agents & Automation" },
    { label: "DELIVERY", value: "End-to-End Architecture" },
    { label: "REACH", value: "Global Client Operations" },
  ];

  return (
    <section ref={containerRef} className="relative w-full min-h-[100svh] lg:min-h-screen bg-bg overflow-hidden flex flex-col lg:flex-row lg:items-end pt-[72px] md:pt-[88px] lg:pt-0">
      {/* Background Layer: WebGL Waves Shader & Atmospheric Lighting */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[radial-gradient(ellipse_at_50%_45%,rgba(61,69,84,0.42)_0%,rgba(20,23,31,0.25)_55%,transparent_80%)]">
        <ShaderBackground onReady={() => introStore.setShaderReady()} className="h-full w-full opacity-90" />
        {/* Soft atmospheric radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-glow/30 rounded-full blur-[120px] pointer-events-none" />
        {/* Bottom feathering gradient to guarantee a seamless transition to the next section */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg via-bg/60 to-transparent pointer-events-none" />
      </div>

      {/* LAYER 1: Giant Name */}
      <motion.div 
        id="giant-name"
        style={{ y: nameY }}
        className="relative lg:absolute lg:top-[15vh] w-full lg:max-w-[1680px] mx-auto px-5 lg:px-[5vw] flex flex-col lg:flex-row items-start lg:items-center justify-start lg:justify-between z-10 select-none text-ice font-display pointer-events-auto"
      >
        {/* LAYER 3d: First-load entrance replaced with CSS transitions keyed on html[data-hero-state] */}
        <div 
          className="w-full flex flex-col lg:flex-row items-start lg:items-center justify-start lg:justify-between origin-center hero-entrance-name"
        >
          <div id="giant-name-text" className="hidden lg:block leading-[0.85]">
            <RevealText text="ARHAM" textColor="text-ice" overlayColor="text-steel" fontSize="text-[14vw]" isRevealed={true} />
          </div>
          <div className="hidden lg:block leading-[0.85]">
            <RevealText text="SUHAIL" textColor="text-ice" overlayColor="text-steel" fontSize="text-[14vw]" isRevealed={true} />
          </div>
          <div className="block lg:hidden text-left flex flex-col gap-1 sm:gap-1.5 md:gap-0 leading-none md:leading-[0.85]">
            <RevealText text="ARHAM" textColor="text-ice" overlayColor="text-steel" fontSize="text-[clamp(3.1rem,14.5vw,4.8rem)] md:text-[min(26vw,150px)]" className="!justify-start leading-none md:leading-[0.85]" isRevealed={true} />
            <RevealText text="SUHAIL" textColor="text-ice" overlayColor="text-steel" fontSize="text-[clamp(3.1rem,14.5vw,4.8rem)] md:text-[min(26vw,150px)]" className="!justify-start leading-none md:leading-[0.85]" isRevealed={true} />
          </div>
        </div>
      </motion.div>

      {/* LAYER 2: Photo */}
      <motion.div 
        style={{ y: photoY }}
        className="relative lg:absolute lg:bottom-0 left-1/2 2xl:left-[52%] -translate-x-1/2 max-md:h-[min(38svh,300px)] max-md:w-auto md:w-[min(82vw,420px)] lg:w-auto h-auto lg:h-[min(90vh,50vw)] lg:[@media(max-height:700px)]:h-[min(86vh,50vw)] aspect-[1400/1954] z-20 pointer-events-none -mt-3 sm:-mt-4 md:mt-[-15%] lg:mt-0"
      >
        <div 
          className="relative w-full h-full hero-entrance-photo hero-photo-mask"
        >
          <Image
            src="/images/arham-hero.png"
            alt="Arham Suhail"
            fill
            priority
            sizes="(max-width: 768px) 82vw, (max-width: 1280px) 420px, 460px"
            className="object-contain object-bottom"
          />
        </div>
      </motion.div>

      {/* LAYER 3: Content */}
      <div 
        id="content-wrapper" 
        className="relative z-30 w-full lg:min-h-[100dvh] flex flex-col max-w-[640px] lg:max-w-[1680px] mx-auto px-5 lg:px-[5vw] pointer-events-none pb-8 sm:pb-12 lg:pb-32 lg:[@media(max-height:700px)]:pb-12 lg:pt-[calc(15vh+11.9vw+40px)] lg:mt-0"
      >
        
        {/* Bottom Content Area */}
        <div className="mt-auto flex flex-col lg:flex-row justify-between items-start lg:items-end gap-5 sm:gap-6 lg:gap-12 w-full relative z-30">
          
          {/* Bottom Left: Compact & High-Contrast Main Pitch */}
          <div
            id="left-block"
            className="flex flex-col items-start space-y-3 sm:space-y-4 md:space-y-5 w-full max-w-[360px] pointer-events-auto pt-1 sm:pt-4 md:pt-7"
          >
            {/* Headline */}
            <div className="w-full hero-entrance-headline">
              <h1 className="text-2xl sm:text-4xl lg:text-[40px] font-semibold tracking-tight leading-[1.15] sm:leading-[1.12] text-text">
                I build AI systems <br className="hidden sm:block" />that run your <br className="hidden sm:block" />business.
              </h1>
            </div>
            
            {/* Subcopy */}
            <div className="w-full hero-entrance-subcopy">
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-[320px]">
                Custom AI calling agents, workflow automation, and high-converting web systems built for scale.
              </p>
            </div>

            {/* Side-by-Side CTAs */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-0.5 sm:pt-1 hero-entrance-ctas">
              <MagneticButton
                as="a"
                href={bookCallUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative px-5 py-2.5 sm:px-6 sm:py-3 rounded-full bg-white text-black text-xs font-semibold uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 group whitespace-nowrap shadow-[0_0_20px_rgba(255,255,255,0.2)] overflow-hidden"
              >
                <span className="relative z-10">Book a Call</span>
                <ArrowRight size={14} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                <BorderBeam revealOn="hover" className="pointer-events-none absolute inset-0 rounded-full" />
              </MagneticButton>
              <a
                href="#services"
                className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs font-medium uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
              >
                Explore Services
              </a>
            </div>
          </div>

          {/* Bottom Right: Architectural Spec List */}
          <div
            id="right-block"
            className="flex flex-col items-start lg:items-end pointer-events-auto w-full max-w-[260px] xl:max-w-[280px] lg:ml-auto lg:mr-0 lg:translate-x-6 xl:translate-x-10 self-start lg:self-end mt-4 lg:mt-0 lg:translate-y-6 xl:translate-y-8"
          >
            {/* Editorial Spec List with Vertical Hairline */}
            <div className="border-l border-white/15 pl-5 space-y-4 w-full hero-entrance-specs">
              {specs.map((spec, i) => (
                <div key={i} className="space-y-0.5">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 block">
                    {spec.label}
                  </span>
                  <span className="text-sm font-medium text-neutral-200 block">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

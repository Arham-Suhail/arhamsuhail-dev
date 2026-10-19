"use client";

import { Target, Bot, Zap } from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Reveal } from "@/components/ui/reveal";
import { HangingBadge } from "@/components/ui/hanging-badge";

const cards = [
  { 
    icon: <Target className="text-ice" size={20} />, 
    title: "Problem first, tools second",
    desc: "I find what is slowing you down before touching any tool."
  },
  { 
    icon: <Bot className="text-ice" size={20} />, 
    title: "AI only where it pays off",
    desc: "If a simple script does the job, that is what you get."
  },
  { 
    icon: <Zap className="text-ice" size={20} />, 
    title: "Clean, fast, built to last",
    desc: "Fast, stable builds that do not break next month."
  }
];

export default function About() {
  return (
    <section id="about" className="pt-24 md:pt-32 pb-12 md:pb-16 relative scroll-mt-28">
      {/* 120px seam gradient blending */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[120px] bg-gradient-to-b from-bg via-bg/60 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[120px] bg-gradient-to-t from-bg via-bg/60 to-transparent z-10" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Heading, copy, mobile badge, and three principles */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <Reveal className="max-w-2xl">
              <span className="text-steel text-sm font-bold tracking-widest uppercase block">01 / About</span>
              <h2 className="font-display text-4xl md:text-5xl text-ice uppercase tracking-wide mt-3 mb-4">
                I&apos;m Arham. I build AI that does the boring work.
              </h2>
              <p className="text-base md:text-lg text-text/80 leading-relaxed">
                Automations, calling agents and websites for businesses that want more done with less effort.
              </p>
              <p className="text-sm md:text-base text-muted leading-relaxed mt-1">
                I start with the problem, not the tech. Based in Pakistan, working worldwide.
              </p>
            </Reveal>

            {/* Below lg: The badge sits under the copy, centered */}
            <div className="block lg:hidden my-8">
              <Reveal delay={0.06}>
                <HangingBadge />
              </Reveal>
            </div>

            {/* Three small rounded-2xl principle cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-8">
              {cards.map((card, i) => (
                <Reveal key={i} delay={i * 0.06}>
                  <SpotlightCard
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-5 flex flex-col items-start gap-2 h-[155px] justify-between"
                  >
                    <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 w-fit">
                      {card.icon}
                    </div>
                    <div>
                      <h3 className="text-xs md:text-sm font-semibold text-white tracking-tight">{card.title}</h3>
                      <p className="text-[11px] text-muted leading-relaxed mt-0.5">{card.desc}</p>
                    </div>
                  </SpotlightCard>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Right Column: Hanging Badge, vertically centered on lg screens */}
          <div className="hidden lg:flex lg:col-span-5 items-center justify-center">
            <Reveal delay={0.12}>
              <HangingBadge />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

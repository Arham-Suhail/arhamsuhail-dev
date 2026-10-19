"use client";

import { Quote } from "lucide-react";
import { testimonials } from "../../data/testimonials";
import { Reveal } from "@/components/ui/reveal";
import { SpotlightCard } from "@/components/ui/spotlight-card";

export default function Testimonials() {
  if (testimonials.length === 0) return null;

  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* 120px seam gradient blending */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[120px] bg-gradient-to-b from-bg via-bg/60 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[120px] bg-gradient-to-t from-bg via-bg/60 to-transparent z-10" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <Reveal className="text-center mb-16">
          <span className="text-ice text-sm font-bold tracking-widest uppercase">Testimonials</span>
          <h2 className="font-display text-4xl md:text-5xl tracking-wide uppercase mt-4">
            What Clients Say.
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <SpotlightCard className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6 relative hover:border-steel/50 transition-colors group h-full max-h-[260px] flex flex-col justify-between">
                <Quote className="text-steel/20 absolute top-5 right-5 group-hover:text-steel/40 transition-colors" size={36} />
                <p className="text-muted leading-relaxed text-sm mb-4 relative z-10 italic line-clamp-4">
                  &quot;{t.quote}&quot;
                </p>
                <div className="relative z-10 pt-3 border-t border-white/5">
                  <p className="text-sm font-semibold text-white tracking-tight">{t.name}</p>
                  <p className="text-xs text-muted mt-0.5">{t.title}</p>
                </div>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

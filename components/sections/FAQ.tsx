"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { buildWhatsAppLink } from "../../lib/whatsapp";
import { Reveal } from "@/components/ui/reveal";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { cn } from "@/lib/utils";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.152.564 4.246 1.637 6.095l-1.583 5.776 5.922-1.554A11.94 11.94 0 0 0 12.031 24c6.645 0 12.031-5.384 12.031-12.03S18.676 0 12.031 0zm5.836 17.15c-.247.697-1.42 1.353-1.956 1.41-.537.057-1.25.132-3.876-.95-3.176-1.31-5.234-4.558-5.394-4.77-.16-.213-1.285-1.713-1.285-3.267 0-1.553.815-2.316 1.106-2.616.29-.3.626-.374.834-.374.208 0 .416.002.6.01.183.007.426-.073.666.505.25.603.86 2.096.938 2.253.08.156.133.342.026.554-.106.213-.16.347-.32.535-.16.187-.336.41-.482.553-.16.156-.328.328-.145.644.183.315.815 1.348 1.752 2.183 1.213 1.082 2.222 1.417 2.534 1.564.312.146.495.127.682-.085.187-.212.802-.937 1.018-1.26.216-.323.432-.268.724-.158.29.11 1.836.866 2.15 1.022.312.156.52.234.595.364.076.13.076.757-.17 1.454z"/>
    </svg>
  );
}

const faqs = [
  {
    q: "What kind of businesses do you work with?",
    a: "I work with service businesses, agencies, and e-commerce brands that want to scale without adding overhead. Whether you need a lead qualification agent, an automated workflow, or a high-converting website, I build systems that solve real bottlenecks."
  },
  {
    q: "How long does a typical project take?",
    a: "Simple websites or automations can take 1-2 weeks. Complex AI calling agents or full-stack platforms take 3-6 weeks. I will give you a clear timeline during our discovery call."
  },
  {
    q: "Do you offer support after launch?",
    a: "Yes. Every project includes a post-launch support period to fix bugs and ensure everything runs smoothly. After that, we can arrange an ongoing maintenance or retainer plan if needed."
  },
  {
    q: "Can an AI calling agent really sound natural?",
    a: "Yes. Using tools like Vapi and Retell combined with the latest LLMs, modern voice agents have ultra-low latency, can handle interruptions gracefully, and sound remarkably human. I can show you live demos on a call."
  },
  {
    q: "How does pricing work?",
    a: "Every project is quoted individually after a short discovery call. I price based on the value and complexity of the solution, not by the hour, so you know exactly what your investment is upfront."
  }
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState(0);

  // Arrow keys switch questions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        setActiveIndex((prev) => (prev + 1) % faqs.length);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        setActiveIndex((prev) => (prev - 1 + faqs.length) % faqs.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const currentFaq = faqs[activeIndex];
  const whatsappUrl = buildWhatsAppLink(
    `Hi Arham, I have a question regarding: "${currentFaq.q}"`
  );

  return (
    <section id="faq" className="py-24 md:py-32 relative bg-surface-2/30 scroll-mt-28">
      {/* 120px seam gradient blending */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[120px] bg-gradient-to-b from-bg via-bg/60 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[120px] bg-gradient-to-t from-bg via-bg/60 to-transparent z-10" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <Reveal className="text-center mb-12">
          <span className="text-ice text-sm font-bold tracking-widest uppercase">04 / FAQ</span>
          <h2 className="font-display text-4xl md:text-5xl tracking-wide uppercase mt-4">
            Common Questions.
          </h2>
          <p className="text-muted mt-2 text-xs md:text-sm">
            Select a topic below or use arrow keys ← → to browse answers.
          </p>
        </Reveal>

        {/* Question Chips with sliding layoutId active pill */}
        <Reveal delay={0.06} className="mb-6">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {faqs.map((faq, i) => {
              const isActive = activeIndex === i;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    "relative px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-colors cursor-pointer border active:scale-[0.98]",
                    isActive
                      ? "text-white border-white/20"
                      : "text-muted hover:text-white border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="faq-active-chip"
                      className="absolute inset-0 rounded-full bg-white/10 border border-white/20 shadow-sm"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{faq.q}</span>
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Single Rounded-3xl Answer Card with fixed min-height to prevent reflow */}
        <Reveal delay={0.12}>
          <SpotlightCard className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8 min-h-[220px] md:min-h-[200px] flex flex-col justify-between relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col justify-between h-full flex-grow gap-6"
              >
                <div>
                  <h3 className="text-xl md:text-2xl font-semibold text-white tracking-tight mb-3">
                    {currentFaq.q}
                  </h3>
                  <p className="text-muted leading-relaxed text-sm md:text-base max-w-3xl">
                    {currentFaq.a}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between flex-wrap gap-3">
                  <span className="text-xs text-muted/60 uppercase tracking-widest font-mono">
                    {activeIndex + 1} / {faqs.length} • Arrow keys ← →
                  </span>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-1.5 rounded-full bg-ice text-bg text-xs font-semibold uppercase tracking-wider hover:bg-ice-hover transition-colors inline-flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
                  >
                    <span>Ask on WhatsApp</span>
                    <WhatsAppIcon />
                  </a>
                </div>
              </motion.div>
            </AnimatePresence>
          </SpotlightCard>
        </Reveal>
      </div>
    </section>
  );
}

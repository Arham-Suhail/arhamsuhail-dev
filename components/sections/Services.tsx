"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Bot, PhoneCall, Globe, X, ArrowUpRight, Info } from "lucide-react";
import { servicesData } from "../../data/services";
import { buildWhatsAppLink } from "../../lib/whatsapp";
import { track } from "@vercel/analytics";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Reveal } from "@/components/ui/reveal";
import { useLenis } from "lenis/react";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.152.564 4.246 1.637 6.095l-1.583 5.776 5.922-1.554A11.94 11.94 0 0 0 12.031 24c6.645 0 12.031-5.384 12.031-12.03S18.676 0 12.031 0zm5.836 17.15c-.247.697-1.42 1.353-1.956 1.41-.537.057-1.25.132-3.876-.95-3.176-1.31-5.234-4.558-5.394-4.77-.16-.213-1.285-1.713-1.285-3.267 0-1.553.815-2.316 1.106-2.616.29-.3.626-.374.834-.374.208 0 .416.002.6.01.183.007.426-.073.666.505.25.603.86 2.096.938 2.253.08.156.133.342.026.554-.106.213-.16.347-.32.535-.16.187-.336.41-.482.553-.16.156-.328.328-.145.644.183.315.815 1.348 1.752 2.183 1.213 1.082 2.222 1.417 2.534 1.564.312.146.495.127.682-.085.187-.212.802-.937 1.018-1.26.216-.323.432-.268.724-.158.29.11 1.836.866 2.15 1.022.312.156.52.234.595.364.076.13.076.757-.17 1.454z"/>
    </svg>
  );
}

function getServiceIcon(id: string) {
  if (id === "01") return <Bot className="text-ice" size={20} />;
  if (id === "02") return <PhoneCall className="text-ice" size={20} />;
  return <Globe className="text-ice" size={20} />;
}

export default function Services() {
  const [activeService, setActiveService] = useState<(typeof servicesData)[0] | null>(null);
  const [selectedChips, setSelectedChips] = useState<Set<string>>(new Set());
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const lenis = useLenis();

  // Handle Lenis stop/start without body overflow, escape key, focus trapping/return
  useEffect(() => {
    if (activeService) {
      lenis?.stop();
      dialogRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setActiveService(null);
          triggerRef.current?.focus();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        lenis?.start();
      };
    } else {
      lenis?.start();
    }
  }, [activeService, lenis]);

  const closeDialog = () => {
    setActiveService(null);
    triggerRef.current?.focus();
  };

  const handleOpenDialog = (svc: (typeof servicesData)[0], e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => {
    triggerRef.current = e.currentTarget;
    setSelectedChips(new Set());
    setActiveService(svc);
  };

  const handleChipToggle = (chip: string) => {
    setSelectedChips(prev => {
      const next = new Set(prev);
      if (next.has(chip)) next.delete(chip);
      else next.add(chip);
      return next;
    });
  };

  const handleWhatsAppClick = (svc: (typeof servicesData)[0]) => {
    let msg = svc.whatsappIntro;
    if (selectedChips.size > 0) {
      msg += ` I'm especially interested in: ${Array.from(selectedChips).join(", ")}.`;
    }
    msg += " Can we discuss the details?";

    track("WhatsApp Click", {
      source: `Service Card: ${svc.title}`,
      selectedChips: Array.from(selectedChips).join(", "),
    });
    window.open(buildWhatsAppLink(msg), "_blank", "noopener,noreferrer");
  };

  return (
    <section id="services" className="pt-12 md:pt-16 pb-24 md:py-32 relative bg-surface-2/30 scroll-mt-28">
      {/* 120px seam gradient blending */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[120px] bg-gradient-to-b from-bg via-bg/60 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[120px] bg-gradient-to-t from-bg via-bg/60 to-transparent z-10" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <Reveal className="mb-12">
          <span className="text-ice text-sm font-bold tracking-widest uppercase">02 / Services</span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-wide uppercase mt-4">
            How I can help.
          </h2>
          <p className="text-muted mt-3 max-w-2xl text-sm md:text-base">
            Pick a service, view details or tap Chat on WhatsApp. Pricing is quoted per project after a quick discovery chat.
          </p>
        </Reveal>

        {/* 3 Compact Tiles in One Row with CSS-Only Sibling Dimming */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch [&:hover>*:not(:hover)]:opacity-55 [&>*]:transition-opacity [&>*]:duration-200">
          {servicesData.map((svc, i) => (
            <Reveal key={svc.id} delay={i * 0.06} className="h-full">
              <motion.div
                layoutId={`service-card-${svc.id}`}
                className="h-full"
              >
                <SpotlightCard
                  className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-6 flex flex-col justify-between h-[230px] md:h-[240px] max-h-[260px] relative transition-all hover:border-steel/50"
                >
                  {/* Top row: Number chip and Icon */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono font-medium text-ice">
                      {svc.id}
                    </span>
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                      {getServiceIcon(svc.id)}
                    </div>
                  </div>

                  {/* Middle: Title & Tagline */}
                  <div className="my-auto py-2">
                    <h3 className="text-lg md:text-xl font-semibold text-white tracking-tight line-clamp-1">
                      {svc.title}
                    </h3>
                    <p className="text-xs md:text-sm text-muted leading-relaxed line-clamp-2 mt-1">
                      {svc.promise}
                    </p>
                  </div>

                  {/* Bottom: Two small pills (Details and Chat on WhatsApp) */}
                  <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                    <button
                      type="button"
                      onClick={(e) => handleOpenDialog(svc, e)}
                      className="flex-1 py-1.5 px-3 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-1 cursor-pointer active:scale-[0.98]"
                    >
                      <span>Details</span>
                      <ArrowUpRight size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleWhatsAppClick(svc)}
                      className="flex-1 py-1.5 px-3 rounded-full bg-ice text-bg text-xs font-semibold hover:bg-ice-hover transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-[0.98]"
                    >
                      <span>Chat</span>
                      <WhatsAppIcon />
                    </button>
                  </div>
                </SpotlightCard>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Shared-Element Morph Dialog */}
      <AnimatePresence>
        {activeService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
            {/* Backdrop: bg-black/60 + backdrop-blur-sm */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeDialog}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Dialog Container: rounded-3xl, max-w-[520px], bg-[#14161a], border-white/10 */}
            <motion.div
              layoutId={`service-card-${activeService.id}`}
              role="dialog"
              aria-modal="true"
              aria-labelledby="dialog-service-title"
              ref={dialogRef}
              tabIndex={-1}
              className="relative w-full max-w-[520px] max-h-[88vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#14161a] p-6 md:p-8 shadow-2xl z-10 flex flex-col gap-6 focus:outline-none"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={closeDialog}
                aria-label="Close details"
                className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer border border-white/10 active:scale-[0.98]"
              >
                <X size={18} />
              </button>

              {/* Dialog Header */}
              <div className="pr-10">
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono font-medium text-ice">
                    {activeService.id}
                  </span>
                  <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
                    {getServiceIcon(activeService.id)}
                  </div>
                </div>
                <h3 id="dialog-service-title" className="text-2xl font-semibold text-white tracking-tight">
                  {activeService.title}
                </h3>
                <p className="text-sm text-neutral-300 leading-relaxed mt-1">
                  {activeService.promise}
                </p>
              </div>

              {/* What you get list */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-steel block">
                  What you get
                </span>
                <ul className="space-y-2.5">
                  {activeService.whatYouGet.map((bullet, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-xs md:text-sm text-text/90">
                      <CheckCircle2 className="text-steel shrink-0 mt-0.5" size={16} />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Popular examples chip selector */}
              {activeService.examples && activeService.examples.length > 0 && (
                <div>
                  <div className="mb-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-steel block">
                      {activeService.examplesLabel || "Popular automations"}
                    </span>
                    <span className="text-xs text-muted">Tap what you need to include in your message:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeService.examples.map((ex, j) => {
                      const isSelected = selectedChips.has(ex);
                      return (
                        <button
                          key={j}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => handleChipToggle(ex)}
                          className={`text-xs rounded-full px-3 py-1 transition-colors border cursor-pointer active:scale-[0.98] ${
                            isSelected 
                              ? "bg-ice border-ice text-bg font-semibold" 
                              : "border-white/10 bg-white/[0.03] text-muted hover:border-steel hover:text-white"
                          }`}
                        >
                          {ex}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Also included (for calling agents) */}
              {"alsoIncluded" in activeService && activeService.alsoIncluded && (
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-text/80">
                  <span className="text-ice font-semibold">Included: </span>
                  {activeService.alsoIncluded}
                </div>
              )}

              {/* You provide note */}
              {activeService.disclaimer && (
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-muted flex items-start gap-2">
                  <Info size={15} className="text-steel shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-neutral-200">You provide: </strong>
                    {activeService.disclaimer.replace(/^You provide /, "")}
                  </span>
                </div>
              )}

              {/* Delivery Note */}
              <div className="text-xs text-muted flex items-center gap-1.5">
                <span className="font-semibold text-steel">Delivery: </span>
                <span>{activeService.delivery}</span>
              </div>

              {/* Dialog Action WhatsApp Button (ice pill CTA, never green) */}
              <button
                type="button"
                onClick={() => handleWhatsAppClick(activeService)}
                className="w-full flex items-center justify-center gap-2 bg-ice text-bg py-3 px-6 rounded-full font-semibold uppercase tracking-wider text-xs md:text-sm hover:bg-ice-hover transition-colors shadow-[0_0_20px_rgba(220,230,242,0.2)] cursor-pointer active:scale-[0.98]"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

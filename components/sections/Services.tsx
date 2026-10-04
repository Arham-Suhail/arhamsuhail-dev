"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { CheckCircle2, ChevronDown } from "lucide-react";
import { servicesData } from "../../data/services";
import { buildWhatsAppLink } from "../../lib/whatsapp";
import { track } from "@vercel/analytics";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.152.564 4.246 1.637 6.095l-1.583 5.776 5.922-1.554A11.94 11.94 0 0 0 12.031 24c6.645 0 12.031-5.384 12.031-12.03S18.676 0 12.031 0zm5.836 17.15c-.247.697-1.42 1.353-1.956 1.41-.537.057-1.25.132-3.876-.95-3.176-1.31-5.234-4.558-5.394-4.77-.16-.213-1.285-1.713-1.285-3.267 0-1.553.815-2.316 1.106-2.616.29-.3.626-.374.834-.374.208 0 .416.002.6.01.183.007.426-.073.666.505.25.603.86 2.096.938 2.253.08.156.133.342.026.554-.106.213-.16.347-.32.535-.16.187-.336.41-.482.553-.16.156-.328.328-.145.644.183.315.815 1.348 1.752 2.183 1.213 1.082 2.222 1.417 2.534 1.564.312.146.495.127.682-.085.187-.212.802-.937 1.018-1.26.216-.323.432-.268.724-.158.29.11 1.836.866 2.15 1.022.312.156.52.234.595.364.076.13.076.757-.17 1.454z"/>
    </svg>
  );
}

// Separate component to isolate expansion and selection state per card
function ServiceCard({ svc, index }: { svc: typeof servicesData[0] & { alsoIncluded?: string }, index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [selectedChips, setSelectedChips] = useState<Set<string>>(new Set());
  const prefersReducedMotion = useReducedMotion();

  const handleChipToggle = (chip: string) => {
    setSelectedChips(prev => {
      const next = new Set(prev);
      if (next.has(chip)) next.delete(chip);
      else next.add(chip);
      return next;
    });
  };

  const buildMessage = () => {
    let msg = svc.whatsappIntro;
    if (selectedChips.size > 0) {
      const arr = Array.from(selectedChips);
      msg += ` I'm especially interested in: ${arr.join(", ")}.`;
    }
    msg += " Can we discuss the details?";
    return msg;
  };

  const handleWhatsAppClick = () => {
    track("WhatsApp Click", { 
      source: `Service Card: ${svc.title}`,
      selectedChips: Array.from(selectedChips).join(", ")
    });
    window.open(buildWhatsAppLink(buildMessage()), "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ delay: index * 0.1 }}
      className="flex flex-col bg-surface border border-border rounded-[20px] p-8 hover:border-steel hover:-translate-y-[2px] transition-all duration-300 relative group w-full"
    >
      <div className="absolute inset-0 bg-steel/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-[20px]" />
      
      <div className="relative z-10 flex flex-col w-full">
        <span className="font-display text-5xl text-ice mb-6 block">{svc.id}</span>
        
        <div className="min-h-[120px]">
          <h3 className="text-2xl font-semibold mb-2">{svc.title}</h3>
          <p className="text-muted leading-relaxed font-medium">{svc.promise}</p>
        </div>
        
        <div className="mb-6 min-h-[200px]">
          <span className="text-xs font-bold uppercase tracking-wider text-steel mb-3 block">What you get</span>
          <ul className="space-y-3">
            {svc.whatYouGet.map((bullet, j) => (
              <li key={j} className="flex items-start gap-3 text-sm text-text/80">
                <CheckCircle2 className="text-steel shrink-0 mt-0.5" size={16} />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <button
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-controls={`panel-${svc.id}`}
          className="flex items-center justify-between w-full py-4 border-t border-border/50 text-sm font-semibold text-text hover:text-ice transition-colors group/toggle"
        >
          <div className="flex items-center gap-2">
            <span>{expanded ? "Less details" : "More details"}</span>
            {selectedChips.size > 0 && (
              <span className="bg-steel/20 text-steel text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full">
                {selectedChips.size} selected
              </span>
            )}
          </div>
          <ChevronDown 
            size={18} 
            className={`text-muted group-hover/toggle:text-ice transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} 
          />
        </button>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              id={`panel-${svc.id}`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
              className="overflow-hidden"
            >
              <div className="pt-2 pb-6 space-y-6">
                
                <div>
                  <div className="mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-steel block">{svc.examplesLabel}</span>
                    <span className="text-xs text-muted">Tap what you need. It will be included in your WhatsApp message.</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {svc.examples.map((ex, j) => {
                      const isSelected = selectedChips.has(ex);
                      return (
                        <button
                          key={j}
                          aria-pressed={isSelected}
                          onClick={() => handleChipToggle(ex)}
                          className={`text-xs rounded-full px-3 py-1.5 transition-colors border ${
                            isSelected 
                              ? "bg-ice border-ice text-bg font-semibold" 
                              : "border-border text-muted hover:border-steel"
                          }`}
                        >
                          {ex}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {svc.alsoIncluded && (
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-steel mb-2 block">Also included</span>
                    <p className="text-sm text-text/80">{svc.alsoIncluded}</p>
                  </div>
                )}
                
                <div className="text-sm">
                  <span className="font-semibold text-steel">Delivery: </span>
                  <span className="text-muted">{svc.delivery}</span>
                </div>
                
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-2">
          <button
            onClick={handleWhatsAppClick}
            className="w-full flex items-center justify-center gap-2 bg-ice text-bg py-3 px-6 rounded-full font-semibold uppercase tracking-wider text-sm hover:bg-ice-hover transition-colors"
          >
            <WhatsAppIcon />
            <span>Chat on WhatsApp</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function Services() {
  return (
    <section id="services" className="py-24 relative bg-surface-2/30">
      <div className="max-w-7xl mx-auto px-6">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-16"
        >
          <span className="text-ice text-sm font-bold tracking-widest uppercase">02 / Services</span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-wide uppercase mt-4">
            How I can help.
          </h2>
          <p className="text-muted mt-4 max-w-2xl">
            Pick a service, tap Chat on WhatsApp, and I&apos;ll reply within 24 hours. Pricing is quoted per project after a quick chat.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {servicesData.map((svc, i) => (
            <ServiceCard key={i} svc={svc} index={i} />
          ))}
        </div>

      </div>
    </section>
  );
}

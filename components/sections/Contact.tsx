"use client";

import { useState } from "react";
import { siteData } from "../../data/site";
import { ArrowRight, MessageSquare, Mail, Calendar, MapPin, Clock, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "../ui/Icons";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Reveal } from "@/components/ui/reveal";
import { SpotlightCard } from "@/components/ui/spotlight-card";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.152.564 4.246 1.637 6.095l-1.583 5.776 5.922-1.554A11.94 11.94 0 0 0 12.031 24c6.645 0 12.031-5.384 12.031-12.03S18.676 0 12.031 0zm5.836 17.15c-.247.697-1.42 1.353-1.956 1.41-.537.057-1.25.132-3.876-.95-3.176-1.31-5.234-4.558-5.394-4.77-.16-.213-1.285-1.713-1.285-3.267 0-1.553.815-2.316 1.106-2.616.29-.3.626-.374.834-.374.208 0 .416.002.6.01.183.007.426-.073.666.505.25.603.86 2.096.938 2.253.08.156.133.342.026.554-.106.213-.16.347-.32.535-.16.187-.336.41-.482.553-.16.156-.328.328-.145.644.183.315.815 1.348 1.752 2.183 1.213 1.082 2.222 1.417 2.534 1.564.312.146.495.127.682-.085.187-.212.802-.937 1.018-1.26.216-.323.432-.268.724-.158.29.11 1.836.866 2.15 1.022.312.156.52.234.595.364.076.13.076.757-.17 1.454z"/>
    </svg>
  );
}

const contactMethods = [
  {
    icon: <MessageSquare size={18} className="text-ice" />,
    label: "WhatsApp (Preferred in PK)",
    value: siteData.whatsappNumber,
    href: siteData.whatsappLink,
    target: "_blank",
  },
  {
    icon: <Mail size={18} className="text-ice" />,
    label: "Email (International)",
    value: siteData.email,
    href: `mailto:${siteData.email}`,
    target: undefined,
  },
  {
    icon: <Calendar size={18} className="text-ice" />,
    label: "Book a Discovery Call",
    value: "Schedule via Calendly",
    href: siteData.calendlyUrl,
    target: "_blank",
  },
];

export default function Contact() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");

    const formData = new FormData(e.currentTarget);

    // Honeypot check
    if (formData.get("website")) {
      setStatus("success");
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      setStatus("success");
      (e.target as HTMLFormElement).reset();
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="contact" className="py-24 md:py-32 relative scroll-mt-28">
      {/* 120px seam gradient blending */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[120px] bg-gradient-to-b from-bg via-bg/60 to-transparent z-10" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Header */}
        <Reveal className="mb-12 text-center md:text-left max-w-2xl">
          <span className="text-ice text-sm font-bold tracking-widest uppercase">05 / Contact</span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-wide uppercase mt-4 mb-4">
            Have an idea?<br />Let&apos;s build it.
          </h2>
          <p className="text-muted text-sm md:text-base leading-relaxed">
            Whether you know exactly what you want or just have a business problem to solve, I&apos;m ready to talk.
          </p>
        </Reveal>

        {/* Three Methods in One Row (compact rounded-2xl cards) */}
        <Reveal delay={0.06} className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {contactMethods.map((method, i) => (
              <a
                key={i}
                href={method.href}
                target={method.target}
                rel={method.target ? "noopener noreferrer" : undefined}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex items-center gap-4 hover:border-steel/50 hover:bg-white/[0.06] transition-all group cursor-pointer active:scale-[0.98]"
              >
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 shrink-0 group-hover:scale-105 transition-transform">
                  {method.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-wider text-muted font-medium truncate mb-0.5">
                    {method.label}
                  </div>
                  <div className="text-sm font-semibold text-white tracking-tight truncate group-hover:text-ice transition-colors">
                    {method.value}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </Reveal>

        {/* Form in One Rounded-3xl Card with Rounded-xl Inputs */}
        <Reveal delay={0.12}>
          <SpotlightCard className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-10 relative overflow-hidden">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Honeypot field (hidden from legitimate users) */}
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                    Name
                  </label>
                  <input
                    required
                    type="text"
                    id="name"
                    name="name"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-text placeholder-muted focus:outline-none focus:border-steel focus:bg-white/[0.07] transition-colors"
                    placeholder="What should I call you?"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                    Email
                  </label>
                  <input
                    required
                    type="email"
                    id="email"
                    name="email"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-text placeholder-muted focus:outline-none focus:border-steel focus:bg-white/[0.07] transition-colors"
                    placeholder="Where can I reach you?"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="service" className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                  Service
                </label>
                <select
                  required
                  defaultValue=""
                  id="service"
                  name="service"
                  className="w-full rounded-xl border border-white/10 bg-[#0d0f14] px-4 py-3 text-sm text-text focus:outline-none focus:border-steel transition-colors appearance-none cursor-pointer"
                >
                  <option value="" disabled className="bg-[#0d0f14]">What do you need?</option>
                  <option value="AI Automation" className="bg-[#0d0f14]">AI Automation</option>
                  <option value="AI Calling Agents" className="bg-[#0d0f14]">AI Calling Agents</option>
                  <option value="Website Development" className="bg-[#0d0f14]">Website Development</option>
                  <option value="Not sure yet" className="bg-[#0d0f14]">Not sure yet</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                  Message
                </label>
                <textarea
                  required
                  id="message"
                  name="message"
                  rows={4}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-text placeholder-muted focus:outline-none focus:border-steel focus:bg-white/[0.07] transition-colors resize-none"
                  placeholder="What's eating your time, or what do you wanna build?"
                />
              </div>

              {/* Status alerts */}
              {status === "error" && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-white/[0.03] border border-red-500/30 text-xs">
                  <div className="flex items-center gap-2 text-red-200">
                    <AlertCircle size={16} className="shrink-0 text-red-400" />
                    <span>Couldn&apos;t send your message. Please message directly on WhatsApp.</span>
                  </div>
                  <a
                    href={siteData.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-full bg-ice text-bg font-semibold uppercase tracking-wider text-[11px] hover:bg-ice-hover transition-colors shrink-0 inline-flex items-center gap-1.5 active:scale-[0.98]"
                  >
                    <WhatsAppIcon />
                    <span>WhatsApp</span>
                  </a>
                </div>
              )}

              {status === "success" && (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-white/[0.03] border border-emerald-500/30 text-emerald-300 text-xs">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Message sent successfully! I&apos;ll be in touch within 24 hours.</span>
                </div>
              )}

              {/* Submit CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <MagneticButton
                  as="button"
                  type="submit"
                  disabled={status === "loading" || status === "success"}
                  className="w-full sm:w-auto bg-ice text-bg px-8 py-3.5 rounded-full font-semibold uppercase tracking-wider text-xs hover:bg-ice-hover transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group shadow-[0_0_20px_rgba(220,230,242,0.18)] cursor-pointer active:scale-[0.98]"
                >
                  {status === "loading" ? <Loader2 className="animate-spin" size={16} /> : "Send Message"}
                  {status === "idle" && <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />}
                </MagneticButton>

                {/* Social links */}
                <div className="flex items-center gap-3">
                  <a
                    href={siteData.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="p-2.5 rounded-full bg-white/5 border border-white/10 text-muted hover:text-ice hover:border-steel transition-colors active:scale-[0.98]"
                  >
                    <LinkedinIcon size={18} />
                  </a>
                  <a
                    href={siteData.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub"
                    className="p-2.5 rounded-full bg-white/5 border border-white/10 text-muted hover:text-ice hover:border-steel transition-colors active:scale-[0.98]"
                  >
                    <GithubIcon size={18} />
                  </a>
                </div>
              </div>

              {/* Location & Response Time Footnote */}
              <div className="pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs text-muted/70">
                <div className="flex items-center gap-1.5">
                  <MapPin size={13} />
                  <span>Based in Pakistan (PKT, UTC+5)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={13} />
                  <span>Replies within 24 hours • Worldwide clients</span>
                </div>
              </div>
            </form>
          </SpotlightCard>
        </Reveal>
      </div>
    </section>
  );
}

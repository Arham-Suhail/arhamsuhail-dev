"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { siteData } from "../../data/site";
import { ArrowRight, MessageSquare, Mail, Calendar, MapPin, Clock, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "../ui/Icons";

import { buildWhatsAppLink } from "../../lib/whatsapp";
import { track } from "@vercel/analytics";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.152.564 4.246 1.637 6.095l-1.583 5.776 5.922-1.554A11.94 11.94 0 0 0 12.031 24c6.645 0 12.031-5.384 12.031-12.03S18.676 0 12.031 0zm5.836 17.15c-.247.697-1.42 1.353-1.956 1.41-.537.057-1.25.132-3.876-.95-3.176-1.31-5.234-4.558-5.394-4.77-.16-.213-1.285-1.713-1.285-3.267 0-1.553.815-2.316 1.106-2.616.29-.3.626-.374.834-.374.208 0 .416.002.6.01.183.007.426-.073.666.505.25.603.86 2.096.938 2.253.08.156.133.342.026.554-.106.213-.16.347-.32.535-.16.187-.336.41-.482.553-.16.156-.328.328-.145.644.183.315.815 1.348 1.752 2.183 1.213 1.082 2.222 1.417 2.534 1.564.312.146.495.127.682-.085.187-.212.802-.937 1.018-1.26.216-.323.432-.268.724-.158.29.11 1.836.866 2.15 1.022.312.156.52.234.595.364.076.13.076.757-.17 1.454z"/>
    </svg>
  );
}

export default function Contact() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleWhatsAppClick = () => {
    track("WhatsApp Click", { source: "Contact Section" });
    window.open(buildWhatsAppLink("Hi Arham, I'd like to get in touch about a project."), "_blank", "noopener,noreferrer");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    
    const formData = new FormData(e.currentTarget);
    
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
    <section id="contact" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-8"
          >
            <div>
              <span className="text-ice text-sm font-bold tracking-widest uppercase">05 / Contact</span>
              <h2 className="font-display text-4xl md:text-5xl lg:text-7xl tracking-wide uppercase mt-4 mb-6 leading-[0.9]">
                Have an idea?<br/>Let&apos;s build it.
              </h2>
              <p className="text-muted text-lg max-w-md leading-relaxed">
                Whether you know exactly what you want or just have a business problem to solve, I&apos;m ready to talk.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleWhatsAppClick}
                className="w-full flex items-center justify-center gap-2 bg-ice text-bg py-4 px-6 rounded-xl font-semibold uppercase tracking-wider text-sm hover:bg-ice-hover transition-colors"
              >
                <WhatsAppIcon />
                <span>Chat on WhatsApp</span>
              </button>
              
              <a href={siteData.whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-border hover:border-steel transition-colors group">
                <div className="bg-steel/10 p-3 rounded-lg text-steel group-hover:scale-110 transition-transform"><MessageSquare size={20} /></div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted font-semibold mb-1">WhatsApp (Preferred in PK)</div>
                  <div className="font-semibold">{siteData.whatsappNumber}</div>
                </div>
              </a>
              
              <a href={`mailto:${siteData.email}`} className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-border hover:border-steel transition-colors group">
                <div className="bg-steel/10 p-3 rounded-lg text-steel group-hover:scale-110 transition-transform"><Mail size={20} /></div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted font-semibold mb-1">Email (International)</div>
                  <div className="font-semibold">{siteData.email}</div>
                </div>
              </a>

              <a href={siteData.calendlyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-border hover:border-steel transition-colors group">
                <div className="bg-steel/10 p-3 rounded-lg text-steel group-hover:scale-110 transition-transform"><Calendar size={20} /></div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted font-semibold mb-1">Book a Discovery Call</div>
                  <div className="font-semibold">Schedule via Calendly</div>
                </div>
              </a>
            </div>

            <div className="pt-6 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted mb-2">
                <MapPin size={16} /> Based in Pakistan (PKT, UTC+5)
              </div>
              <div className="flex items-center gap-2 text-sm text-muted">
                <Clock size={16} /> I reply within 24 hours. Working with clients in Pakistan and worldwide.
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <a href={siteData.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-ice transition-colors"><LinkedinIcon size={24} /></a>
              <a href={siteData.github} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-ice transition-colors"><GithubIcon size={24} /></a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-[24px] p-8 md:p-10 space-y-6 hover:border-steel transition-colors">
              
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" />

              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold uppercase tracking-wider text-muted mb-2">Name</label>
                  <input required type="text" id="name" name="name" className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-text placeholder-muted focus:outline-none focus:border-steel transition-colors" placeholder="What should I call you?" />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold uppercase tracking-wider text-muted mb-2">Email</label>
                  <input required type="email" id="email" name="email" className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-text placeholder-muted focus:outline-none focus:border-steel transition-colors" placeholder="Where can I reach you?" />
                </div>

                <div>
                  <label htmlFor="service" className="block text-sm font-semibold uppercase tracking-wider text-muted mb-2">Service</label>
                  <select required defaultValue="" id="service" name="service" className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:border-steel transition-colors appearance-none">
                    <option value="" disabled>What do you need?</option>
                    <option value="AI Automation">AI Automation</option>
                    <option value="AI Calling Agents">AI Calling Agents</option>
                    <option value="Website Development">Website Development</option>
                    <option value="Not sure yet">Not sure yet</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold uppercase tracking-wider text-muted mb-2">Message</label>
                  <textarea required id="message" name="message" rows={4} className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-text placeholder-muted focus:outline-none focus:border-steel transition-colors resize-none" placeholder="What's eating your time, or what do you wanna build?"></textarea>
                </div>
              </div>

              {status === "error" && (
                <div className="flex flex-col gap-3 p-4 bg-surface-2 border border-border rounded-xl">
                  <div className="flex items-center gap-2 text-text text-sm">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>Couldn&apos;t send your message. Please chat with me on WhatsApp instead.</span>
                  </div>
                  <a
                    href={siteData.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-ice text-bg py-2.5 px-4 rounded-lg font-semibold uppercase tracking-wider text-xs hover:bg-ice-hover transition-colors"
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                    <span>Chat on WhatsApp</span>
                  </a>
                </div>
              )}

              {status === "success" && (
                <div className="flex items-center gap-2 text-text text-sm">
                  <CheckCircle2 size={16} /> Message sent successfully! I&apos;ll be in touch soon.
                </div>
              )}

              <button 
                type="submit" 
                disabled={status === "loading" || status === "success"}
                className="w-full bg-ice text-bg px-8 py-4 rounded-xl font-semibold uppercase tracking-wider hover:bg-ice-hover transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {status === "loading" ? <Loader2 className="animate-spin" size={20} /> : "Send Message"}
                {status === "idle" && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>
          </motion.div>
        </div>

      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { siteData } from "../../data/site";
import { ArrowUp, Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "./Icons";

export default function Footer() {
  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-surface border-t border-border mt-24 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
          <div>
            <Link href="/" className="font-display text-3xl tracking-wider text-ice mb-2 block">
              ArhamSuhail<span className="text-steel">.</span>
            </Link>
            <p className="text-muted text-sm tracking-widest uppercase">
              AI Automation • AI Calling Agents • Web Development
            </p>
          </div>
          
          <div className="flex gap-4">
            <a href={`mailto:${siteData.email}`} className="p-3 bg-surface-2 rounded-full text-muted hover:text-ice transition-colors hover:border-steel border border-transparent" aria-label="Email">
              <Mail size={20} />
            </a>
            <a href={siteData.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 bg-surface-2 rounded-full text-muted hover:text-ice transition-colors hover:border-steel border border-transparent" aria-label="LinkedIn">
              <LinkedinIcon size={20} />
            </a>
            <a href={siteData.github} target="_blank" rel="noopener noreferrer" className="p-3 bg-surface-2 rounded-full text-muted hover:text-ice transition-colors hover:border-steel border border-transparent" aria-label="GitHub">
              <GithubIcon size={20} />
            </a>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-border/50 text-sm text-muted">
          <p suppressHydrationWarning>© {new Date().getFullYear()} {siteData.name}. All rights reserved.</p>
          <div className="flex items-center gap-8">
            <Link href="/privacy" className="hover:text-text transition-colors">
              Privacy Policy
            </Link>
            <button onClick={scrollToTop} className="flex items-center gap-2 hover:text-text transition-colors uppercase tracking-widest text-xs font-semibold">
              Back to top <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

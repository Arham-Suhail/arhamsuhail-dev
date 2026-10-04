"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "./Logo";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { siteData } from "../../data/site";

const links = [
  { name: "About", href: "#about" },
  { name: "Services", href: "#services" },
  { name: "Work", href: "#work" },
  { name: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  const bookCallUrl = siteData.calendlyUrl || siteData.whatsappLink;

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 bg-bg/85 backdrop-blur-md border-b border-border py-4 ${
        isScrolled ? "xl:bg-bg/80 xl:backdrop-blur-md xl:border-border/50 xl:py-4" : "xl:bg-transparent xl:backdrop-blur-none xl:border-transparent xl:py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Logo />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className="text-sm uppercase tracking-widest text-muted hover:text-text transition-colors relative group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-steel transition-all group-hover:w-full" />
            </a>
          ))}
          <a
            href={bookCallUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-ice text-bg px-6 py-2.5 rounded-full text-sm font-semibold uppercase tracking-wider hover:bg-ice-hover transition-colors"
          >
            Book a Call
          </a>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-text p-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-surface border-b border-border shadow-xl md:hidden"
          >
            <div className="flex flex-col px-6 py-6 gap-6">
              {links.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="text-lg uppercase tracking-widest text-text"
                >
                  {link.name}
                </a>
              ))}
              <a
                href={bookCallUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-ice text-bg px-6 py-3 rounded-full text-center font-semibold uppercase tracking-wider w-full mt-2 hover:bg-ice-hover transition-colors"
              >
                Book a Call
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

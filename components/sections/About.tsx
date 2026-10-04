"use client";

import { motion } from "framer-motion";
import { Target, Bot, Zap } from "lucide-react";

const cards = [
  { 
    icon: <Target className="text-ice" size={28} />, 
    title: "Problem first, tools second",
    desc: "I figure out what's actually slowing you down before touching any tool."
  },
  { 
    icon: <Bot className="text-ice" size={28} />, 
    title: "AI only where it pays off",
    desc: "If a simple script does the job, that's what you get."
  },
  { 
    icon: <Zap className="text-ice" size={28} />, 
    title: "Clean, fast, built to last",
    desc: "Sites and automations that stay quick and don't break next month."
  }
];

export default function About() {
  return (
    <section id="about" className="py-16 md:py-20 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mb-12"
          >
            <span className="text-steel text-sm font-bold tracking-widest uppercase block">01 / About</span>
            <h2 className="font-display text-4xl md:text-5xl text-ice uppercase tracking-wide mt-4">
              I&apos;m Arham. I build AI that does the boring work.
            </h2>
            <p className="text-lg text-muted max-w-[70ch] leading-relaxed mt-5">
              Automations, calling agents and websites for businesses that want more done with less effort. I start with the problem, not the tech.
            </p>
          </motion.div>

          <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {cards.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-[20px] bg-surface border border-border flex flex-col items-start gap-3 hover:border-steel transition-colors group h-full"
                >
                  {card.icon}
                  <span className="text-base font-medium text-text">{card.title}</span>
                  <span className="text-sm text-muted line-clamp-2">{card.desc}</span>
                </motion.div>
              ))}
            </div>
            <p className="text-sm text-muted mt-6">
              Based in Pakistan, working worldwide.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { testimonials } from "../../data/testimonials";

export default function Testimonials() {
  if (testimonials.length === 0) return null;

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <span className="text-ice text-sm font-bold tracking-widest uppercase">Testimonials</span>
          <h2 className="font-display text-4xl md:text-5xl tracking-wide uppercase mt-4">
            What Clients Say.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.1 }}
              className="bg-surface border border-border rounded-2xl p-8 relative hover:border-steel transition-colors group"
            >
              <Quote className="text-steel/20 absolute top-6 right-6 group-hover:text-steel/40 transition-colors" size={48} />
              <p className="text-muted leading-relaxed mb-6 relative z-10 italic">
                &quot;{t.quote}&quot;
              </p>
              <div className="relative z-10">
                <p className="font-semibold text-text">{t.name}</p>
                <p className="text-sm text-muted">{t.title}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

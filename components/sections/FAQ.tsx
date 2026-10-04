"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

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
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 relative bg-surface-2/30">
      <div className="max-w-4xl mx-auto px-6">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <span className="text-ice text-sm font-bold tracking-widest uppercase">04 / FAQ</span>
          <h2 className="font-display text-4xl md:text-5xl tracking-wide uppercase mt-4">
            Common Questions.
          </h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="border border-border bg-surface rounded-2xl overflow-hidden transition-colors hover:border-steel"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="font-semibold text-lg pr-8">{faq.q}</span>
                <span className="text-steel shrink-0">
                  {openIndex === i ? <Minus size={20} /> : <Plus size={20} />}
                </span>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="p-6 pt-0 text-muted leading-relaxed border-t border-border/50 mt-2">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

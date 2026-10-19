"use client";

import React from "react";
import { motion, useMotionTemplate, useMotionValue, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface SpotlightCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  spotlightBorderColor?: string;
}

export function SpotlightCard({
  children,
  className,
  spotlightColor = "rgba(220, 230, 242, 0.08)",
  spotlightBorderColor = "rgba(220, 230, 242, 0.45)",
  onMouseMove,
  ...props
}: SpotlightCardProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
    onMouseMove?.(e);
  };

  const ambientGlow = useMotionTemplate`radial-gradient(500px circle at ${mouseX}px ${mouseY}px, ${spotlightColor}, transparent 80%)`;
  const borderGlow = useMotionTemplate`radial-gradient(250px circle at ${mouseX}px ${mouseY}px, ${spotlightBorderColor}, transparent 80%)`;

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      className={cn(
        "group relative rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6 overflow-hidden transition-all duration-300",
        className
      )}
      {...props}
    >
      {/* Layer 1: Ambient surface glow */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100 z-0"
        style={{
          background: ambientGlow,
        }}
      />

      {/* Layer 2: 1px Crisp Illuminated Border */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100 z-10"
        style={{
          background: borderGlow,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: "1px",
        }}
      />

      {/* Card Content */}
      <div className="relative z-20 w-full h-full flex flex-col">
        {children}
      </div>
    </motion.div>
  );
}

export default SpotlightCard;

"use client";

import React, { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { cn } from "@/lib/utils";

export interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  as?: "button" | "a" | "div";
  href?: string;
  target?: string;
  rel?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  maxPull?: number;
  enableShimmer?: boolean;
}

export function MagneticButton({
  children,
  className,
  as = "button",
  href,
  target,
  rel,
  onClick,
  type = "button",
  disabled = false,
  maxPull = 8,
  enableShimmer = true,
}: MagneticButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness: 180, damping: 15, mass: 0.1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || window.matchMedia("(hover: none)").matches) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    const clampedX = Math.max(-maxPull, Math.min(maxPull, distanceX * 0.25));
    const clampedY = Math.max(-maxPull, Math.min(maxPull, distanceY * 0.25));

    x.set(clampedX);
    y.set(clampedY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const commonMotionProps = {
    style: {
      x: springX,
      y: springY,
    },
    className: cn(
      "relative inline-flex items-center justify-center overflow-hidden transition-colors will-change-transform",
      className
    ),
  };

  const shimmerElement = enableShimmer && !disabled && (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] z-10">
      <motion.div
        className="absolute -inset-full w-[200%] h-[200%] -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: "-100%" }}
        animate={{ x: ["-100%", "200%"] }}
        transition={{
          repeat: Infinity,
          repeatDelay: 3.5,
          duration: 1.4,
          ease: "easeInOut",
        }}
      />
    </div>
  );

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="inline-block w-full sm:w-auto"
    >
      {as === "a" ? (
        <motion.a
          href={href}
          target={target}
          rel={rel}
          onClick={onClick}
          {...commonMotionProps}
        >
          {shimmerElement}
          <span className="relative z-20 flex items-center justify-center gap-2 w-full">
            {children}
          </span>
        </motion.a>
      ) : as === "button" ? (
        <motion.button
          type={type}
          disabled={disabled}
          onClick={onClick}
          {...commonMotionProps}
        >
          {shimmerElement}
          <span className="relative z-20 flex items-center justify-center gap-2 w-full">
            {children}
          </span>
        </motion.button>
      ) : (
        <motion.div
          onClick={onClick}
          {...commonMotionProps}
        >
          {shimmerElement}
          <span className="relative z-20 flex items-center justify-center gap-2 w-full">
            {children}
          </span>
        </motion.div>
      )}
    </div>
  );
}

export default MagneticButton;

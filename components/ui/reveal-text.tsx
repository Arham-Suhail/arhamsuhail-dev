"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface RevealTextProps {
  text?: string;
  textColor?: string;
  overlayColor?: string;
  fontSize?: string;
  letterDelay?: number;
  overlayDelay?: number;
  overlayDuration?: number;
  springDuration?: number;
  letterImages?: string[];
  className?: string;
  isRevealed?: boolean;
}

export function RevealText({
  text = "STUNNING",
  textColor = "text-white",
  overlayColor = "text-red-500",
  fontSize = "text-[250px]",
  letterDelay = 0.08,
  overlayDelay = 0.05,
  overlayDuration = 0.4,
  springDuration = 600,
  letterImages = [
    "/reveal/1.webp",
    "/reveal/2.webp",
    "/reveal/3.webp",
    "/reveal/4.webp"
  ],
  className = "",
  isRevealed = true
}: RevealTextProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showRedText, setShowRedText] = useState(false);
  
  useEffect(() => {
    if (!isRevealed) return;
    
    let timer: NodeJS.Timeout | null = null;
    const triggerSweep = () => {
      const lastLetterDelay = (text.length - 1) * letterDelay;
      const totalDelay = (lastLetterDelay * 1000) + springDuration;
      timer = setTimeout(() => {
        setShowRedText(true);
      }, totalDelay);
    };

    if (typeof document !== "undefined" && document.documentElement.getAttribute("data-hero-state") === "revealed") {
      triggerSweep();
    } else {
      window.addEventListener("intro:reveal", triggerSweep, { once: true });
    }

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("intro:reveal", triggerSweep);
    };
  }, [text.length, letterDelay, springDuration, isRevealed]);

  return (
    <div className={`flex items-center justify-center relative pointer-events-auto ${className}`}>
      <div className="flex">
        {text.split("").map((letter, index) => (
          <motion.span
            key={index}
            onMouseEnter={() => {
              if (window.matchMedia('(hover: hover)').matches) {
                setHoveredIndex(index);
              }
            }}
            onMouseLeave={() => setHoveredIndex(null)}
            className={`inline-block ${fontSize} tracking-tight cursor-pointer relative`}
          >
            {/* Base text layer */}
            <motion.span 
              className={`absolute inset-0 ${textColor}`}
              animate={{ 
                opacity: hoveredIndex === index ? 0 : 1 
              }}
              transition={{ duration: 0.1 }}
            >
              {letter}
            </motion.span>
            
            {/* Image text layer with background panning */}
            <motion.span
              className="text-transparent bg-clip-text bg-cover bg-no-repeat grayscale"
              animate={{ 
                opacity: hoveredIndex === index ? 1 : 0,
                backgroundPosition: hoveredIndex === index ? "10% center" : "0% center"
              }}
              transition={{ 
                opacity: { duration: 0.1 },
                backgroundPosition: { 
                  duration: 3,
                  ease: "easeInOut"
                }
              }}
              style={{
                backgroundImage: hoveredIndex === index ? `url('${letterImages[index % letterImages.length]}')` : undefined,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {letter}
            </motion.span>
            
            {/* Overlay text layer that sweeps across each letter */}
            {showRedText && (
              <span
                className={`absolute inset-0 ${overlayColor} pointer-events-none opacity-0`}
                style={{
                  animation: `revealTextSweep ${overlayDuration}s ease-in-out ${index * overlayDelay}s both`,
                }}
              >
                {letter}
              </span>
            )}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

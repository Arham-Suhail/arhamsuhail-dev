"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight, ExternalLink, X } from "lucide-react";
import Image from "next/image";
import { useLenis } from "lenis/react";
import { Reveal } from "@/components/ui/reveal";
import type { Project } from "@/lib/projects";
import { cn } from "@/lib/utils";

function subscribeFinePointer(callback: () => void) {
  const mql = window.matchMedia("(pointer: fine)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getFinePointerSnapshot() {
  return window.matchMedia("(pointer: fine)").matches;
}

function getFinePointerServerSnapshot() {
  return false;
}

export default function WorkClient({ projects }: { projects: Project[]; demos?: unknown[] }) {
  const [activeTab, setActiveTab] = useState("All");
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const isFinePointer = useSyncExternalStore(
    subscribeFinePointer,
    getFinePointerSnapshot,
    getFinePointerServerSnapshot
  );
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const lenis = useLenis();

  // Spring cursor preview coords
  const cursorX = useMotionValue(-1000);
  const cursorY = useMotionValue(-1000);
  const previewX = useSpring(cursorX, { damping: 25, stiffness: 220, mass: 0.6 });
  const previewY = useSpring(cursorY, { damping: 25, stiffness: 220, mass: 0.6 });

  // Stop/start Lenis without body overflow, close on Esc, focus trap/return
  useEffect(() => {
    if (selectedProject) {
      lenis?.stop();
      dialogRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setSelectedProject(null);
          triggerRef.current?.focus();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        lenis?.start();
      };
    } else {
      lenis?.start();
    }
  }, [selectedProject, lenis]);

  const closeDialog = () => {
    setSelectedProject(null);
    triggerRef.current?.focus();
  };

  const handleOpenDialog = (project: Project, e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => {
    triggerRef.current = e.currentTarget;
    setHoveredProject(null);
    setSelectedProject(project);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isFinePointer) {
      cursorX.set(e.clientX + 24);
      cursorY.set(e.clientY - 95);
    }
  };

  const categories = ["All", ...Array.from(new Set(projects.map((p) => p.category)))];

  const filteredProjects = activeTab === "All"
    ? projects
    : projects.filter((p) => p.category === activeTab);

  return (
    <section id="work" className="py-24 md:py-32 relative scroll-mt-28" onPointerMove={handlePointerMove}>
      {/* 120px seam gradient blending */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[120px] bg-gradient-to-b from-bg via-bg/60 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[120px] bg-gradient-to-t from-bg via-bg/60 to-transparent z-10" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Section Header & Filters */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <Reveal>
            <span className="text-ice text-sm font-bold tracking-widest uppercase">03 / Work</span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-wide uppercase mt-4">
              Selected Work.
            </h2>
          </Reveal>

          {/* Filters with sliding layoutId indicator */}
          <Reveal delay={0.06}>
            <div className="flex flex-wrap gap-2 p-1 rounded-full border border-white/10 bg-white/[0.02]">
              {categories.map((cat) => {
                const isActive = activeTab === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveTab(cat)}
                    className={cn(
                      "relative px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer active:scale-[0.98]",
                      isActive ? "text-bg" : "text-muted hover:text-white"
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="work-filter-indicator"
                        className="absolute inset-0 rounded-full bg-ice shadow-sm"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{cat}</span>
                  </button>
                );
              })}
            </div>
          </Reveal>
        </div>

        {/* Data-Driven List Rows with CSS-Only Sibling Dimming */}
        <div className="flex flex-col gap-3 [&:hover>*:not(:hover)]:opacity-55 [&>*]:transition-opacity [&>*]:duration-200">
          {filteredProjects.map((project, i) => {
            const formattedIndex = String(i + 1).padStart(2, "0");

            return (
              <Reveal key={project.id} delay={i * 0.06}>
                <motion.div
                  layoutId={`project-row-${project.id}`}
                  role="button"
                  tabIndex={0}
                  onClick={(e) => handleOpenDialog(project, e)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleOpenDialog(project, e);
                    }
                  }}
                  onPointerEnter={() => {
                    if (isFinePointer) setHoveredProject(project);
                  }}
                  onPointerLeave={() => {
                    if (isFinePointer) setHoveredProject(null);
                  }}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-5 flex items-center justify-between gap-4 cursor-pointer hover:border-steel/50 hover:bg-white/[0.06] transition-all group relative overflow-hidden active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ice/70"
                >
                  {/* Left: Index & Title */}
                  <div className="flex items-center gap-4 md:gap-6 min-w-0">
                    <span className="text-xs font-mono font-medium text-steel/80 shrink-0">
                      {formattedIndex}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-base md:text-lg font-semibold text-white tracking-tight group-hover:text-ice transition-colors truncate">
                        {project.title}
                      </h3>
                      <p className="text-xs text-muted block md:hidden truncate mt-0.5">
                        {project.category}
                      </p>
                    </div>
                  </div>

                  {/* Right: Category, Stack Chips, Arrow */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="hidden md:inline-block text-xs uppercase tracking-wider text-muted/80">
                      {project.category}
                    </span>

                    <div className="hidden lg:flex items-center gap-1.5">
                      {project.stack.slice(0, 3).map((item, sIndex) => (
                        <span
                          key={sIndex}
                          className="rounded-full px-2.5 py-0.5 bg-white/5 border border-white/10 text-[11px] text-muted"
                        >
                          {item}
                        </span>
                      ))}
                      {project.stack.length > 3 && (
                        <span className="rounded-full px-2 py-0.5 bg-white/5 border border-white/10 text-[10px] text-muted">
                          +{project.stack.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="p-2 rounded-full bg-white/5 group-hover:bg-ice group-hover:text-bg text-muted transition-colors">
                      <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>
                </motion.div>
              </Reveal>
            );
          })}
        </div>
      </div>

      {/* Cursor Preview (pointer: fine only, scales in/out) */}
      {isFinePointer && (
        <AnimatePresence>
          {hoveredProject && (
            <motion.div
              key={hoveredProject.id}
              style={{ x: previewX, y: previewY }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 left-0 pointer-events-none z-40 w-[300px] h-[190px] rounded-2xl overflow-hidden border border-white/20 bg-surface/90 backdrop-blur-md shadow-2xl"
            >
              <Image
                src={hoveredProject.image}
                alt={hoveredProject.imageAlt || hoveredProject.title}
                fill
                sizes="300px"
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgNjAiPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNjAiIGZpbGw9IiMxNDE2MWEiLz48L3N2Zz4="
                className="object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/95 font-medium">
                <span className="truncate pr-2">{hoveredProject.title}</span>
                <span className="text-[10px] text-ice font-mono shrink-0">{hoveredProject.year}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Shared-Element Morph Dialog */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
            {/* Backdrop: bg-black/60 + backdrop-blur-sm */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeDialog}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Dialog Container: rounded-3xl, max-w-[520px], bg-[#14161a], border-white/10 */}
            <motion.div
              layoutId={`project-row-${selectedProject.id}`}
              role="dialog"
              aria-modal="true"
              aria-labelledby="dialog-project-title"
              ref={dialogRef}
              tabIndex={-1}
              className="relative w-full max-w-[520px] max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#14161a] p-6 md:p-8 shadow-2xl z-10 flex flex-col gap-6 focus:outline-none"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={closeDialog}
                aria-label="Close project details"
                className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer border border-white/10 z-10 active:scale-[0.98]"
              >
                <X size={18} />
              </button>

              {/* Project Image */}
              <div className="aspect-[16/10] w-full rounded-2xl overflow-hidden relative border border-white/10 bg-surface-2">
                <Image
                  src={selectedProject.image}
                  alt={selectedProject.imageAlt || selectedProject.title}
                  fill
                  sizes="(min-width: 768px) 520px, 100vw"
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgNjAiPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNjAiIGZpbGw9IiMxNDE2MWEiLz48L3N2Zz4="
                  className="object-cover object-top"
                  priority
                />
              </div>

              {/* Title, Year, Category */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono font-medium text-ice">
                    {selectedProject.year}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-muted uppercase tracking-wider">
                    {selectedProject.category}
                  </span>
                </div>
                <h3 id="dialog-project-title" className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
                  {selectedProject.title}
                </h3>
                <p className="text-sm md:text-base text-neutral-300 leading-relaxed mt-2">
                  {selectedProject.blurb}
                </p>
              </div>

              {/* Stack Chips */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-steel block mb-2">
                  Technologies & Stack
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.stack.map((item, idx) => (
                    <span
                      key={idx}
                      className="rounded-full px-3 py-1 bg-white/5 border border-white/10 text-xs text-text/80 font-medium"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Links */}
              {selectedProject.links && selectedProject.links.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {selectedProject.links.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-full bg-ice text-bg text-xs font-semibold uppercase tracking-wider hover:bg-ice-hover transition-colors inline-flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
                    >
                      <span>{link.label}</span>
                      <ExternalLink size={13} />
                    </a>
                  ))}
                </div>
              )}

              {/* Problem / Built / Result (only rendered if provided) */}
              {(selectedProject.problem || selectedProject.built || selectedProject.result) && (
                <div className="space-y-4 pt-4 border-t border-white/10">
                  {selectedProject.problem && (
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-steel block mb-1">
                        Problem
                      </span>
                      <p className="text-xs md:text-sm text-text/80 leading-relaxed">
                        {selectedProject.problem}
                      </p>
                    </div>
                  )}

                  {selectedProject.built && (
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-steel block mb-1">
                        Architecture & Built
                      </span>
                      <p className="text-xs md:text-sm text-text/80 leading-relaxed">
                        {selectedProject.built}
                      </p>
                    </div>
                  )}

                  {selectedProject.result && (
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-steel block mb-1">
                        Result & Impact
                      </span>
                      <p className="text-xs md:text-sm text-text/80 leading-relaxed">
                        {selectedProject.result}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

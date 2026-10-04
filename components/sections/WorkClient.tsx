"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ExternalLink, Play, Pause, Volume2 } from "lucide-react";
import Image from "next/image";
import type { Project, AudioDemo } from "../../data/projects";

function AudioDemoCard({ demo }: { demo: AudioDemo }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      setProgress((current / duration) * 100);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  return (
    <div className="bg-surface border border-border rounded-[20px] p-6 hover:border-steel transition-colors relative group overflow-hidden">
      <div className="absolute inset-0 bg-steel/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <audio
        ref={audioRef}
        src={demo.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        className="hidden"
      />
      <div className="relative z-10 flex items-start gap-4">
        <button
          onClick={togglePlay}
          className="w-12 h-12 shrink-0 rounded-full bg-ice text-bg flex items-center justify-center hover:bg-ice-hover transition-colors"
        >
          {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
        </button>
        <div className="flex-grow">
          <h4 className="text-lg font-semibold mb-1">{demo.title}</h4>
          <p className="text-sm text-muted mb-4">{demo.description}</p>
          
          <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
            <div 
              className="h-full bg-ice transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const prefersReducedMotion = useReducedMotion();
  const initials = project.title
    .split(" ")
    .map(w => w[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const isMake = project.title.toLowerCase().includes("make.com") || project.tags.includes("Make.com");
  const objectPosition = isMake ? "object-center" : "object-top";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
      className="group flex flex-col bg-surface border border-border rounded-[20px] overflow-hidden hover:border-steel transition-colors"
    >
      <div className="aspect-[16/10] w-full relative overflow-hidden bg-surface-2 flex items-center justify-center rounded-t-[20px] border-b border-border">
        {project.image ? (
          <>
            <Image
              src={project.image}
              alt={project.imageAlt || project.title}
              fill
              sizes="(min-width: 1024px) 33vw, 100vw"
              quality={80}
              loading="lazy"
              className={`object-cover ${objectPosition} transition-transform duration-300 ${!prefersReducedMotion ? 'group-hover:scale-[1.03]' : ''}`}
            />
            {/* 10% overlay fading out on hover */}
            <div className="absolute inset-0 bg-bg/10 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none" />
          </>
        ) : (
          <span className="font-display text-7xl text-white/10 select-none transition-transform duration-300 group-hover:scale-110">
            {initials}
          </span>
        )}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-bg/70 backdrop-blur-sm border border-border text-xs uppercase tracking-widest rounded-full text-text">
            {project.category}
          </span>
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
        <p className="text-muted text-sm leading-relaxed mb-6 flex-grow">{project.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {project.tags.map((tag, i) => (
            <span key={i} className="text-xs text-muted/80 bg-surface-2 px-2 py-1 rounded">
              {tag}
            </span>
          ))}
        </div>

        {project.links && project.links.length > 0 && (
          <div className="flex flex-wrap gap-4 mt-auto pt-4 border-t border-border/50">
            {project.links.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-semibold hover:text-ice transition-colors"
              >
                {link.label}
                <ExternalLink size={14} />
              </a>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function WorkClient({ projects, demos }: { projects: Project[], demos: AudioDemo[] }) {
  const [activeTab, setActiveTab] = useState("All");

  const projectCategories = Array.from(new Set(projects.map(p => p.category)));
  const hasDemos = demos.length > 0;
  
  const allCategories = ["All"];
  if (projectCategories.includes("AI Automation")) allCategories.push("AI Automation");
  if (projectCategories.includes("Websites")) allCategories.push("Websites");
  if (projectCategories.includes("AI Calling Agents") || hasDemos) allCategories.push("AI Calling Agents");

  const filteredProjects = activeTab === "All" 
    ? projects 
    : projects.filter(p => p.category === activeTab);

  return (
    <section id="work" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <span className="text-ice text-sm font-bold tracking-widest uppercase">03 / Work</span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-wide uppercase mt-4">
              Selected Projects.
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-wrap gap-2"
          >
            {allCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                  activeTab === cat 
                    ? "bg-ice text-bg" 
                    : "bg-surface border border-border text-muted hover:text-text hover:border-steel"
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>
        </div>

        <AnimatePresence mode="popLayout">
          {(activeTab === "All" || activeTab === "AI Calling Agents") && hasDemos && (
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-12"
            >
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Volume2 className="text-ice" size={20} />
                Live Audio Demos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {demos.map((demo, i) => (
                  <AudioDemoCard key={i} demo={demo} />
                ))}
              </div>
            </motion.div>
          )}

          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.title} project={project} />
            ))}
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
}

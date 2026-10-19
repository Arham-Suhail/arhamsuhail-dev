export interface ProjectLink {
  label: string;
  url: string;
}

export interface Project {
  id: string;
  title: string;
  category: "AI Automation" | "Websites" | "AI Calling Agents" | string;
  year: string;
  stack: string[];
  blurb: string;
  image: string;
  imageAlt?: string;
  links?: ProjectLink[];
  problem?: string;
  built?: string;
  result?: string;
}

export interface AudioDemo {
  title: string;
  description: string;
  audioUrl: string;
}

export const projects: Project[] = [
  {
    id: "ai-lead-desk",
    title: "AI Lead Desk",
    category: "AI Automation",
    year: "2024",
    stack: ["Make.com", "Gemini AI", "Google Sheets", "Gmail"],
    blurb: "A Make.com automation that scores incoming leads with AI, logs them to Google Sheets, replies instantly and alerts me when a lead is hot.",
    image: "/images/work/lead-desk.png",
    imageAlt: "Screenshot of the Make.com scenario that captures, scores and replies to incoming leads",
    problem: "Manual lead qualification and triage creates delays in initial response times, causing high-intent prospects to drop off before direct outreach.",
    built: "Automated Make.com scenario integrating Gemini AI to evaluate incoming lead criteria, append records to Google Sheets, send personalized follow-up emails, and trigger instant priority alerts.",
    result: "Eliminated manual lead sorting with sub-minute automated response and immediate notifications for hot opportunities."
  },
  {
    id: "personal-portfolio",
    title: "Personal Portfolio",
    category: "Websites",
    year: "2024",
    stack: ["Next.js", "React", "Tailwind CSS", "Framer Motion"],
    blurb: "My personal developer portfolio, built and deployed on Vercel.",
    image: "/images/work/portfolio.png",
    imageAlt: "Screenshot of the personal portfolio homepage",
    links: [{ label: "View Site", url: "https://arrham.vercel.app" }],
    problem: "Needed a modern, high-performance web presence to showcase AI automations, calling agent demos, and web development case studies with fluid animations.",
    built: "Custom Next.js application with Tailwind CSS, custom WebGL smoke shaders, Lenis smooth scrolling, and dynamic micro-interactions.",
    result: "Fast, responsive showcase deployed to Vercel with high performance scores and fluid user experience across desktop and mobile."
  },
  {
    id: "quantum-chat",
    title: "QuantumChat",
    category: "Websites",
    year: "2024",
    stack: ["React", "Node.js", "Socket.IO", "MongoDB"],
    blurb: "Open-source full-stack real-time chat project.",
    image: "/images/work/quantumchat.png",
    imageAlt: "Screenshot of the QuantumChat chat interface",
    links: [
      { label: "Frontend", url: "https://github.com/Arham-Suhail/QuantumChat-Frontend" },
      { label: "Backend", url: "https://github.com/Arham-Suhail/QuantumChat-Backend" },
    ],
    problem: "Standard HTTP polling creates latency and excessive server overhead for collaborative messaging platforms.",
    built: "Full-stack real-time communication platform utilizing WebSockets via Socket.IO, Express/Node.js backend, and a reactive React frontend with persistent MongoDB storage.",
    result: "Instant bi-directional messaging with real-time presence detection and room-based channels."
  }
];

export const demos: AudioDemo[] = [];

export default projects;

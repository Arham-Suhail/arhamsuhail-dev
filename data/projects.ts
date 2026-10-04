export type Project = {
  title: string;
  category: "AI Automation" | "AI Calling Agents" | "Websites";
  description: string;
  tags: string[];
  image?: string;
  imageAlt?: string;
  links?: { label: string; url: string }[];
};

export type AudioDemo = {
  title: string;
  description: string;
  audioUrl: string;
};

export const projects: Project[] = [
  {
    title: "AI Lead Desk",
    category: "AI Automation",
    description: "A Make.com automation that scores incoming leads with AI, logs them to Google Sheets, replies instantly and alerts me when a lead is hot.",
    tags: ["Make.com", "Gemini AI", "Google Sheets", "Gmail"],
    image: "/images/work/lead-desk.png",
    imageAlt: "Screenshot of the Make.com scenario that captures, scores and replies to incoming leads",
  },
  {
    title: "Personal Portfolio",
    category: "Websites",
    description: "My personal developer portfolio, built and deployed on Vercel.",
    tags: ["Next.js", "React", "Tailwind"],
    image: "/images/work/portfolio.png",
    imageAlt: "Screenshot of the personal portfolio homepage",
    links: [{ label: "View Site", url: "https://arrham.vercel.app" }],
  },
  {
    title: "QuantumChat",
    category: "Websites",
    description: "Open-source full-stack real-time chat project.",
    tags: ["React", "Node.js", "Socket.IO", "MongoDB"],
    image: "/images/work/quantumchat.png",
    imageAlt: "Screenshot of the QuantumChat chat interface",
    links: [
      { label: "Frontend", url: "https://github.com/Arham-Suhail/QuantumChat-Frontend" },
      { label: "Backend", url: "https://github.com/Arham-Suhail/QuantumChat-Backend" },
    ],
  }
];

export const demos: AudioDemo[] = [];

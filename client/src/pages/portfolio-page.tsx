import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { E2kLogo } from "@/components/e2k-logo";

const PROJECTS = [
  {
    title: "NationStream",
    tag: "Web Platform",
    desc: "Live verified broadcast platform putting livestreams on every billboard, bus, and phone in Nigeria — GPS-verified, deepfake-proof, and ARCON/INEC compliant.",
    tech: ["React", "Node.js", "WebRTC", "GPS API"],
    image: "/portfolio-nationstream.png",
    url: "https://nationstream.live",
    live: true,
  },
  {
    title: "Bolingo Wellness",
    tag: "Web App",
    desc: "Nigeria's first tech-powered wellness gym platform — members can train physically, join virtually, and get AI-powered wellness support anytime.",
    tech: ["React", "Node.js", "AI", "Live Streaming"],
    image: "/portfolio-bolingo.png",
    url: "https://brand-color-web.replit.app",
    live: true,
  },
  {
    title: "NW Climate Summit 2026",
    tag: "Government / Web",
    desc: "Official site for the North West Climate Summit 2026 — a Presidential initiative positioning the North West as a strategic hub for climate-resilient investment.",
    tech: ["React", "Vite", "Motion", "Data Dashboard"],
    image: "/portfolio-climate.png",
    url: "https://doc-site-creator.replit.app",
    live: true,
  },
  {
    title: "UltraPalace",
    tag: "Web App",
    desc: "A premium digital platform currently in development. Built with cutting-edge web technologies for an elite user experience.",
    tech: ["React", "Node.js", "PostgreSQL"],
    image: null,
    url: null,
    live: false,
  },
];

export default function PortfolioPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            data-testid="button-back-home"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
          <div className="h-4 w-px bg-border" />
          <E2kLogo size="sm" variant="full" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 font-mono">OUR PORTFOLIO</Badge>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-4">
            Projects That <span className="text-gradient">Speak for Themselves</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Real products, real clients, real impact. Here's a look at what we've built.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {PROJECTS.map((project, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group rounded-2xl border border-border/50 bg-card overflow-hidden hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 card-glow"
              data-testid={`card-portfolio-${i}`}
            >
              <div className="relative h-56 bg-muted/30 overflow-hidden">
                {project.image ? (
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-3 opacity-40">
                        <ExternalLink className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-muted-foreground text-sm font-mono">Coming Soon</p>
                    </div>
                  </div>
                )}
                {project.live && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-background/80 backdrop-blur-sm border border-border/50 rounded-full px-3 py-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-semibold text-emerald-400">LIVE</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full font-mono">
                    {project.tag}
                  </span>
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                      data-testid={`link-portfolio-${i}`}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Visit Site
                    </a>
                  )}
                </div>
                <h2 className="text-xl font-black mb-2">{project.title}</h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">{project.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {project.tech.map((t, j) => (
                    <span key={j} className="text-[10px] font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full border border-border/40">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-20 text-center rounded-3xl border border-primary/20 bg-primary/5 p-12"
        >
          <h2 className="text-3xl font-black mb-3">Ready to Be Our Next Project?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Let's build something remarkable together. Tell us what you need and we'll make it happen.
          </p>
          <Button
            onClick={() => setLocation("/contact")}
            className="gradient-primary text-white dark:text-background font-semibold px-8 h-12"
            data-testid="button-start-project"
          >
            Start a Project
            <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
          </Button>
        </motion.div>
      </main>
    </div>
  );
}

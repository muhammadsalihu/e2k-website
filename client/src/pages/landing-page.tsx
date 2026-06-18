import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Code2, Wifi, Brain, GraduationCap, ArrowRight, ChevronDown,
  Globe, Smartphone, Shield, Cpu, BookOpen, Users, Award,
  CheckCircle, Star, Menu, X, Zap, TrendingUp, Layers, Mail,
  Phone, MapPin, ExternalLink, Play, MessageSquare, Palette, Film
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "AI", href: "#ai" },
  { label: "Training", href: "#training" },
  { label: "Projects", href: "/portfolio" },
];

const SERVICES = [
  {
    icon: Code2,
    color: "from-blue-500 to-cyan-500",
    glow: "hsl(197 100% 50% / 0.3)",
    title: "App & Web Development",
    description: "We design and build blazing-fast websites, mobile apps, and enterprise platforms tailored to your business goals — from landing pages to full-scale SaaS products.",
    features: ["Custom Web Apps", "Mobile (iOS & Android)", "E-commerce Platforms", "SaaS Products"],
  },
  {
    icon: Wifi,
    color: "from-violet-500 to-purple-600",
    glow: "hsl(265 85% 60% / 0.3)",
    title: "Network & Infrastructure",
    description: "Reliable, secure, and scalable network solutions for businesses of any size. We handle everything from setup to 24/7 monitoring and maintenance.",
    features: ["Network Design & Setup", "Cloud Infrastructure", "Cybersecurity", "24/7 Monitoring"],
  },
  {
    icon: Brain,
    color: "from-emerald-500 to-teal-500",
    glow: "hsl(158 100% 45% / 0.3)",
    title: "AI & Automation",
    description: "Harness the power of artificial intelligence to automate operations, gain insights, and stay ahead of the competition with cutting-edge AI integrations.",
    features: ["AI Chatbots & Agents", "Data Analytics", "Process Automation", "ML Model Integration"],
  },
  {
    icon: GraduationCap,
    color: "from-orange-500 to-amber-500",
    glow: "hsl(35 100% 55% / 0.3)",
    title: "Tech Education",
    description: "From beginners to professionals — we offer hands-on training programs in coding, networking, AI, and more, empowering the next generation of tech talent.",
    features: ["Coding Bootcamps", "Graphic Design", "Video Editing", "1-on-1 Mentorship", "Online Courses"],
  },
];

const STATS = [
  { value: "150+", label: "Projects Delivered" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "50+", label: "Trainees Certified" },
  { value: "5+", label: "Years of Excellence" },
];

const AI_CAPABILITIES = [
  { icon: Cpu, title: "Intelligent Chatbots", desc: "Custom AI assistants that handle customer support, lead generation, and internal workflows 24/7." },
  { icon: TrendingUp, title: "Predictive Analytics", desc: "Turn your data into actionable insights with machine learning models built for your industry." },
  { icon: Layers, title: "AI Integration", desc: "Seamlessly integrate GPT-4, Gemini, Claude, and other leading AI models into your existing systems." },
  { icon: Shield, title: "AI Security", desc: "Protect your business with AI-powered threat detection and intelligent security automation." },
];

const TRAINING_PROGRAMS = [
  { icon: Code2, title: "Full-Stack Development", duration: "12 Weeks", level: "Beginner to Pro", color: "text-blue-400" },
  { icon: Brain, title: "AI & Machine Learning", duration: "8 Weeks", level: "Intermediate", color: "text-emerald-400" },
  { icon: Wifi, title: "Networking & Cloud", duration: "6 Weeks", level: "All Levels", color: "text-violet-400" },
  { icon: Shield, title: "Cybersecurity", duration: "8 Weeks", level: "Intermediate", color: "text-red-400" },
  { icon: Smartphone, title: "Mobile App Dev", duration: "10 Weeks", level: "Beginner to Pro", color: "text-orange-400" },
  { icon: Globe, title: "Digital Marketing & SEO", duration: "4 Weeks", level: "All Levels", color: "text-pink-400" },
  { icon: Palette, title: "Graphic Design", duration: "6 Weeks", level: "All Levels", color: "text-yellow-400" },
  { icon: Film, title: "Video Editing", duration: "4 Weeks", level: "All Levels", color: "text-cyan-400" },
];

const PROJECTS = [
  { tag: "Web App", title: "Enterprise Management Platform", desc: "Full-stack ERP system serving 500+ employees with real-time data and AI-powered analytics.", tech: ["React", "Node.js", "PostgreSQL", "AI"] },
  { tag: "Mobile App", title: "FinTech Payment Solution", desc: "Secure mobile payment platform with biometric authentication and instant transfers.", tech: ["React Native", "Node.js", "AWS", "ML"] },
  { tag: "Network", title: "Corporate Network Infrastructure", desc: "End-to-end network setup for a 200-person office with zero-trust security framework.", tech: ["Cisco", "Azure", "VPN", "Firewall"] },
  { tag: "AI", title: "Customer Service AI Bot", desc: "Intelligent chatbot handling 10,000+ queries/month with 94% resolution rate.", tech: ["GPT-4", "Python", "FastAPI", "Redis"] },
  { tag: "Education", title: "E-Learning Platform", desc: "Custom LMS serving 300+ students with live sessions, quizzes, and progress tracking.", tech: ["React", "Node.js", "Video API", "WebRTC"] },
  { tag: "Web App", title: "Real Estate Marketplace", desc: "Property listing platform with AI-powered recommendations and virtual tours.", tech: ["Next.js", "Django", "ML", "Maps API"] },
];

const TESTIMONIALS = [
  { name: "Kadiri Adaba", role: "CEO, Kadaba Enterprise", text: "E2k Tech Ventures transformed our idea into a world-class product. Their team is exceptional, and the results speak for themselves.", rating: 5, photo: "/kadiri-adaba.png" },
  { name: "Chioma Iyida", role: "CEO, Gema Gusto", text: "E2k Tech Ventures completely elevated our brand. Their work on our branding and social media presence brought us so much more visibility and engagement.", rating: 5, photo: "/testimonial-2.jpg" },
  { name: "James Miller", role: "Director, TechSchool Africa", text: "Their training program produced 40 certified developers for us. The quality of instruction is unmatched in the industry.", rating: 5, photo: "/testimonial-3.png" },
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-background/90 dark:bg-[hsl(218,40%,4%)]/90 glass-effect border-b border-border/50 shadow-sm" : ""
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 shrink-0" data-testid="link-logo">
          <img src="/e2k-logo.png" alt="E2k Tech Ventures" className="h-10 w-auto object-contain" />
        </a>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.href}
              onClick={() => item.href.startsWith("/") ? setLocation(item.href) : scrollTo(item.href)}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setLocation("/contact")}
            className="hidden md:flex gradient-primary text-white dark:text-background font-semibold h-9 px-5 neon-glow-blue"
            data-testid="button-contact-nav"
          >
            Get Started
          </Button>
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setMenuOpen(!menuOpen)}
            data-testid="button-mobile-menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-background/95 dark:bg-[hsl(218,40%,4%)]/95 glass-effect border-b border-border/50 px-4 pb-4">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.href}
              onClick={() => { setMenuOpen(false); item.href.startsWith("/") ? setLocation(item.href) : scrollTo(item.href); }}
              className="w-full text-left px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border-b border-border/30"
            >
              {item.label}
            </button>
          ))}
          <Button
            onClick={() => { setMenuOpen(false); setLocation("/contact"); }}
            className="w-full mt-3 gradient-primary text-white dark:text-background font-semibold"
          >
            Get Started
          </Button>
        </div>
      )}
    </header>
  );
}

function HeroSection() {
  const [, setLocation] = useLocation();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 dark:block hidden">
        <div className="absolute inset-0 grid-bg opacity-100" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent/8 blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-primary/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-primary/3" />
      </div>
      <div className="absolute inset-0 dark:hidden block bg-gradient-to-b from-sky-50/80 to-background" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 dark:bg-primary/10 mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-semibold text-primary tracking-widest uppercase font-mono">Empowering Businesses · Educating Minds</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] mb-6"
          data-testid="text-hero-headline"
        >
          Building Tomorrow's
          <br />
          <span className="text-gradient-hero">Digital World</span>
          <br />
          <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black">Today.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground mb-10 leading-relaxed"
        >
          E2k Tech Ventures delivers world-class apps, websites, AI solutions, and network infrastructure —
          while educating the next wave of tech innovators.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button
            size="lg"
            onClick={() => setLocation("/contact")}
            className="gradient-primary text-white dark:text-background font-bold h-13 px-8 text-base neon-glow-blue hover:scale-105 transition-transform"
            data-testid="button-hero-cta"
          >
            Start Your Project
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => document.querySelector("#services")?.scrollIntoView({ behavior: "smooth" })}
            className="h-13 px-8 text-base border-border/60 hover:border-primary/50 transition-all"
            data-testid="button-hero-learn"
          >
            <Play className="w-4 h-4 mr-2" />
            Explore Services
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto"
        >
          {STATS.map((s, i) => (
            <div key={i} className="text-center" data-testid={`stat-${i}`}>
              <div className="text-3xl sm:text-4xl font-black text-gradient-hero mb-1">{s.value}</div>
              <div className="text-xs text-muted-foreground font-medium">{s.label}</div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="flex justify-center mt-14"
        >
          <button
            onClick={() => document.querySelector("#services")?.scrollIntoView({ behavior: "smooth" })}
            className="text-muted-foreground hover:text-primary transition-colors animate-bounce"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}

function ServicesSection() {
  return (
    <section id="services" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 font-mono">WHAT WE DO</Badge>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
            Full-Spectrum <span className="text-gradient">Tech Solutions</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From concept to deployment — we're your end-to-end technology partner, covering every layer of modern business tech.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SERVICES.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative rounded-2xl border border-border/50 bg-card p-6 sm:p-8 hover:border-primary/30 transition-all duration-300 card-glow cursor-default"
                data-testid={`card-service-${i}`}
              >
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 dark:bg-primary/3" />
                <div className={`inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br ${service.color} items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                  style={{ boxShadow: `0 8px 32px ${service.glow}` }}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                <p className="text-muted-foreground leading-relaxed mb-5 text-sm">{service.description}</p>
                <ul className="grid grid-cols-2 gap-2">
                  {service.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section id="about" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 dark:block hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-accent/6 rounded-full blur-3xl" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/20 font-mono">ABOUT US</Badge>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-6">
              Technology That <span className="text-gradient">Moves You Forward</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6 text-base">
              E2k Tech Ventures was founded on a simple belief: technology should empower every business and every person, 
              regardless of size or background. We combine deep technical expertise with a genuine passion for education 
              to deliver solutions that truly make a difference.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8 text-base">
              From building enterprise-grade applications to teaching a student their first line of code — 
              every project and every lesson carries the same E2k commitment: excellence, innovation, and impact.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Award, text: "Award-winning solutions" },
                { icon: Users, text: "50+ trained professionals" },
                { icon: Globe, text: "Clients across Africa & beyond" },
                { icon: Zap, text: "Fast delivery, zero compromise" },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/40">
                  <Icon className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm font-medium">{text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 blur-2xl scale-110" />
              <div className="relative rounded-3xl border border-border/50 bg-card p-8 max-w-sm">
                <div className="flex justify-center mb-6 animate-float-slow">
                  <img src="/e2k-logo.png" alt="E2k Tech Ventures" className="h-24 w-auto object-contain" />
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-black mb-1 text-gradient-hero">E2k Tech Ventures</h3>
                  <p className="text-muted-foreground text-sm font-mono tracking-widest uppercase">Excellence · Innovation · Knowledge</p>
                </div>
                <div className="mt-6 flex gap-3">
                  <div className="flex-1 text-center p-3 rounded-xl bg-primary/8 dark:bg-primary/12 border border-primary/20">
                    <div className="text-xl font-black text-gradient-hero">E2k</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">Brand</div>
                  </div>
                  <div className="flex-1 text-center p-3 rounded-xl bg-accent/8 dark:bg-accent/12 border border-accent/20">
                    <div className="text-xl font-black text-emerald-500">Tech</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">Focus</div>
                  </div>
                  <div className="flex-1 text-center p-3 rounded-xl bg-violet-500/8 dark:bg-violet-500/12 border border-violet-500/20">
                    <div className="text-xl font-black text-violet-500">∞</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">Growth</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function AISection() {
  return (
    <section id="ai" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 dark:block hidden">
        <div className="absolute inset-0 dot-bg opacity-60" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/6 blur-3xl" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 font-mono">AI & AUTOMATION</Badge>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
            The Power of <span className="text-gradient">Artificial Intelligence</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Stay ahead in the AI revolution. We build intelligent systems that learn, adapt, and deliver results around the clock.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {AI_CAPABILITIES.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group p-6 rounded-2xl border border-border/50 bg-card hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 card-glow"
                data-testid={`card-ai-${i}`}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/15 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold mb-2 text-sm">{cap.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{cap.desc}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 dark:from-primary/8 dark:to-accent/8 p-8 sm:p-12 text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center neon-glow-blue">
              <Brain className="w-10 h-10 text-white" />
            </div>
          </div>
          <h3 className="text-3xl font-black mb-4">Ready to go AI-first?</h3>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Let us audit your business and identify the best AI opportunities to cut costs, boost efficiency, and future-proof your operations.
          </p>
          <a href="/contact">
            <Button size="lg" className="gradient-primary text-white dark:text-background font-bold neon-glow-blue">
              Book a Free AI Consultation
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

function TrainingSection() {
  const [, setLocation] = useLocation();
  return (
    <section id="training" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-accent/10 text-accent border-accent/20 font-mono">TECH EDUCATION</Badge>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
            Learn. Build. <span className="text-gradient">Lead.</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Our hands-on training programs are designed to fast-track your tech career or upskill your entire team.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {TRAINING_PROGRAMS.map((prog, i) => {
            const Icon = prog.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className="group flex gap-4 p-5 rounded-2xl border border-border/50 bg-card hover:border-primary/30 transition-all duration-300 card-glow cursor-default"
                data-testid={`card-training-${i}`}
              >
                <div className={`w-12 h-12 rounded-xl bg-card border border-border/50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${prog.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm mb-1">{prog.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">{prog.duration}</span>
                    <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">{prog.level}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="grid sm:grid-cols-3 gap-4 rounded-2xl border border-accent/20 bg-accent/5 dark:bg-accent/8 p-6 sm:p-8">
          {[
            { icon: BookOpen, title: "Hands-on Learning", desc: "Real projects, real tools, real experience from day one." },
            { icon: Users, title: "Expert Instructors", desc: "Learn from industry practitioners with years of real-world experience." },
            { icon: Award, title: "Certification", desc: "Earn recognised certificates that boost your career prospects." },
          ].map(({ icon: Icon, title, desc }, i) => (
            <div key={i} className="text-center">
              <div className="w-12 h-12 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center mx-auto mb-3">
                <Icon className="w-6 h-6 text-accent" />
              </div>
              <h4 className="font-bold text-sm mb-1">{title}</h4>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectsSection() {
  const [, setLocation] = useLocation();
  return (
    <section id="projects" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 font-mono">OUR WORK</Badge>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
            Projects That <span className="text-gradient">Speak for Themselves</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A selection of impactful solutions we've built for clients across industries.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PROJECTS.map((project, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="group p-6 rounded-2xl border border-border/50 bg-card hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 card-glow"
              data-testid={`card-project-${i}`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full font-mono">
                  {project.tag}
                </span>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="font-bold mb-2">{project.title}</h3>
              <p className="text-muted-foreground text-xs leading-relaxed mb-4">{project.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {project.tech.map((t, j) => (
                  <span key={j} className="text-[10px] font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full border border-border/40">
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button
            onClick={() => setLocation("/portfolio")}
            variant="outline"
            className="border-primary/40 text-primary hover:bg-primary/10 font-semibold px-8 h-11"
            data-testid="button-see-portfolio"
          >
            See Our Projects
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 dark:block hidden">
        <div className="absolute inset-0 dot-bg opacity-40" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 font-mono">TESTIMONIALS</Badge>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
            What Our <span className="text-gradient">Clients Say</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-6 rounded-2xl border border-border/50 bg-card relative"
              data-testid={`card-testimonial-${i}`}
            >
              <MessageSquare className="w-8 h-8 text-primary/30 mb-4" />
              <div className="flex gap-1 mb-4">
                {Array(t.rating).fill(0).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5 italic">"{t.text}"</p>
              <div className="flex items-center gap-3">
                {t.photo ? (
                  <img
                    src={t.photo}
                    alt={t.name}
                    className="w-11 h-11 rounded-full object-cover object-top border-2 border-primary/30"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {t.name[0]}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const [, setLocation] = useLocation();
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/8 via-card to-accent/8 dark:from-primary/12 dark:via-card dark:to-accent/12 p-10 sm:p-16 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 dark:block hidden grid-bg opacity-50 rounded-3xl" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
          <div className="relative z-10">
            <div className="flex justify-center mb-6">
              <img src="/e2k-logo.png" alt="E2k Tech Ventures" className="h-20 w-auto object-contain" />
            </div>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
              Ready to Build Something <span className="text-gradient">Amazing?</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10">
              Whether you have a project in mind, want to upgrade your team's skills, or just want to explore what's possible —
              let's talk.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => setLocation("/contact")}
                className="gradient-primary text-white dark:text-background font-bold h-13 px-10 text-base neon-glow-blue hover:scale-105 transition-transform"
                data-testid="button-final-cta"
              >
                Get in Touch
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-13 px-10 text-base border-border/60"
                onClick={() => document.querySelector("#services")?.scrollIntoView({ behavior: "smooth" })}
              >
                View Our Services
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div className="lg:col-span-1">
            <img src="/e2k-logo.png" alt="E2k Tech Ventures" className="h-12 w-auto object-contain mb-3" />
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Building tomorrow's digital world — one project, one lesson, one innovation at a time.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-4 font-mono uppercase tracking-wider">Services</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {["App & Web Development", "Network & Infrastructure", "AI & Automation", "Tech Education"].map(s => (
                <li key={s} className="hover:text-primary transition-colors cursor-pointer">{s}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-4 font-mono uppercase tracking-wider">Company</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {["About Us", "Our Projects", "Training Programs", "Careers"].map(s => (
                <li key={s} className="hover:text-primary transition-colors cursor-pointer">{s}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-4 font-mono uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                hello@e2ktechventures.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                +234 8140096517
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                Road B1 House 13, Pentville Estate, Lokogoma
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} E2k Tech Ventures. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground font-mono">
            Excellence · Innovation · Knowledge
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <AboutSection />
      <AISection />
      <TrainingSection />
      <ProjectsSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
}

import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Mail, Phone, MapPin, Send, CheckCircle, Code2, Brain, Wifi, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  company: z.string().optional(),
  service: z.string().min(1, "Please select a service"),
  message: z.string().min(20, "Message must be at least 20 characters"),
});

type ContactValues = z.infer<typeof contactSchema>;

const SERVICES_OPTIONS = [
  { value: "web-app", label: "App & Web Development", icon: Code2 },
  { value: "network", label: "Network & Infrastructure", icon: Wifi },
  { value: "ai", label: "AI & Automation", icon: Brain },
  { value: "training", label: "Tech Education & Training", icon: GraduationCap },
  { value: "other", label: "Something Else / Not Sure", icon: Mail },
];

const CONTACT_INFO = [
  { icon: Mail, label: "Email", value: "hello@e2ktechventures.com", color: "text-blue-400" },
  { icon: Phone, label: "Phone", value: "+234 8140096517", color: "text-emerald-400" },
  { icon: MapPin, label: "Location", value: "Road B1 House 13, Pentville Estate, Lokogoma", color: "text-violet-400" },
];

export default function ContactPage() {
  const [, setLocation] = useLocation();
  const [submitted, setSubmitted] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const { toast } = useToast();

  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", company: "", service: "", message: "" },
  });

  const handleSubmit = async (values: ContactValues) => {
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(true);
    toast({ title: "Message sent!", description: "We'll get back to you within 24 hours." });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 dark:block hidden pointer-events-none">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/6 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
          <div className="h-4 w-px bg-border" />
          <img src="/e2k-logo.png" alt="E2k Tech Ventures" className="h-10 w-auto object-contain" />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 font-mono">GET IN TOUCH</Badge>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
              Let's Build Something <span className="text-gradient">Great Together</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed mb-10">
              Tell us about your project, your goals, or what you'd like to learn — and we'll come back to you with a plan.
            </p>

            <div className="space-y-4 mb-10">
              {CONTACT_INFO.map(({ icon: Icon, label, value, color }, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card">
                  <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">{label}</p>
                    <p className="font-semibold text-sm">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 rounded-2xl border border-accent/20 bg-accent/5 dark:bg-accent/8">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-accent" />
                Our Promise to You
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  "Response within 24 hours",
                  "Free initial consultation",
                  "No commitment required",
                  "Honest, transparent pricing",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {submitted ? (
              <div className="rounded-2xl border border-primary/25 bg-card p-10 text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-black mb-3">Message Received!</h2>
                <p className="text-muted-foreground mb-8">
                  Thanks for reaching out to E2k Tech Ventures. Our team will review your message and get back to you within 24 hours.
                </p>
                <Button
                  onClick={() => setLocation("/")}
                  className="gradient-primary text-white dark:text-background font-semibold"
                >
                  Back to Home
                </Button>
              </div>
            ) : (
              <div className="rounded-2xl border border-border/50 bg-card p-6 sm:p-8">
                <h2 className="text-xl font-bold mb-6">Send Us a Message</h2>

                <div className="mb-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 font-mono">
                    What do you need help with?
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {SERVICES_OPTIONS.map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          setSelectedService(value);
                          form.setValue("service", value);
                        }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left ${
                          selectedService === value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                        }`}
                        data-testid={`button-service-${value}`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        {label}
                      </button>
                    ))}
                  </div>
                  {form.formState.errors.service && (
                    <p className="text-xs text-destructive mt-1">{form.formState.errors.service.message}</p>
                  )}
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} className="h-11" data-testid="input-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="you@example.com" {...field} className="h-11" data-testid="input-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <FormField control={form.control} name="company" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">Company / Organisation (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Your company name" {...field} className="h-11" data-testid="input-company" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="message" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">Tell us about your project *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe what you're looking to build, your timeline, budget range, or any questions you have..."
                            {...field}
                            className="min-h-[120px] resize-none"
                            data-testid="input-message"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <Button
                      type="submit"
                      className="w-full h-12 gradient-primary text-white dark:text-background font-bold text-base neon-glow-blue"
                      disabled={form.formState.isSubmitting}
                      data-testid="button-submit"
                    >
                      {form.formState.isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sending...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Send className="w-4 h-4" />
                          Send Message
                        </span>
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

import { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Camera, Upload, Zap, Radio } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { login, register: registerUser, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", email: "", password: "", confirmPassword: "", displayName: "" },
  });

  if (isAuthenticated) {
    return <Redirect to="/" />;
  }

  const handleLogin = async (values: LoginValues) => {
    try {
      await login.mutateAsync(values);
    } catch (error: any) {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
    }
  };

  const handleRegister = async (values: RegisterValues) => {
    if (!avatarPreview) {
      toast({ title: "Profile Picture Required", description: "Please upload a profile picture to continue", variant: "destructive" });
      return;
    }
    try {
      await registerUser.mutateAsync({
        username: values.username,
        email: values.email,
        password: values.password,
        displayName: values.displayName,
        avatar: avatarPreview,
      });
    } catch (error: any) {
      toast({ title: "Registration Failed", description: error.message, variant: "destructive" });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File too large", description: "Please select an image under 5MB", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => { setAvatarPreview(reader.result as string); };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen flex bg-background dark:bg-[hsl(222,28%,5%)] relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/8 dark:bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/6 dark:bg-accent/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 dark:opacity-100 opacity-0">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(195 100% 50% / 0.06) 1px, transparent 0)`,
            backgroundSize: '48px 48px'
          }} />
        </div>
      </div>

      <div className="hidden lg:flex flex-1 items-center justify-center p-12 relative">
        <div className="max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center neon-glow">
              <Zap className="w-6 h-6 text-white dark:text-background" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-gradient-e2k">E2k</h1>
              <p className="text-xs text-muted-foreground tracking-widest uppercase font-mono">Live Platform</p>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-4 leading-tight">
            The next generation<br />
            <span className="text-gradient">live streaming experience</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            Stream, connect, and grow your audience with cutting-edge tools built for creators.
          </p>
          <div className="grid grid-cols-1 gap-4">
            {[
              { icon: Radio, title: "Go Live Instantly", desc: "One-click streaming with pro-grade quality" },
              { icon: Zap, title: "Virtual Economy", desc: "Earn with gifts, coins, and subscriptions" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card/50 dark:bg-card/30">
                <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary/15 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{title}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8 lg:hidden">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Zap className="w-5 h-5 text-white dark:text-background" />
              </div>
              <h1 className="text-3xl font-black tracking-tight text-gradient-e2k" data-testid="text-brand-name">E2k</h1>
            </div>
            <p className="text-muted-foreground text-sm font-mono tracking-wider">LIVE PLATFORM</p>
          </div>

          <Card className="border-border/60 bg-card/80 dark:bg-card/60 glass-effect">
            <CardContent className="p-6">
              <div className="flex gap-2 mb-6 p-1 bg-muted/60 rounded-lg">
                <button
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${mode === "login" ? "bg-background dark:bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={() => setMode("login")}
                  data-testid="button-switch-login"
                >
                  Sign In
                </button>
                <button
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${mode === "register" ? "bg-background dark:bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={() => setMode("register")}
                  data-testid="button-switch-register"
                >
                  Sign Up
                </button>
              </div>

              <AnimatePresence mode="wait">
                {mode === "login" ? (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                  >
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Username</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your username" {...field} data-testid="input-login-username" className="h-11" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    {...field}
                                    data-testid="input-login-password"
                                    className="h-11 pr-10"
                                  />
                                  <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                    data-testid="button-toggle-password"
                                  >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="submit"
                          className="w-full h-11 gradient-primary font-semibold text-white dark:text-background"
                          disabled={login.isPending}
                          data-testid="button-login"
                        >
                          {login.isPending ? "Signing in..." : "Sign In"}
                        </Button>
                      </form>
                    </Form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="register"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                  >
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                        <div className="flex flex-col items-center mb-2">
                          <div
                            className="relative cursor-pointer group"
                            onClick={() => fileInputRef.current?.click()}
                            data-testid="button-upload-avatar"
                          >
                            <Avatar className="w-20 h-20 border-2 border-dashed border-primary/40 group-hover:border-primary transition-colors">
                              {avatarPreview ? (
                                <AvatarImage src={avatarPreview} alt="Profile" />
                              ) : (
                                <AvatarFallback className="bg-muted">
                                  <Camera className="w-8 h-8 text-muted-foreground" />
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full gradient-primary flex items-center justify-center">
                              <Upload className="w-3 h-3 text-white dark:text-background" />
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">Profile picture required</p>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                            data-testid="input-avatar-file"
                          />
                        </div>

                        <FormField control={registerForm.control} name="displayName" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Display Name</FormLabel>
                            <FormControl><Input placeholder="Your display name" {...field} data-testid="input-register-displayname" className="h-11" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={registerForm.control} name="username" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Username</FormLabel>
                            <FormControl><Input placeholder="Choose a username" {...field} data-testid="input-register-username" className="h-11" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={registerForm.control} name="email" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</FormLabel>
                            <FormControl><Input type="email" placeholder="your@email.com" {...field} data-testid="input-register-email" className="h-11" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={registerForm.control} name="password" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</FormLabel>
                            <FormControl><Input type="password" placeholder="Min 6 characters" {...field} data-testid="input-register-password" className="h-11" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={registerForm.control} name="confirmPassword" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Confirm Password</FormLabel>
                            <FormControl><Input type="password" placeholder="Confirm your password" {...field} data-testid="input-register-confirm" className="h-11" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <Button
                          type="submit"
                          className="w-full h-11 gradient-primary font-semibold text-white dark:text-background"
                          disabled={registerUser.isPending}
                          data-testid="button-register"
                        >
                          {registerUser.isPending ? "Creating account..." : "Create Account"}
                        </Button>
                      </form>
                    </Form>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
          <p className="text-center text-xs text-muted-foreground mt-4">
            Powered by <span className="text-primary font-semibold font-mono">E2k</span> · Next-gen streaming
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import type { Stream, User } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Crown, Radio, Users, TrendingUp, Play, Zap, ChevronRight } from "lucide-react";

interface StreamWithHost extends Stream {
  host?: User;
}

export default function HomePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { data: streams, isLoading: streamsLoading } = useQuery<StreamWithHost[]>({
    queryKey: ["/api/streams"],
  });

  const { data: topStreamers } = useQuery<User[]>({
    queryKey: ["/api/users/top"],
  });

  const liveStreams = (streams?.filter((s) => s.status === "live") || []).filter(
    (s) => selectedCategory === "All" || s.category === selectedCategory
  );
  const categories = ["All", "Entertainment", "Music", "Gaming", "Talk Show", "Dance", "Cooking"];

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10 dark:from-primary/15 dark:via-[hsl(222,28%,5%)] dark:to-accent/8" />
        <div className="absolute inset-0 dark:opacity-100 opacity-0 pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(195 100% 50% / 0.05) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 dark:bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-accent/8 dark:bg-accent/6 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 pt-10 pb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 dark:bg-primary/15 border border-primary/20">
                  <Radio className="w-3 h-3 text-primary live-pulse" />
                  <span className="text-xs font-semibold text-primary font-mono">{liveStreams.length} LIVE NOW</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-3 leading-tight" data-testid="text-hero-title">
                Welcome back,<br />
                <span className="text-gradient-e2k">{user?.displayName || "Creator"}</span>
              </h1>
              <p className="text-muted-foreground text-base md:text-lg max-w-md leading-relaxed">
                Discover live streams, send gifts, and connect with creators worldwide on E2k.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <Button
                  className="gradient-primary font-semibold text-white dark:text-background h-11 px-6"
                  onClick={() => setLocation("/go-live")}
                  data-testid="button-go-live"
                >
                  <Radio className="w-4 h-4 mr-2" />
                  Go Live
                </Button>
                <Button
                  variant="outline"
                  className="h-11 px-6 border-border/60 hover:border-primary/40 transition-colors"
                  onClick={() => setLocation("/explore")}
                  data-testid="button-explore"
                >
                  Explore All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>

            <div className="hidden md:flex gap-4">
              <div className="flex flex-col gap-3">
                <div className="p-4 rounded-2xl bg-card/80 dark:bg-card/60 border border-border/60 glass-effect neon-border w-44">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">E2k Live</span>
                  </div>
                  <p className="text-2xl font-black text-gradient-e2k">{liveStreams.length}</p>
                  <p className="text-xs text-muted-foreground">Active streams</p>
                </div>
                <div className="p-4 rounded-2xl bg-card/80 dark:bg-card/60 border border-border/60 glass-effect w-44">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-accent" />
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Viewers</span>
                  </div>
                  <p className="text-2xl font-black text-foreground">
                    {liveStreams.reduce((a, s) => a + (s.viewerCount || 0), 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Watching now</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              data-testid={`button-category-${cat.toLowerCase()}`}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                cat === selectedCategory
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground bg-transparent"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {topStreamers && topStreamers.length > 0 && (
          <section>
            <div className="flex items-center justify-between gap-2 mb-4">
              <h2 className="text-base font-bold flex items-center gap-2 uppercase tracking-wider font-mono text-muted-foreground">
                <Crown className="w-4 h-4 text-yellow-500" />
                Top Streamers
              </h2>
              <button
                className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
                onClick={() => setLocation("/explore")}
              >
                See All <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {topStreamers.map((streamer) => (
                <div
                  key={streamer.id}
                  className="flex flex-col items-center gap-2.5 min-w-[72px] cursor-pointer group"
                  onClick={() => setLocation(`/profile/${streamer.id}`)}
                  data-testid={`card-streamer-${streamer.id}`}
                >
                  <div className="relative">
                    <div className={`w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all ${
                      streamer.isStreaming
                        ? "border-primary shadow-[0_0_12px_hsl(195_100%_50%/0.4)]"
                        : "border-border/50 group-hover:border-primary/40"
                    }`}>
                      <Avatar className="w-full h-full rounded-none">
                        <AvatarImage src={streamer.avatar} alt={streamer.displayName} className="object-cover" />
                        <AvatarFallback className="rounded-none text-sm font-bold">{streamer.displayName[0]}</AvatarFallback>
                      </Avatar>
                    </div>
                    {streamer.isStreaming && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                        <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold tracking-wide">
                          LIVE
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-center truncate w-full font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    {streamer.displayName}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between gap-2 mb-4">
            <h2 className="text-base font-bold flex items-center gap-2 uppercase tracking-wider font-mono text-muted-foreground">
              <TrendingUp className="w-4 h-4 text-primary" />
              Live Streams
            </h2>
          </div>

          {streamsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded-2xl overflow-hidden border border-border/50">
                  <Skeleton className="aspect-video w-full" />
                  <div className="p-3 space-y-2 bg-card">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : liveStreams.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveStreams.map((stream) => (
                <div
                  key={stream.id}
                  className="group cursor-pointer rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 bg-card transition-all duration-300 hover:shadow-[0_8px_32px_hsl(195_100%_50%/0.1)] hover:-translate-y-0.5"
                  onClick={() => setLocation(`/stream/${stream.id}`)}
                  data-testid={`card-stream-${stream.id}`}
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={stream.thumbnailUrl || "/images/stream1.png"}
                      alt={stream.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/90 text-white text-xs font-bold backdrop-blur-sm">
                        <Radio className="w-2.5 h-2.5 live-pulse" />
                        LIVE
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 text-white text-xs font-medium backdrop-blur-sm">
                        <Users className="w-2.5 h-2.5" />
                        {stream.viewerCount}
                      </span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-14 h-14 rounded-full bg-primary/80 flex items-center justify-center backdrop-blur-sm neon-glow">
                        <Play className="w-6 h-6 text-white dark:text-background ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex items-start gap-2.5">
                      <Avatar className="w-8 h-8 shrink-0 rounded-lg border border-border/50">
                        <AvatarImage src={stream.host?.avatar} alt={stream.host?.displayName} />
                        <AvatarFallback className="rounded-lg text-xs font-bold">{stream.host?.displayName?.[0] || "?"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate" data-testid={`text-stream-title-${stream.id}`}>
                          {stream.title}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {stream.host?.displayName} · <span className="text-primary/80">{stream.category}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 rounded-2xl border border-dashed border-border/50">
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Radio className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold mb-2">No live streams right now</h3>
              <p className="text-muted-foreground text-sm mb-6">Be the first creator to go live on E2k!</p>
              <Button
                className="gradient-primary font-semibold text-white dark:text-background"
                onClick={() => setLocation("/go-live")}
                data-testid="button-go-live-empty"
              >
                <Radio className="w-4 h-4 mr-2" />
                Start Streaming
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

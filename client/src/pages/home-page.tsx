import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import type { Stream, User } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Crown, Search, Radio, Users, TrendingUp, Coins, Sparkles, Play, Heart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StreamWithHost extends Stream {
  host?: User;
}

export default function HomePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: streams, isLoading: streamsLoading } = useQuery<StreamWithHost[]>({
    queryKey: ["/api/streams"],
  });

  const { data: topStreamers } = useQuery<User[]>({
    queryKey: ["/api/users/top"],
  });

  const liveStreams = streams?.filter((s) => s.status === "live") || [];
  const categories = ["All", "Entertainment", "Music", "Gaming", "Talk Show", "Dance", "Cooking"];

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-64 md:h-80 overflow-hidden rounded-b-3xl mx-2 mt-2">
        <img
          src="/images/hero-bg.png"
          alt="Hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <Badge variant="secondary" className="mb-3">
            <Radio className="w-3 h-3 mr-1 text-red-500 live-pulse" />
            {liveStreams.length} Live Now
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" data-testid="text-hero-title">
            Welcome back, {user?.displayName || "Guest"}
          </h1>
          <p className="text-white/70 text-sm max-w-md">
            Join live streams, send gifts, and connect with creators worldwide
          </p>
          <div className="flex gap-3 mt-4">
            <Button className="gradient-primary" onClick={() => setLocation("/go-live")} data-testid="button-go-live">
              <Radio className="w-4 h-4 mr-2" />
              Go Live
            </Button>
            <Button variant="outline" className="bg-white/10 border-white/20 text-white" onClick={() => setLocation("/explore")} data-testid="button-explore">
              <Search className="w-4 h-4 mr-2" />
              Explore
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={cat === "All" ? "default" : "secondary"}
              size="sm"
              data-testid={`button-category-${cat.toLowerCase()}`}
            >
              {cat}
            </Button>
          ))}
        </div>

        {topStreamers && topStreamers.length > 0 && (
          <section>
            <div className="flex items-center justify-between gap-2 mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Crown className="w-5 h-5 text-accent" />
                Top Streamers
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setLocation("/explore")}>
                See All
              </Button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {topStreamers.map((streamer) => (
                <div
                  key={streamer.id}
                  className="flex flex-col items-center gap-2 min-w-[80px] cursor-pointer"
                  onClick={() => setLocation(`/profile/${streamer.id}`)}
                  data-testid={`card-streamer-${streamer.id}`}
                >
                  <div className="relative">
                    <Avatar className="w-16 h-16 border-2 border-primary">
                      <AvatarImage src={streamer.avatar} alt={streamer.displayName} />
                      <AvatarFallback>{streamer.displayName[0]}</AvatarFallback>
                    </Avatar>
                    {streamer.isStreaming && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                          LIVE
                        </Badge>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-center truncate w-full">{streamer.displayName}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between gap-2 mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Live Streams
            </h2>
          </div>

          {streamsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <Skeleton className="aspect-video w-full rounded-t-md" />
                  <CardContent className="p-3 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : liveStreams.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveStreams.map((stream) => (
                <Card
                  key={stream.id}
                  className="cursor-pointer group hover-elevate"
                  onClick={() => setLocation(`/stream/${stream.id}`)}
                  data-testid={`card-stream-${stream.id}`}
                >
                  <div className="relative aspect-video overflow-hidden rounded-t-md">
                    <img
                      src={stream.thumbnailUrl || "/images/stream1.png"}
                      alt={stream.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge variant="destructive" className="text-xs">
                        <Radio className="w-3 h-3 mr-1 live-pulse" />
                        LIVE
                      </Badge>
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <Badge variant="secondary" className="bg-black/50 text-white border-0 text-xs">
                        <Users className="w-3 h-3 mr-1" />
                        {stream.viewerCount}
                      </Badge>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-primary/80 flex items-center justify-center">
                        <Play className="w-5 h-5 text-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-9 h-9 border border-border">
                        <AvatarImage src={stream.host?.avatar} alt={stream.host?.displayName} />
                        <AvatarFallback>{stream.host?.displayName?.[0] || "?"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate" data-testid={`text-stream-title-${stream.id}`}>
                          {stream.title}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {stream.host?.displayName} · {stream.category}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Radio className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No live streams right now</h3>
              <p className="text-muted-foreground text-sm mb-4">Be the first to go live!</p>
              <Button className="gradient-primary" onClick={() => setLocation("/go-live")} data-testid="button-go-live-empty">
                Start Streaming
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

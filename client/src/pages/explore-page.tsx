import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { Stream, User } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Radio, Users, Play, ArrowLeft, TrendingUp } from "lucide-react";

interface StreamWithHost extends Stream {
  host?: User;
}

export default function ExplorePage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const { data: streams, isLoading } = useQuery<StreamWithHost[]>({
    queryKey: ["/api/streams"],
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users/top"],
  });

  const categories = ["All", "Entertainment", "Music", "Gaming", "Talk Show", "Dance", "Cooking", "Education"];

  const filteredStreams = streams?.filter((s) => {
    const matchesSearch = !searchQuery ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.host?.displayName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || s.category === activeCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const filteredUsers = users?.filter((u) =>
    !searchQuery ||
    u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")} data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search streams and users..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-4">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={cat === activeCategory ? "default" : "secondary"}
              size="sm"
              onClick={() => setActiveCategory(cat)}
              data-testid={`button-category-${cat.toLowerCase()}`}
            >
              {cat}
            </Button>
          ))}
        </div>

        {searchQuery && filteredUsers.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Users
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {filteredUsers.map((u) => (
                <Card
                  key={u.id}
                  className="min-w-[140px] cursor-pointer hover-elevate"
                  onClick={() => setLocation(`/profile/${u.id}`)}
                  data-testid={`card-user-${u.id}`}
                >
                  <CardContent className="p-3 flex flex-col items-center text-center">
                    <Avatar className="w-14 h-14 mb-2">
                      <AvatarImage src={u.avatar} alt={u.displayName} />
                      <AvatarFallback>{u.displayName[0]}</AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-medium truncate w-full">{u.displayName}</p>
                    <p className="text-[10px] text-muted-foreground">@{u.username}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            {activeCategory === "All" ? "All Streams" : activeCategory}
          </h2>

          {isLoading ? (
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
          ) : filteredStreams.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStreams.map((stream) => (
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
                    {stream.status === "live" && (
                      <Badge variant="destructive" className="absolute top-3 left-3 text-xs">
                        <Radio className="w-3 h-3 mr-1 live-pulse" />
                        LIVE
                      </Badge>
                    )}
                    <Badge variant="secondary" className="absolute bottom-3 right-3 bg-black/50 text-white border-0 text-xs">
                      <Users className="w-3 h-3 mr-1" />
                      {stream.viewerCount}
                    </Badge>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-primary/80 flex items-center justify-center">
                        <Play className="w-5 h-5 text-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-9 h-9 border border-border">
                        <AvatarImage src={stream.host?.avatar} />
                        <AvatarFallback>{stream.host?.displayName?.[0] || "?"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{stream.title}</h3>
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
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-medium mb-1">No streams found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "Try a different search term" : "No streams in this category yet"}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

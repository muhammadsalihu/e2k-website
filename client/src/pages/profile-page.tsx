import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useRoute, useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { User, Stream } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Crown, Coins, Users, UserPlus, UserCheck, Radio,
  Settings, LogOut, ShoppingBag
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StreamWithHost extends Stream {
  host?: User;
}

export default function ProfilePage() {
  const [, params] = useRoute("/profile/:id");
  const { user: currentUser, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const profileId = params?.id || currentUser?.id;
  const isOwnProfile = profileId === currentUser?.id;

  const { data: profile, isLoading } = useQuery<User>({
    queryKey: ["/api/users", profileId],
    enabled: !!profileId,
  });

  const { data: userStreams } = useQuery<StreamWithHost[]>({
    queryKey: ["/api/users", profileId, "streams"],
    enabled: !!profileId,
  });

  const { data: friendStatus } = useQuery<{ status: string }>({
    queryKey: ["/api/friends/status", profileId],
    enabled: !!profileId && !isOwnProfile,
  });

  const addFriendMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/friends/request", { friendId: profileId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends/status", profileId] });
      toast({ title: "Friend request sent!" });
    },
    onError: (error: any) => {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">User not found</p>
      </div>
    );
  }

  const tierBadgeColors: Record<string, string> = {
    free: "",
    basic: "bg-blue-500/10 text-blue-500",
    premium: "bg-purple-500/10 text-purple-500",
    vip: "bg-amber-500/10 text-amber-500",
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")} data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Profile</h1>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <Avatar className="w-24 h-24 border-4 border-primary/30">
                  <AvatarImage src={profile.avatar} alt={profile.displayName} />
                  <AvatarFallback className="text-2xl">{profile.displayName[0]}</AvatarFallback>
                </Avatar>
                {profile.isStreaming && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                    <Badge variant="destructive" className="text-[10px]">
                      <Radio className="w-2.5 h-2.5 mr-0.5 live-pulse" />
                      LIVE
                    </Badge>
                  </div>
                )}
              </div>

              <h2 className="text-xl font-bold" data-testid="text-profile-name">{profile.displayName}</h2>
              <p className="text-sm text-muted-foreground mb-2">@{profile.username}</p>

              {profile.subscriptionTier !== "free" && (
                <Badge className={`mb-3 ${tierBadgeColors[profile.subscriptionTier]}`}>
                  <Crown className="w-3 h-3 mr-1" />
                  {profile.subscriptionTier.toUpperCase()}
                </Badge>
              )}

              {profile.bio && (
                <p className="text-sm text-muted-foreground mb-4 max-w-sm">{profile.bio}</p>
              )}

              <div className="flex items-center gap-6 mb-4">
                <div className="text-center">
                  <p className="text-lg font-bold" data-testid="text-followers">{profile.followers}</p>
                  <p className="text-xs text-muted-foreground">Followers</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold" data-testid="text-following">{profile.following}</p>
                  <p className="text-xs text-muted-foreground">Following</p>
                </div>
                {isOwnProfile && (
                  <div className="text-center">
                    <p className="text-lg font-bold flex items-center gap-1">
                      <Coins className="w-4 h-4 text-accent" />
                      <span data-testid="text-coins">{profile.coins}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">Coins</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 flex-wrap justify-center">
                {isOwnProfile ? (
                  <>
                    <Button variant="secondary" onClick={() => setLocation("/shop")} data-testid="button-shop">
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Shop
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => logout.mutate()}
                      data-testid="button-logout"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    {friendStatus?.status === "accepted" ? (
                      <Button variant="secondary" disabled>
                        <UserCheck className="w-4 h-4 mr-2" />
                        Friends
                      </Button>
                    ) : friendStatus?.status === "pending" ? (
                      <Button variant="secondary" disabled>
                        Pending
                      </Button>
                    ) : (
                      <Button
                        onClick={() => addFriendMutation.mutate()}
                        disabled={addFriendMutation.isPending}
                        data-testid="button-add-friend"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Friend
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {userStreams && userStreams.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold mb-3">Streams</h3>
            <div className="grid grid-cols-2 gap-3">
              {userStreams.map((stream) => (
                <Card
                  key={stream.id}
                  className="cursor-pointer hover-elevate"
                  onClick={() => setLocation(`/stream/${stream.id}`)}
                  data-testid={`card-stream-${stream.id}`}
                >
                  <div className="relative aspect-video overflow-hidden rounded-t-md">
                    <img
                      src={stream.thumbnailUrl || "/images/stream2.png"}
                      alt={stream.title}
                      className="w-full h-full object-cover"
                    />
                    {stream.status === "live" && (
                      <Badge variant="destructive" className="absolute top-2 left-2 text-[10px]">
                        LIVE
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-2">
                    <p className="text-xs font-medium truncate">{stream.title}</p>
                    <p className="text-[10px] text-muted-foreground">
                      <Users className="w-2.5 h-2.5 inline mr-0.5" />
                      {stream.viewerCount} viewers
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

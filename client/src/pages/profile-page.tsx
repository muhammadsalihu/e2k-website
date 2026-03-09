import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useRoute, useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { User, Stream } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Crown, Coins, Users, UserPlus, UserCheck, Radio,
  LogOut, ShoppingBag, Pencil, Star, Bell, BellOff
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

  const { data: channelSubStatus } = useQuery<{ subscribed: boolean }>({
    queryKey: ["/api/channel", profileId, "subscription"],
    enabled: !!profileId && !isOwnProfile,
  });

  const { data: subscriberCount } = useQuery<{ count: number }>({
    queryKey: ["/api/channel", profileId, "subscribers"],
    enabled: !!profileId,
  });

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [editChannelPrice, setEditChannelPrice] = useState("0");
  const [priceDialogOpen, setPriceDialogOpen] = useState(false);
  const [newChannelPrice, setNewChannelPrice] = useState("0");

  function openEditDialog() {
    if (profile) {
      setEditDisplayName(profile.displayName);
      setEditBio(profile.bio || "");
      setEditAvatar(profile.avatar);
      setEditChannelPrice(String(profile.channelPrice || 0));
    }
    setEditDialogOpen(true);
  }

  function openPriceDialog() {
    if (profile) {
      setNewChannelPrice(String(profile.channelPrice || 0));
    }
    setPriceDialogOpen(true);
  }

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { displayName?: string; bio?: string; avatar?: string; channelPrice?: number }) => {
      const res = await apiRequest("PATCH", "/api/users/me", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", profileId] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setEditDialogOpen(false);
      setPriceDialogOpen(false);
      toast({ title: "Profile updated!" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update profile", description: error.message, variant: "destructive" });
    },
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

  const subscribeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/channel/${profileId}/subscribe`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/channel", profileId, "subscription"] });
      queryClient.invalidateQueries({ queryKey: ["/api/channel", profileId, "subscribers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Subscribed to channel!" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to subscribe", description: error.message, variant: "destructive" });
    },
  });

  const unsubscribeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/channel/${profileId}/unsubscribe`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/channel", profileId, "subscription"] });
      queryClient.invalidateQueries({ queryKey: ["/api/channel", profileId, "subscribers"] });
      toast({ title: "Unsubscribed from channel" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to unsubscribe", description: error.message, variant: "destructive" });
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
                <div className="text-center">
                  <p className="text-lg font-bold" data-testid="text-subscribers">{subscriberCount?.count || 0}</p>
                  <p className="text-xs text-muted-foreground">Subscribers</p>
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
                    <Button variant="secondary" onClick={openEditDialog} data-testid="button-edit-profile">
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button variant="secondary" onClick={openPriceDialog} data-testid="button-set-channel-price">
                      <Coins className="w-4 h-4 mr-2" />
                      Sub Price: {profile.channelPrice || "Free"}
                    </Button>
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

                    {channelSubStatus?.subscribed ? (
                      <Button
                        variant="secondary"
                        onClick={() => unsubscribeMutation.mutate()}
                        disabled={unsubscribeMutation.isPending}
                        data-testid="button-unsubscribe"
                      >
                        <BellOff className="w-4 h-4 mr-2" />
                        Unsubscribe
                      </Button>
                    ) : (
                      <Button
                        className="gradient-primary"
                        onClick={() => subscribeMutation.mutate()}
                        disabled={subscribeMutation.isPending}
                        data-testid="button-subscribe"
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Subscribe {profile.channelPrice > 0 ? `(${profile.channelPrice} coins)` : "(Free)"}
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

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateProfileMutation.mutate({
                displayName: editDisplayName,
                bio: editBio,
                avatar: editAvatar,
                channelPrice: Number(editChannelPrice),
              });
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="edit-display-name">Display Name</Label>
              <Input
                id="edit-display-name"
                data-testid="input-edit-display-name"
                value={editDisplayName}
                onChange={(e) => setEditDisplayName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-bio">Bio</Label>
              <Textarea
                id="edit-bio"
                data-testid="input-edit-bio"
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-avatar">Avatar URL</Label>
              <Input
                id="edit-avatar"
                data-testid="input-edit-avatar"
                value={editAvatar}
                onChange={(e) => setEditAvatar(e.target.value)}
                required
              />
              {editAvatar && (
                <div className="flex justify-center pt-2">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={editAvatar} alt="Preview" />
                    <AvatarFallback>{editDisplayName?.[0] || "?"}</AvatarFallback>
                  </Avatar>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-channel-price">Channel Subscription Price (coins)</Label>
              <Input
                id="edit-channel-price"
                data-testid="input-edit-channel-price"
                type="number"
                min="0"
                max="100000"
                value={editChannelPrice}
                onChange={(e) => setEditChannelPrice(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Set to 0 for free subscriptions</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                data-testid="button-cancel-edit"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                data-testid="button-save-profile"
              >
                {updateProfileMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={priceDialogOpen} onOpenChange={setPriceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Channel Subscription Price</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateProfileMutation.mutate({
                channelPrice: Number(newChannelPrice),
              });
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="new-channel-price">Price in Coins</Label>
              <Input
                id="new-channel-price"
                data-testid="input-channel-price"
                type="number"
                min="0"
                max="100000"
                value={newChannelPrice}
                onChange={(e) => setNewChannelPrice(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Users will pay this many coins to subscribe to your channel. Set to 0 for free.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPriceDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                data-testid="button-save-channel-price"
              >
                {updateProfileMutation.isPending ? "Saving..." : "Save Price"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

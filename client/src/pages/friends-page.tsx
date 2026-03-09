import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { User, Friend } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, UserCheck, UserPlus, UserX, Radio, Users, Search, Loader2 } from "lucide-react";

interface FriendWithUser extends Friend {
  user?: User;
  friend?: User;
}

export default function FriendsPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(value.trim());
    }, 300);
  };

  const { data: friends } = useQuery<FriendWithUser[]>({
    queryKey: ["/api/friends"],
  });

  const { data: pendingRequests } = useQuery<FriendWithUser[]>({
    queryKey: ["/api/friends/pending"],
  });

  const { data: searchResults, isLoading: isSearching } = useQuery<User[]>({
    queryKey: ["/api/users/search", `?q=${encodeURIComponent(debouncedQuery)}`],
    enabled: debouncedQuery.length > 0,
  });

  const addFriendMutation = useMutation({
    mutationFn: async (friendId: string) => {
      const res = await apiRequest("POST", "/api/friends/request", { friendId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
      queryClient.invalidateQueries({ queryKey: ["/api/friends/pending"] });
      toast({ title: "Friend request sent!" });
    },
    onError: (error: Error) => {
      toast({ title: "Could not send request", description: error.message, variant: "destructive" });
    },
  });

  const acceptMutation = useMutation({
    mutationFn: async (friendshipId: string) => {
      const res = await apiRequest("POST", `/api/friends/${friendshipId}/accept`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
      queryClient.invalidateQueries({ queryKey: ["/api/friends/pending"] });
      toast({ title: "Friend request accepted!" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (friendshipId: string) => {
      const res = await apiRequest("POST", `/api/friends/${friendshipId}/reject`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends/pending"] });
      toast({ title: "Friend request declined" });
    },
  });

  const acceptedFriends = friends?.filter((f) => f.status === "accepted") || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")} data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Friends</h1>
        </div>

        <Tabs defaultValue="friends">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="friends" className="flex-1" data-testid="tab-friends">
              <Users className="w-4 h-4 mr-2" />
              Friends ({acceptedFriends.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex-1" data-testid="tab-pending">
              <UserPlus className="w-4 h-4 mr-2" />
              Requests ({pendingRequests?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="find" className="flex-1" data-testid="tab-find-friends">
              <Search className="w-4 h-4 mr-2" />
              Find Friends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends">
            {acceptedFriends.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-medium mb-1">No friends yet</h3>
                <p className="text-sm text-muted-foreground">
                  Add friends while watching streams!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {acceptedFriends.map((friendship) => {
                  const friendUser = friendship.userId === user?.id ? friendship.friend : friendship.user;
                  if (!friendUser) return null;
                  return (
                    <Card
                      key={friendship.id}
                      className="cursor-pointer hover-elevate"
                      onClick={() => setLocation(`/profile/${friendUser.id}`)}
                      data-testid={`card-friend-${friendship.id}`}
                    >
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={friendUser.avatar} alt={friendUser.displayName} />
                            <AvatarFallback>{friendUser.displayName[0]}</AvatarFallback>
                          </Avatar>
                          {friendUser.isStreaming && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 border-2 border-card flex items-center justify-center">
                              <Radio className="w-2 h-2 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{friendUser.displayName}</p>
                          <p className="text-xs text-muted-foreground">@{friendUser.username}</p>
                        </div>
                        {friendUser.isStreaming && (
                          <Badge variant="destructive" className="text-[10px]">LIVE</Badge>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending">
            {!pendingRequests || pendingRequests.length === 0 ? (
              <div className="text-center py-12">
                <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-medium mb-1">No pending requests</h3>
                <p className="text-sm text-muted-foreground">
                  You're all caught up!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((req) => {
                  const requester = req.user;
                  if (!requester) return null;
                  return (
                    <Card key={req.id} data-testid={`card-request-${req.id}`}>
                      <CardContent className="p-3 flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={requester.avatar} alt={requester.displayName} />
                          <AvatarFallback>{requester.displayName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{requester.displayName}</p>
                          <p className="text-xs text-muted-foreground">@{requester.username}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              acceptMutation.mutate(req.id);
                            }}
                            data-testid={`button-accept-${req.id}`}
                          >
                            <UserCheck className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              rejectMutation.mutate(req.id);
                            }}
                            data-testid={`button-reject-${req.id}`}
                          >
                            <UserX className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="find">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by username or display name..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9"
                data-testid="input-search-users"
              />
            </div>

            {!debouncedQuery ? (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-medium mb-1">Search for friends</h3>
                <p className="text-sm text-muted-foreground">
                  Type a username or display name to find people
                </p>
              </div>
            ) : isSearching ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : !searchResults || searchResults.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-medium mb-1">No users found</h3>
                <p className="text-sm text-muted-foreground">
                  Try a different search term
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {searchResults
                  .filter((u) => u.id !== user?.id)
                  .map((foundUser) => {
                    const isFriend = friends?.some(
                      (f) =>
                        (f.userId === foundUser.id || f.friendId === foundUser.id) &&
                        (f.status === "accepted" || f.status === "pending")
                    );
                    return (
                      <Card
                        key={foundUser.id}
                        className="cursor-pointer hover-elevate"
                        onClick={() => setLocation(`/profile/${foundUser.id}`)}
                        data-testid={`card-search-result-${foundUser.id}`}
                      >
                        <CardContent className="p-3 flex items-center gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={foundUser.avatar} alt={foundUser.displayName} />
                            <AvatarFallback>{foundUser.displayName[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{foundUser.displayName}</p>
                            <p className="text-xs text-muted-foreground">@{foundUser.username}</p>
                          </div>
                          {isFriend ? (
                            <Badge variant="secondary" className="text-xs" data-testid={`badge-status-${foundUser.id}`}>
                              <UserCheck className="w-3 h-3 mr-1" />
                              Added
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                addFriendMutation.mutate(foundUser.id);
                              }}
                              disabled={addFriendMutation.isPending}
                              data-testid={`button-add-friend-${foundUser.id}`}
                            >
                              <UserPlus className="w-4 h-4 mr-1" />
                              Add
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

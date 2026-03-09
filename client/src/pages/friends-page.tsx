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
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, UserCheck, UserPlus, UserX, Radio, Users } from "lucide-react";

interface FriendWithUser extends Friend {
  user?: User;
  friend?: User;
}

export default function FriendsPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: friends } = useQuery<FriendWithUser[]>({
    queryKey: ["/api/friends"],
  });

  const { data: pendingRequests } = useQuery<FriendWithUser[]>({
    queryKey: ["/api/friends/pending"],
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
        </Tabs>
      </div>
    </div>
  );
}

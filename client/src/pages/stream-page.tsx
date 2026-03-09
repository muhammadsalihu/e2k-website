import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useRoute, useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Stream, User, Gift, ChatMessage } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Radio, Users, Heart, Gift as GiftIcon, Send, UserPlus, Video,
  Share2, MoreVertical, Crown, Coins, X, MessageCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface StreamWithHost extends Stream {
  host?: User;
}

interface ChatMsg {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  message: string;
  isGift?: boolean;
  giftName?: string;
  giftIcon?: string;
}

export default function StreamPage() {
  const [, params] = useRoute("/stream/:id");
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [showGiftPanel, setShowGiftPanel] = useState(false);
  const [flyingGifts, setFlyingGifts] = useState<{ id: string; icon: string; name: string }[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const streamId = params?.id;

  const { data: stream } = useQuery<StreamWithHost>({
    queryKey: ["/api/streams", streamId],
    enabled: !!streamId,
  });

  const { data: gifts } = useQuery<Gift[]>({
    queryKey: ["/api/gifts"],
  });

  const { data: currentUser } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (res.status === 401) return null;
      return res.json();
    },
  });

  const sendGiftMutation = useMutation({
    mutationFn: async (data: { giftId: string; receiverId: string; quantity: number }) => {
      const res = await apiRequest("POST", "/api/gifts/send", {
        ...data,
        streamId,
      });
      return res.json();
    },
    onSuccess: (_, variables) => {
      const gift = gifts?.find((g) => g.id === variables.giftId);
      if (gift) {
        const newFlying = { id: Date.now().toString(), icon: gift.icon, name: gift.name };
        setFlyingGifts((prev) => [...prev, newFlying]);
        setTimeout(() => {
          setFlyingGifts((prev) => prev.filter((g) => g.id !== newFlying.id));
        }, 2000);

        setChatMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            username: user?.username || "",
            displayName: user?.displayName || "You",
            avatar: user?.avatar || "",
            message: `sent ${gift.name}!`,
            isGift: true,
            giftName: gift.name,
            giftIcon: gift.icon,
          },
        ]);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setShowGiftPanel(false);
      toast({ title: "Gift sent!" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to send gift", description: error.message, variant: "destructive" });
    },
  });

  const addFriendMutation = useMutation({
    mutationFn: async (friendId: string) => {
      const res = await apiRequest("POST", "/api/friends/request", { friendId });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Friend request sent!" });
    },
    onError: (error: any) => {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    },
  });

  useEffect(() => {
    if (!streamId || !user) return;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "join_stream", streamId, userId: user.id }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "chat_message") {
          if (String(data.payload.userId) !== String(user.id)) {
            setChatMessages((prev) => [...prev, data.payload]);
          }
        } else if (data.type === "gift_sent") {
          const newFlying = { id: Date.now().toString(), icon: data.payload.giftIcon, name: data.payload.giftName };
          setFlyingGifts((prev) => [...prev, newFlying]);
          setTimeout(() => {
            setFlyingGifts((prev) => prev.filter((g) => g.id !== newFlying.id));
          }, 2000);
        } else if (data.type === "viewer_update") {
          queryClient.invalidateQueries({ queryKey: ["/api/streams", streamId] });
        }
      } catch {}
    };

    return () => {
      ws.close();
    };
  }, [streamId, user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const sendChat = () => {
    if (!chatInput.trim() || !wsRef.current || !user) return;
    const msgPayload = {
      id: Date.now().toString(),
      userId: user.id,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
      message: chatInput.trim(),
    };
    wsRef.current.send(
      JSON.stringify({
        type: "chat_message",
        streamId,
        payload: msgPayload,
      })
    );
    setChatMessages((prev) => [...prev, msgPayload]);
    setChatInput("");
  };

  if (!stream) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Radio className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading stream...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      <div className="flex-1 flex flex-col">
        <div className="relative aspect-video bg-black">
          <img
            src={stream.thumbnailUrl || "/images/stream1.png"}
            alt={stream.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          <div className="absolute top-4 left-4 flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/")} className="bg-black/40 text-white" data-testid="button-back">
              <X className="w-5 h-5" />
            </Button>
            <Badge variant="destructive" className="text-xs">
              <Radio className="w-3 h-3 mr-1 live-pulse" />
              LIVE
            </Badge>
            <Badge variant="secondary" className="bg-black/50 text-white border-0 text-xs">
              <Users className="w-3 h-3 mr-1" />
              {stream.viewerCount}
            </Badge>
          </div>

          <AnimatePresence>
            {flyingGifts.map((gift) => (
              <motion.div
                key={gift.id}
                className="absolute bottom-20 left-1/2 text-4xl"
                initial={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
                animate={{ opacity: 0, y: -120, scale: 1.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, ease: "easeOut" }}
              >
                <div className="flex flex-col items-center">
                  <span className="text-5xl">{gift.icon}</span>
                  <span className="text-white text-xs font-bold bg-black/50 px-2 py-0.5 rounded-full mt-1">
                    {gift.name}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border-2 border-primary">
                <AvatarImage src={stream.host?.avatar} alt={stream.host?.displayName} />
                <AvatarFallback>{stream.host?.displayName?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-white font-semibold text-sm" data-testid="text-stream-title">{stream.title}</h2>
                <p className="text-white/70 text-xs">{stream.host?.displayName}</p>
              </div>
              <div className="flex gap-2">
                {stream.hostId !== user?.id && (
                  <>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="bg-black/40 text-white"
                      onClick={() => stream.host && addFriendMutation.mutate(stream.host.id)}
                      data-testid="button-add-friend"
                    >
                      <UserPlus className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="bg-black/40 text-white" data-testid="button-join-video">
                      <Video className="w-4 h-4" />
                    </Button>
                  </>
                )}
                <Button size="icon" variant="ghost" className="bg-black/40 text-white" data-testid="button-share">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:hidden flex-1 flex flex-col min-h-[300px]">
          <ChatSection
            chatMessages={chatMessages}
            chatInput={chatInput}
            setChatInput={setChatInput}
            sendChat={sendChat}
            chatEndRef={chatEndRef}
            showGiftPanel={showGiftPanel}
            setShowGiftPanel={setShowGiftPanel}
            gifts={gifts}
            stream={stream}
            user={user}
            currentUser={currentUser}
            sendGiftMutation={sendGiftMutation}
          />
        </div>
      </div>

      <div className="hidden lg:flex flex-col w-96 border-l border-border">
        <ChatSection
          chatMessages={chatMessages}
          chatInput={chatInput}
          setChatInput={setChatInput}
          sendChat={sendChat}
          chatEndRef={chatEndRef}
          showGiftPanel={showGiftPanel}
          setShowGiftPanel={setShowGiftPanel}
          gifts={gifts}
          stream={stream}
          user={user}
          currentUser={currentUser}
          sendGiftMutation={sendGiftMutation}
        />
      </div>
    </div>
  );
}

function ChatSection({
  chatMessages,
  chatInput,
  setChatInput,
  sendChat,
  chatEndRef,
  showGiftPanel,
  setShowGiftPanel,
  gifts,
  stream,
  user,
  currentUser,
  sendGiftMutation,
}: {
  chatMessages: ChatMsg[];
  chatInput: string;
  setChatInput: (v: string) => void;
  sendChat: () => void;
  chatEndRef: React.RefObject<HTMLDivElement>;
  showGiftPanel: boolean;
  setShowGiftPanel: (v: boolean) => void;
  gifts: Gift[] | undefined;
  stream: StreamWithHost;
  user: User | null;
  currentUser: User | null | undefined;
  sendGiftMutation: any;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border flex items-center justify-between gap-2">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          Live Chat
        </h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Coins className="w-3 h-3 text-accent" />
          <span data-testid="text-user-coins">{currentUser?.coins || 0}</span>
        </div>
      </div>

      <ScrollArea className="flex-1 p-3">
        <div className="space-y-3">
          {chatMessages.length === 0 && (
            <div className="text-center py-8">
              <MessageCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No messages yet. Say hi!</p>
            </div>
          )}
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2 ${msg.isGift ? "bg-accent/10 rounded-md p-2" : ""}`}
              data-testid={`chat-message-${msg.id}`}
            >
              <Avatar className="w-6 h-6 flex-shrink-0">
                <AvatarImage src={msg.avatar} />
                <AvatarFallback className="text-[10px]">{msg.displayName[0]}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <span className="text-xs font-medium text-primary">{msg.displayName}</span>
                {msg.isGift ? (
                  <p className="text-xs">
                    <span className="text-accent">{msg.giftIcon}</span>{" "}
                    <span className="text-muted-foreground">{msg.message}</span>
                  </p>
                ) : (
                  <p className="text-xs text-foreground break-words">{msg.message}</p>
                )}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
      </ScrollArea>

      <AnimatePresence>
        {showGiftPanel && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border overflow-hidden"
          >
            <div className="p-3">
              <div className="flex items-center justify-between gap-2 mb-3">
                <h4 className="text-sm font-medium flex items-center gap-1">
                  <GiftIcon className="w-4 h-4 text-accent" />
                  Send a Gift
                </h4>
                <Button size="icon" variant="ghost" onClick={() => setShowGiftPanel(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {gifts?.map((gift) => (
                  <button
                    key={gift.id}
                    className="flex flex-col items-center gap-1 p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                    onClick={() => {
                      if (stream.host) {
                        sendGiftMutation.mutate({
                          giftId: gift.id,
                          receiverId: stream.host.id,
                          quantity: 1,
                        });
                      }
                    }}
                    disabled={sendGiftMutation.isPending}
                    data-testid={`button-gift-${gift.id}`}
                  >
                    <span className="text-2xl">{gift.icon}</span>
                    <span className="text-[10px] truncate w-full text-center">{gift.name}</span>
                    <span className="text-[10px] text-accent flex items-center gap-0.5">
                      <Coins className="w-2.5 h-2.5" />
                      {gift.coinCost}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShowGiftPanel(!showGiftPanel)}
            className="flex-shrink-0"
            data-testid="button-toggle-gifts"
          >
            <GiftIcon className="w-5 h-5 text-accent" />
          </Button>
          <Input
            placeholder="Say something..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendChat()}
            className="text-sm"
            data-testid="input-chat"
          />
          <Button
            size="icon"
            onClick={sendChat}
            disabled={!chatInput.trim()}
            data-testid="button-send-chat"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

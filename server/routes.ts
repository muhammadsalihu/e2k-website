import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import crypto from "crypto";
import { storage } from "./storage";
import { pool } from "./db";
import { seedDatabase } from "./seed";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function sanitizeUser(user: any) {
  const { password, ...safe } = user;
  return safe;
}

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const PgStore = ConnectPgSimple(session);
  app.use(
    session({
      store: new PgStore({
        pool,
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || "ultra-palace-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      },
    })
  );

  await seedDatabase();

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { username, email, password, displayName, avatar } = req.body;

      if (!username || !email || !password || !displayName || !avatar) {
        return res.status(400).json({ message: "All fields are required, including profile picture" });
      }

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }

      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }

      const user = await storage.createUser({
        username,
        email,
        password: hashPassword(password),
        displayName,
        avatar,
      });

      req.session.userId = user.id;
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);

      if (!user || user.password !== hashPassword(password)) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/streams", async (_req: Request, res: Response) => {
    const allStreams = await storage.getStreams();
    res.json(allStreams.map(s => ({ ...s, host: s.host ? sanitizeUser(s.host) : undefined })));
  });

  app.get("/api/streams/:id", async (req: Request, res: Response) => {
    const stream = await storage.getStream(req.params.id);
    if (!stream) {
      return res.status(404).json({ message: "Stream not found" });
    }
    res.json({ ...stream, host: stream.host ? sanitizeUser(stream.host) : undefined });
  });

  app.post("/api/streams", requireAuth, async (req: Request, res: Response) => {
    try {
      const { title, description, category } = req.body;
      const stream = await storage.createStream({
        hostId: req.session.userId!,
        title,
        description,
        category,
        thumbnailUrl: "/images/stream1.png",
      });
      res.json(stream);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/streams/:id/end", requireAuth, async (req: Request, res: Response) => {
    try {
      const stream = await storage.getStream(req.params.id);
      if (!stream) {
        return res.status(404).json({ message: "Stream not found" });
      }
      if (stream.hostId !== req.session.userId) {
        return res.status(403).json({ message: "Only the host can end this stream" });
      }
      await storage.endStream(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/gifts", async (_req: Request, res: Response) => {
    const allGifts = await storage.getGifts();
    res.json(allGifts);
  });

  app.post("/api/gifts/send", requireAuth, async (req: Request, res: Response) => {
    try {
      const { giftId, receiverId, streamId, quantity = 1 } = req.body;
      const userId = req.session.userId!;

      const gift = await storage.getGift(giftId);
      if (!gift) {
        return res.status(404).json({ message: "Gift not found" });
      }

      const sender = await storage.getUser(userId);
      if (!sender) {
        return res.status(404).json({ message: "User not found" });
      }

      const totalCost = gift.coinCost * quantity;
      if (sender.coins < totalCost) {
        return res.status(400).json({ message: "Not enough coins" });
      }

      await storage.updateUser(userId, { coins: sender.coins - totalCost });
      const receiver = await storage.getUser(receiverId);
      if (receiver) {
        await storage.updateUser(receiverId, { coins: receiver.coins + totalCost });
      }

      const tx = await storage.createGiftTransaction({
        senderId: userId,
        receiverId,
        giftId,
        streamId,
        quantity,
        totalCoins: totalCost,
      });

      broadcastToStream(streamId, {
        type: "gift_sent",
        payload: {
          senderName: sender.displayName,
          giftName: gift.name,
          giftIcon: gift.icon,
          quantity,
        },
      });

      res.json(tx);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/shop/coins", async (_req: Request, res: Response) => {
    const packages = await storage.getCoinPackages();
    res.json(packages);
  });

  app.get("/api/shop/subscriptions", async (_req: Request, res: Response) => {
    const plans = await storage.getSubscriptionPlans();
    res.json(plans);
  });

  app.post("/api/shop/buy-coins", requireAuth, async (req: Request, res: Response) => {
    try {
      const { packageId } = req.body;
      const userId = req.session.userId!;

      const packages = await storage.getCoinPackages();
      const pkg = packages.find((p) => p.id === packageId);
      if (!pkg) {
        return res.status(404).json({ message: "Package not found" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const totalCoins = pkg.coins + pkg.bonus;
      await storage.updateUser(userId, { coins: user.coins + totalCoins });

      res.json({ coins: totalCoins, newBalance: user.coins + totalCoins });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/shop/subscribe", requireAuth, async (req: Request, res: Response) => {
    try {
      const { planId } = req.body;
      const userId = req.session.userId!;

      const plans = await storage.getSubscriptionPlans();
      const plan = plans.find((p) => p.id === planId);
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await storage.updateUser(userId, {
        subscriptionTier: plan.tier,
        coins: user.coins + plan.monthlyCoins,
      });

      res.json({ tier: plan.tier, coinsAdded: plan.monthlyCoins });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/users/top", async (_req: Request, res: Response) => {
    const topUsers = await storage.getTopUsers();
    const safeUsers = topUsers.map(({ password, ...u }) => u);
    res.json(safeUsers);
  });

  app.get("/api/users/search", async (req: Request, res: Response) => {
    const q = (req.query.q as string || "").trim();
    if (!q) {
      return res.json([]);
    }
    const results = await storage.searchUsers(q);
    res.json(results.map(u => sanitizeUser(u)));
  });

  app.patch("/api/users/me", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const { displayName, bio, avatar } = req.body;
      const updates: Record<string, any> = {};
      if (displayName !== undefined) {
        const trimmed = String(displayName).trim();
        if (trimmed.length === 0 || trimmed.length > 50) {
          return res.status(400).json({ message: "Display name must be 1-50 characters" });
        }
        updates.displayName = trimmed;
      }
      if (bio !== undefined) {
        updates.bio = String(bio).slice(0, 500);
      }
      if (avatar !== undefined) {
        const trimmedAvatar = String(avatar).trim();
        if (trimmedAvatar.length === 0) {
          return res.status(400).json({ message: "Avatar cannot be empty" });
        }
        updates.avatar = trimmedAvatar;
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "No fields to update" });
      }

      const updated = await storage.updateUser(userId, updates);
      if (!updated) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(sanitizeUser(updated));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/users/:id", async (req: Request, res: Response) => {
    const user = await storage.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(sanitizeUser(user));
  });

  app.get("/api/users/:id/streams", async (req: Request, res: Response) => {
    const userStreams = await storage.getUserStreams(req.params.id);
    res.json(userStreams);
  });

  app.get("/api/friends", requireAuth, async (req: Request, res: Response) => {
    const friendsList = await storage.getFriends(req.session.userId!);
    res.json(friendsList.map(f => ({
      ...f,
      user: f.user ? sanitizeUser(f.user) : undefined,
      friend: f.friend ? sanitizeUser(f.friend) : undefined,
    })));
  });

  app.get("/api/friends/pending", requireAuth, async (req: Request, res: Response) => {
    const pending = await storage.getPendingFriendRequests(req.session.userId!);
    res.json(pending.map(f => ({
      ...f,
      user: f.user ? sanitizeUser(f.user) : undefined,
      friend: f.friend ? sanitizeUser(f.friend) : undefined,
    })));
  });

  app.get("/api/friends/status/:friendId", requireAuth, async (req: Request, res: Response) => {
    const friendship = await storage.getFriendStatus(req.session.userId!, req.params.friendId);
    res.json({ status: friendship?.status || "none" });
  });

  app.post("/api/friends/request", requireAuth, async (req: Request, res: Response) => {
    try {
      const { friendId } = req.body;
      const userId = req.session.userId!;

      if (userId === friendId) {
        return res.status(400).json({ message: "Cannot add yourself as friend" });
      }

      const existing = await storage.getFriendStatus(userId, friendId);
      if (existing) {
        return res.status(400).json({ message: "Friend request already exists" });
      }

      const request = await storage.createFriendRequest(userId, friendId);
      res.json(request);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/friends/:id/accept", requireAuth, async (req: Request, res: Response) => {
    try {
      const friendship = await storage.getFriendById(req.params.id);
      if (!friendship) {
        return res.status(404).json({ message: "Request not found" });
      }
      if (friendship.friendId !== req.session.userId) {
        return res.status(403).json({ message: "Only the recipient can accept this request" });
      }
      const updated = await storage.updateFriendStatus(req.params.id, "accepted");
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/friends/:id/reject", requireAuth, async (req: Request, res: Response) => {
    try {
      const friendship = await storage.getFriendById(req.params.id);
      if (!friendship) {
        return res.status(404).json({ message: "Request not found" });
      }
      if (friendship.friendId !== req.session.userId) {
        return res.status(403).json({ message: "Only the recipient can reject this request" });
      }
      const updated = await storage.updateFriendStatus(req.params.id, "rejected");
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  const streamRooms = new Map<string, Set<WebSocket>>();

  function broadcastToStream(streamId: string, data: any) {
    const room = streamRooms.get(streamId);
    if (room) {
      const msg = JSON.stringify(data);
      room.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(msg);
        }
      });
    }
  }

  wss.on("connection", (ws) => {
    let currentStreamId: string | null = null;

    ws.on("message", (rawData) => {
      try {
        const data = JSON.parse(rawData.toString());

        if (data.type === "join_stream") {
          if (currentStreamId && currentStreamId !== data.streamId) {
            const oldRoom = streamRooms.get(currentStreamId);
            if (oldRoom) {
              oldRoom.delete(ws);
              const oldCount = oldRoom.size;
              if (oldCount === 0) {
                streamRooms.delete(currentStreamId);
              } else {
                broadcastToStream(currentStreamId, {
                  type: "viewer_update",
                  payload: { count: oldCount },
                });
              }
              storage.updateStream(currentStreamId, { viewerCount: oldCount });
            }
          }

          currentStreamId = data.streamId;
          if (!streamRooms.has(data.streamId)) {
            streamRooms.set(data.streamId, new Set());
          }
          streamRooms.get(data.streamId)!.add(ws);

          const room = streamRooms.get(data.streamId)!;
          broadcastToStream(data.streamId, {
            type: "viewer_update",
            payload: { count: room.size },
          });

          storage.updateStream(data.streamId, { viewerCount: room.size });
        }

        if (data.type === "chat_message" && data.streamId) {
          broadcastToStream(data.streamId, {
            type: "chat_message",
            payload: data.payload,
          });
        }
      } catch {}
    });

    ws.on("close", () => {
      if (currentStreamId) {
        const room = streamRooms.get(currentStreamId);
        if (room) {
          room.delete(ws);
          const newCount = room.size;
          if (newCount === 0) {
            streamRooms.delete(currentStreamId);
          } else {
            broadcastToStream(currentStreamId, {
              type: "viewer_update",
              payload: { count: newCount },
            });
          }
          storage.updateStream(currentStreamId, { viewerCount: newCount });
        }
      }
    });
  });

  return httpServer;
}

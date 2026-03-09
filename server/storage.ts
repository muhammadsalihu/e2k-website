import { eq, and, or, desc, ilike } from "drizzle-orm";
import { db } from "./db";
import {
  users, streams, gifts, giftTransactions, coinPackages,
  subscriptionPlans, friends, channelSubscriptions, streamCoHosts, chatMessages,
  type User, type InsertUser, type Stream, type Gift,
  type GiftTransaction, type CoinPackage, type SubscriptionPlan,
  type Friend, type ChannelSubscription, type StreamCoHost, type ChatMessage
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  getTopUsers(): Promise<User[]>;

  getStreams(): Promise<(Stream & { host?: User })[]>;
  getStream(id: string): Promise<(Stream & { host?: User }) | undefined>;
  createStream(data: Partial<Stream>): Promise<Stream>;
  updateStream(id: string, data: Partial<Stream>): Promise<Stream | undefined>;
  getUserStreams(userId: string): Promise<Stream[]>;
  endStream(id: string): Promise<void>;

  getGifts(): Promise<Gift[]>;
  getGift(id: string): Promise<Gift | undefined>;
  createGiftTransaction(data: Partial<GiftTransaction>): Promise<GiftTransaction>;

  getCoinPackages(): Promise<CoinPackage[]>;
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;

  getFriends(userId: string): Promise<(Friend & { user?: User; friend?: User })[]>;
  getPendingFriendRequests(userId: string): Promise<(Friend & { user?: User; friend?: User })[]>;
  getFriendStatus(userId: string, friendId: string): Promise<Friend | undefined>;
  getFriendById(id: string): Promise<Friend | undefined>;
  createFriendRequest(userId: string, friendId: string): Promise<Friend>;
  updateFriendStatus(id: string, status: "accepted" | "rejected"): Promise<Friend | undefined>;

  searchUsers(query: string): Promise<User[]>;

  getChannelSubscription(subscriberId: string, channelId: string): Promise<ChannelSubscription | undefined>;
  createChannelSubscription(subscriberId: string, channelId: string): Promise<ChannelSubscription>;
  deleteChannelSubscription(subscriberId: string, channelId: string): Promise<void>;
  getChannelSubscribers(channelId: string): Promise<ChannelSubscription[]>;

  addCoHost(streamId: string, userId: string): Promise<StreamCoHost>;
  getCoHosts(streamId: string): Promise<(StreamCoHost & { user?: User })[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(data: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  }

  async getTopUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.followers)).limit(20);
  }

  async getStreams(): Promise<(Stream & { host?: User })[]> {
    const allStreams = await db.select().from(streams).orderBy(desc(streams.createdAt));
    const results = [];
    for (const stream of allStreams) {
      const host = await this.getUser(stream.hostId);
      results.push({ ...stream, host });
    }
    return results;
  }

  async getStream(id: string): Promise<(Stream & { host?: User }) | undefined> {
    const [stream] = await db.select().from(streams).where(eq(streams.id, id));
    if (!stream) return undefined;
    const host = await this.getUser(stream.hostId);
    return { ...stream, host };
  }

  async createStream(data: Partial<Stream>): Promise<Stream> {
    const [stream] = await db.insert(streams).values(data as any).returning();
    if (data.hostId) {
      await db.update(users).set({ isStreaming: true }).where(eq(users.id, data.hostId));
    }
    return stream;
  }

  async updateStream(id: string, data: Partial<Stream>): Promise<Stream | undefined> {
    const [stream] = await db.update(streams).set(data).where(eq(streams.id, id)).returning();
    return stream;
  }

  async getUserStreams(userId: string): Promise<Stream[]> {
    return db.select().from(streams).where(eq(streams.hostId, userId)).orderBy(desc(streams.createdAt));
  }

  async endStream(id: string): Promise<void> {
    const [stream] = await db.select().from(streams).where(eq(streams.id, id));
    if (stream) {
      await db.update(streams).set({ status: "ended" }).where(eq(streams.id, id));
      await db.update(users).set({ isStreaming: false }).where(eq(users.id, stream.hostId));
    }
  }

  async getGifts(): Promise<Gift[]> {
    return db.select().from(gifts);
  }

  async getGift(id: string): Promise<Gift | undefined> {
    const [gift] = await db.select().from(gifts).where(eq(gifts.id, id));
    return gift;
  }

  async createGiftTransaction(data: Partial<GiftTransaction>): Promise<GiftTransaction> {
    const [tx] = await db.insert(giftTransactions).values(data as any).returning();
    return tx;
  }

  async getCoinPackages(): Promise<CoinPackage[]> {
    return db.select().from(coinPackages);
  }

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return db.select().from(subscriptionPlans);
  }

  async getFriends(userId: string): Promise<(Friend & { user?: User; friend?: User })[]> {
    const friendships = await db.select().from(friends).where(
      and(
        or(eq(friends.userId, userId), eq(friends.friendId, userId)),
        eq(friends.status, "accepted")
      )
    );
    const results = [];
    for (const f of friendships) {
      const user = await this.getUser(f.userId);
      const friend = await this.getUser(f.friendId);
      results.push({ ...f, user, friend });
    }
    return results;
  }

  async getPendingFriendRequests(userId: string): Promise<(Friend & { user?: User; friend?: User })[]> {
    const requests = await db.select().from(friends).where(
      and(eq(friends.friendId, userId), eq(friends.status, "pending"))
    );
    const results = [];
    for (const f of requests) {
      const user = await this.getUser(f.userId);
      const friend = await this.getUser(f.friendId);
      results.push({ ...f, user, friend });
    }
    return results;
  }

  async getFriendById(id: string): Promise<Friend | undefined> {
    const [friendship] = await db.select().from(friends).where(eq(friends.id, id));
    return friendship;
  }

  async getFriendStatus(userId: string, friendId: string): Promise<Friend | undefined> {
    const [friendship] = await db.select().from(friends).where(
      or(
        and(eq(friends.userId, userId), eq(friends.friendId, friendId)),
        and(eq(friends.userId, friendId), eq(friends.friendId, userId))
      )
    );
    return friendship;
  }

  async createFriendRequest(userId: string, friendId: string): Promise<Friend> {
    const [request] = await db.insert(friends).values({ userId, friendId }).returning();
    return request;
  }

  async updateFriendStatus(id: string, status: "accepted" | "rejected"): Promise<Friend | undefined> {
    const [updated] = await db.update(friends).set({ status }).where(eq(friends.id, id)).returning();
    return updated;
  }

  async searchUsers(query: string): Promise<User[]> {
    return db.select().from(users).where(
      or(
        ilike(users.username, `%${query}%`),
        ilike(users.displayName, `%${query}%`)
      )
    ).limit(20);
  }

  async getChannelSubscription(subscriberId: string, channelId: string): Promise<ChannelSubscription | undefined> {
    const [sub] = await db.select().from(channelSubscriptions).where(
      and(eq(channelSubscriptions.subscriberId, subscriberId), eq(channelSubscriptions.channelId, channelId))
    );
    return sub;
  }

  async createChannelSubscription(subscriberId: string, channelId: string): Promise<ChannelSubscription> {
    const [sub] = await db.insert(channelSubscriptions).values({ subscriberId, channelId }).returning();
    return sub;
  }

  async deleteChannelSubscription(subscriberId: string, channelId: string): Promise<void> {
    await db.delete(channelSubscriptions).where(
      and(eq(channelSubscriptions.subscriberId, subscriberId), eq(channelSubscriptions.channelId, channelId))
    );
  }

  async getChannelSubscribers(channelId: string): Promise<ChannelSubscription[]> {
    return db.select().from(channelSubscriptions).where(eq(channelSubscriptions.channelId, channelId));
  }

  async addCoHost(streamId: string, userId: string): Promise<StreamCoHost> {
    const [cohost] = await db.insert(streamCoHosts).values({ streamId, userId }).returning();
    return cohost;
  }

  async getCoHosts(streamId: string): Promise<(StreamCoHost & { user?: User })[]> {
    const cohosts = await db.select().from(streamCoHosts).where(eq(streamCoHosts.streamId, streamId));
    const results = [];
    for (const ch of cohosts) {
      const user = await this.getUser(ch.userId);
      results.push({ ...ch, user });
    }
    return results;
  }
}

export const storage = new DatabaseStorage();

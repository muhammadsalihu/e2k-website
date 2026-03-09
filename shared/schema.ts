import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const subscriptionTierEnum = pgEnum("subscription_tier", ["free", "basic", "premium", "vip"]);
export const streamStatusEnum = pgEnum("stream_status", ["live", "ended", "scheduled"]);
export const friendStatusEnum = pgEnum("friend_status", ["pending", "accepted", "rejected"]);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  avatar: text("avatar").notNull(),
  bio: text("bio").default(""),
  coins: integer("coins").default(100).notNull(),
  subscriptionTier: subscriptionTierEnum("subscription_tier").default("free").notNull(),
  isStreaming: boolean("is_streaming").default(false).notNull(),
  channelPrice: integer("channel_price").default(0).notNull(),
  followers: integer("followers").default(0).notNull(),
  following: integer("following").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const streams = pgTable("streams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hostId: varchar("host_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").default(""),
  thumbnailUrl: text("thumbnail_url").default(""),
  viewerCount: integer("viewer_count").default(0).notNull(),
  status: streamStatusEnum("status").default("live").notNull(),
  category: text("category").default("Entertainment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const gifts = pgTable("gifts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  coinCost: integer("coin_cost").notNull(),
  animation: text("animation").default("bounce"),
});

export const giftTransactions = pgTable("gift_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
  giftId: varchar("gift_id").notNull().references(() => gifts.id),
  streamId: varchar("stream_id").references(() => streams.id),
  quantity: integer("quantity").default(1).notNull(),
  totalCoins: integer("total_coins").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const coinPackages = pgTable("coin_packages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  coins: integer("coins").notNull(),
  price: text("price").notNull(),
  bonus: integer("bonus").default(0).notNull(),
  popular: boolean("popular").default(false).notNull(),
});

export const subscriptionPlans = pgTable("subscription_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  tier: subscriptionTierEnum("tier").notNull(),
  monthlyCoins: integer("monthly_coins").notNull(),
  price: text("price").notNull(),
  features: text("features").array().notNull(),
});

export const friends = pgTable("friends", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  friendId: varchar("friend_id").notNull().references(() => users.id),
  status: friendStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const channelSubscriptions = pgTable("channel_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subscriberId: varchar("subscriber_id").notNull().references(() => users.id),
  channelId: varchar("channel_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const streamCoHosts = pgTable("stream_co_hosts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  streamId: varchar("stream_id").notNull().references(() => streams.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  streamId: varchar("stream_id").notNull().references(() => streams.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  displayName: true,
  avatar: true,
});

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const insertStreamSchema = createInsertSchema(streams).pick({
  title: true,
  description: true,
  category: true,
});

export const insertGiftTransactionSchema = createInsertSchema(giftTransactions).pick({
  receiverId: true,
  giftId: true,
  streamId: true,
  quantity: true,
});

export const insertFriendSchema = createInsertSchema(friends).pick({
  friendId: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  streamId: true,
  message: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Stream = typeof streams.$inferSelect;
export type Gift = typeof gifts.$inferSelect;
export type GiftTransaction = typeof giftTransactions.$inferSelect;
export type CoinPackage = typeof coinPackages.$inferSelect;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type Friend = typeof friends.$inferSelect;
export type ChannelSubscription = typeof channelSubscriptions.$inferSelect;
export type StreamCoHost = typeof streamCoHosts.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;

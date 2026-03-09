import { db } from "./db";
import { users, gifts, coinPackages, subscriptionPlans, streams } from "@shared/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function seedDatabase() {
  const existingGifts = await db.select().from(gifts);
  if (existingGifts.length > 0) return;

  await db.insert(gifts).values([
    { name: "Rose", icon: "\uD83C\uDF39", coinCost: 10, animation: "bounce" },
    { name: "Heart", icon: "\u2764\uFE0F", coinCost: 25, animation: "float" },
    { name: "Star", icon: "\u2B50", coinCost: 50, animation: "spin" },
    { name: "Diamond", icon: "\uD83D\uDC8E", coinCost: 100, animation: "sparkle" },
    { name: "Crown", icon: "\uD83D\uDC51", coinCost: 500, animation: "bounce" },
    { name: "Rocket", icon: "\uD83D\uDE80", coinCost: 1000, animation: "fly" },
    { name: "Fire", icon: "\uD83D\uDD25", coinCost: 200, animation: "burn" },
    { name: "Trophy", icon: "\uD83C\uDFC6", coinCost: 2000, animation: "shine" },
  ]);

  await db.insert(coinPackages).values([
    { name: "Starter", coins: 100, price: "$0.99", bonus: 0, popular: false },
    { name: "Popular", coins: 500, price: "$4.99", bonus: 50, popular: true },
    { name: "Pro", coins: 1200, price: "$9.99", bonus: 200, popular: false },
    { name: "Elite", coins: 3000, price: "$19.99", bonus: 800, popular: false },
    { name: "VIP Pack", coins: 8000, price: "$49.99", bonus: 3000, popular: false },
    { name: "Ultra Pack", coins: 20000, price: "$99.99", bonus: 10000, popular: false },
  ]);

  await db.insert(subscriptionPlans).values([
    {
      name: "Basic",
      tier: "basic",
      monthlyCoins: 500,
      price: "$4.99",
      features: ["500 coins monthly", "Basic badges", "Standard quality streams", "Chat access"],
    },
    {
      name: "Premium",
      tier: "premium",
      monthlyCoins: 2000,
      price: "$14.99",
      features: ["2000 coins monthly", "Premium badges", "HD quality streams", "Priority support", "Custom emotes"],
    },
    {
      name: "VIP",
      tier: "vip",
      monthlyCoins: 5000,
      price: "$29.99",
      features: ["5000 coins monthly", "VIP crown badge", "4K quality streams", "Dedicated support", "Exclusive gifts", "Co-host priority"],
    },
  ]);

  const demoUser1 = await db.insert(users).values({
    username: "musicqueen",
    email: "musicqueen@demo.com",
    password: hashPassword("demo123"),
    displayName: "Music Queen",
    avatar: "/images/avatar1.png",
    coins: 5000,
    subscriptionTier: "premium",
    followers: 15000,
    following: 245,
    bio: "Live music performances every evening",
    isStreaming: true,
  }).returning();

  const demoUser2 = await db.insert(users).values({
    username: "gamerpro",
    email: "gamerpro@demo.com",
    password: hashPassword("demo123"),
    displayName: "Gamer Pro",
    avatar: "/images/avatar2.png",
    coins: 3200,
    subscriptionTier: "vip",
    followers: 28000,
    following: 120,
    bio: "Competitive gaming & tutorials",
    isStreaming: true,
  }).returning();

  if (demoUser1[0] && demoUser2[0]) {
    await db.insert(streams).values([
      {
        hostId: demoUser1[0].id,
        title: "Live Music Session - Acoustic Covers",
        description: "Playing your favorite songs live!",
        thumbnailUrl: "/images/stream2.png",
        viewerCount: 342,
        status: "live",
        category: "Music",
      },
      {
        hostId: demoUser2[0].id,
        title: "Pro Gaming - Ranked Matches",
        description: "Climbing the ranks together!",
        thumbnailUrl: "/images/stream1.png",
        viewerCount: 1205,
        status: "live",
        category: "Gaming",
      },
    ]);
  }
}

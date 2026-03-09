# Ultra Palace Live

## Overview
A premium live streaming platform inspired by ultrapalacelive.com. Features live streaming, real-time chat, gift system with coins, subscriptions, friend system, and co-hosting capabilities.

## Architecture
- **Frontend**: React + TypeScript with Vite, TanStack Query, wouter routing, shadcn/ui, Framer Motion
- **Backend**: Express.js with PostgreSQL (Drizzle ORM), WebSocket for real-time features
- **Auth**: Session-based (express-session with pg store)

## Key Features
- User registration with mandatory profile picture
- Live streaming with real-time chat (WebSocket)
- Gift system: Buy and send virtual gifts during streams
- Coin system: In-app currency for gifts and subscriptions
- Subscription tiers: Free, Basic, Premium, VIP
- Friend system: Add friends, accept/reject requests
- Co-hosting: Join streams with video
- Dark theme with purple/gold accent

## Structure
```
client/src/
  App.tsx - Main app with routing
  pages/
    auth-page.tsx - Login/Register
    home-page.tsx - Home feed with live streams
    stream-page.tsx - Watch stream with chat & gifts
    go-live-page.tsx - Start a new stream
    shop-page.tsx - Buy coins and subscriptions
    profile-page.tsx - User profile
    friends-page.tsx - Friends list and requests
    explore-page.tsx - Search and discover
  components/
    bottom-nav.tsx - Mobile bottom navigation
    theme-provider.tsx - Dark/light theme
  hooks/
    use-auth.ts - Authentication hook
server/
  index.ts - Express server setup
  routes.ts - API routes + WebSocket
  storage.ts - Database CRUD operations
  db.ts - Drizzle + pg pool
  seed.ts - Seed data for gifts, packages, plans, demo users
shared/
  schema.ts - Drizzle schemas and types
```

## Database Tables
- users (auth, profile, coins, subscription)
- streams (live streams with host)
- gifts (virtual gifts catalog)
- gift_transactions (gift purchase history)
- coin_packages (coin purchase options)
- subscription_plans (subscription tiers)
- friends (friend relationships)
- stream_co_hosts (co-hosting)
- chat_messages (stream chat)

## Payments
Currently uses an internal coin system (no external payment gateway). Coins can be purchased and used for gifts and subscriptions. External payment integration (Paystack, PayPal) can be added later.

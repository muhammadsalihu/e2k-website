# Ultra Palace Live

## Overview
A premium live streaming platform inspired by ultrapalacelive.com. Features live streaming (LiveKit), real-time chat, gift system with coins, subscriptions, friend system, channel subscriptions, and co-hosting capabilities.

## Architecture
- **Frontend**: React + TypeScript with Vite, TanStack Query, wouter routing, shadcn/ui, Framer Motion
- **Backend**: Express.js with PostgreSQL (Drizzle ORM), WebSocket for real-time features
- **Auth**: Session-based (express-session with pg store)
- **Live Video**: LiveKit (livekit-server-sdk backend, @livekit/components-react frontend)

## Key Features
- User registration with mandatory profile picture
- Live streaming with LiveKit (real video, front/back camera switching)
- Real-time chat (WebSocket)
- Gift system: Buy and send virtual gifts during streams
- Coin system: In-app currency for gifts and subscriptions
- Subscription tiers: Free, Basic, Premium, VIP
- Channel subscriptions: Streamers set their own price in coins, viewers subscribe per channel
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
    stream-page.tsx - Watch stream with chat & gifts + LiveKit video
    go-live-page.tsx - Start a new stream
    shop-page.tsx - Buy coins and subscriptions
    profile-page.tsx - User profile with channel subscription
    friends-page.tsx - Friends list and requests
    explore-page.tsx - Search and discover
  components/
    bottom-nav.tsx - Mobile bottom navigation
    theme-provider.tsx - Dark/light theme
    livekit-room.tsx - LiveKit video room component (host/viewer, camera switch)
  hooks/
    use-auth.ts - Authentication hook
server/
  index.ts - Express server setup
  routes.ts - API routes + WebSocket
  storage.ts - Database CRUD operations
  db.ts - Drizzle + pg pool
  seed.ts - Seed data for gifts, packages, plans, demo users
  livekit.ts - LiveKit token generation utility
shared/
  schema.ts - Drizzle schemas and types
```

## Database Tables
- users (auth, profile, coins, subscription, channelPrice)
- streams (live streams with host)
- gifts (virtual gifts catalog)
- gift_transactions (gift purchase history)
- coin_packages (coin purchase options)
- subscription_plans (subscription tiers)
- friends (friend relationships)
- channel_subscriptions (per-channel subscriptions: subscriberId, channelId)
- stream_co_hosts (co-hosting)
- chat_messages (stream chat)

## LiveKit Integration
- Requires env vars: LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET
- server/livekit.ts generates JWT tokens for room access
- GET /api/livekit/config returns whether LiveKit is configured
- POST /api/livekit/token returns a token for joining a stream room
- Frontend gracefully degrades to thumbnail when LiveKit is not configured
- Host controls: mic toggle, camera toggle, front/back camera switch
- Viewer sees host's live video stream

## Channel Subscriptions
- Users have a `channelPrice` field (default 0 = free)
- Streamers set their subscription price via profile edit or dedicated dialog
- Viewers subscribe from the profile page, paying coins to the channel owner
- API: GET /api/channel/:id/subscription, POST subscribe/unsubscribe, GET subscribers count
- PATCH /api/users/me also accepts `channelPrice` for updates
- PATCH /api/channel/price for dedicated price update

## Payments
Currently uses an internal coin system (no external payment gateway). Coins can be purchased and used for gifts and channel subscriptions. External payment integration (Paystack, PayPal) can be added later.

## Security
- `sanitizeUser()` helper in server/routes.ts strips password hashes from all API responses
- PATCH /api/users/me validates displayName (1-50 chars), bio (max 500 chars), avatar (non-empty), channelPrice (0-100000)
- Route ordering: /api/users/search and /api/users/me must come before /api/users/:id

## Real-time Features
- WebSocket at /ws path with auto-reconnection (exponential backoff, max 10s)
- Connection status indicator shown during reconnection
- Chat message send gated on WebSocket readyState === OPEN

## Key Implementation Notes
- `apiRequest(method, url, data)` — method, url, data order
- Category filtering on home page via selectedCategory state
- User search on friends page with 300ms debounce (useRef-based timer)
- End stream button visible only to stream host, invalidates stream caches
- Share button copies stream URL to clipboard with error handling
- Profile edit dialog on own profile page
- Seed data: musicqueen/demo123, gamerpro/demo123
- Vite cache bug: Clearing `node_modules/.vite` fixes React hooks null dispatcher crash

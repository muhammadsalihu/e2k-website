# E2k Tech Ventures Website

## Overview
A professional company website for E2k Tech Ventures — a full-spectrum tech company offering app/web development, network infrastructure, AI & automation, and tech education. Built to attract and retain clients.

## Architecture
- **Frontend**: React + TypeScript with Vite, wouter routing, shadcn/ui components, Framer Motion animations
- **Backend**: Express.js with PostgreSQL (Drizzle ORM)
- **Styling**: Tailwind CSS with custom dark-mode design system (electric blue/cyan primary)

## Pages
- `/` — Full landing page with Hero, Services, About, AI, Training, Projects, Testimonials, CTA, Footer
- `/contact` — Contact form with service selector
- `*` — 404 not found page

## Design System
- **Primary**: Electric blue/cyan (hsl 197 100% 50%)
- **Accent**: Neon green (hsl 158 100% 45%)
- **Dark mode by default**
- **Logo**: `/public/e2k-logo.png` — astronaut mascot giving peace sign
- Grid backgrounds, glassmorphism effects, neon glows, Framer Motion scroll animations

## Key Files
- `client/src/pages/landing-page.tsx` — Main company landing page (all sections)
- `client/src/pages/contact-page.tsx` — Contact/inquiry form
- `client/src/index.css` — Design system, custom utilities, animations
- `client/src/App.tsx` — Simple router
- `client/src/components/theme-provider.tsx` — Dark mode default

## Sections on Landing Page
1. **Navbar** — Sticky with logo, nav links, Get Started CTA
2. **Hero** — Bold headline, stats, dual CTAs
3. **Services** — 4 cards: Web/App, Network, AI, Training
4. **About** — Company story with logo showcase
5. **AI & Automation** — Capabilities + CTA card
6. **Tech Training** — Program grid + benefits
7. **Projects** — 6 portfolio cards
8. **Testimonials** — 3 client quotes
9. **Final CTA** — Big call to action section
10. **Footer** — Links, contact info, copyright

## Running
Workflow `Start application` runs `npm run dev` which starts Express + Vite on port 5000.

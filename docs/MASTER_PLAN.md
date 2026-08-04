# SiquiTour Complete Master Plan

## Recommended Tech Stack (2026)
- Mobile: React Native + Expo + TypeScript
- Admin: React, Next.js, TypeScript, Tailwind CSS, shadcn/ui
- Backend: Laravel 13 (Sanctum, Queue, Scheduler, Horizon, Reverb, Notifications)
- Database: MySQL (via XAMPP for local dev; managed MySQL/MariaDB in production)
- Cloud Storage: Cloudflare R2 or AWS S3
- Authentication: Laravel Sanctum (Email, Google, Apple, Facebook)
- Chat: Laravel Reverb + Firebase Cloud Messaging
- Maps: Google Maps SDK or Mapbox
- GPS: React Native Location
- Payments: PayMongo, GCash, Maya, Credit Cards
- Notifications: Firebase Cloud Messaging
- Hosting: Vercel (Admin), Hetzner/DigitalOcean/Hostinger VPS/AWS Lightsail
- CI/CD: GitHub + GitHub Actions

## Overall Architecture
```
React Native Mobile App
        v
Laravel REST API
        v
MySQL
        v
Cloud Storage (R2/S3)
        v
Firebase Cloud Messaging
        v
Next.js Admin Dashboard
```

## Roles and Version 1 Features

**Guest**
- Advance booking on a tour, choosing a tour guide and pax count
- Pay for advance bookings
- Rate the tour guide after a completed booking
- Chat with a tour guide or renter (can start the conversation first)
- Follow / block a tour guide

**Tour Guide**
- Edit bio (profile, years of experience, rate per pax)
- Chat with clients, see incoming messages
- Follow and follow back guests
- Calendar: add guests to their availability calendar
- Accept or decline guest bookings

**Renter** (motorbikes, cars, tuktuk, rooms, etc.)
- Add listings (type, price, description)
- Add location via map, add images
- Message guests and tour guides
- Follow and follow back

**Super Admin**
- Manage all accounts (verify, suspend)
- Set the commission percentage taken per advance booking
- Add spots and restaurants (curated attractions)

## Data Model (Phase 1 — implemented)

Single `users` table with a `role` enum (`guest`, `tour_guide`, `renter`, `admin`) plus a thin profile table per role:

- `tour_guide_profiles`, `guide_availability` — guide bio/rate and calendar
- `renter_profiles`, `rentals`, `rental_images` — rental listings (motorbike/car/tuktuk/van/bicycle/room)
- `spots` — admin-curated attractions and restaurants
- `commission_settings` — admin-configurable platform commission percentage
- `bookings` (polymorphic over guide or rental), `payments` — booking + payment + commission tracking
- `reviews` — guest rates guide after a completed booking
- `conversations`, `messages` — chat between any two users
- `follows`, `blocks` — social graph between guest/guide/renter

Auth is Laravel Sanctum (Bearer tokens for the mobile app). Public registration accepts `guest`, `tour_guide`, or `renter`; `admin` accounts are seed-only.

## Development Phases
1. **Backend foundation** *(done)* — DB schema, models, role-based Sanctum auth
2. **Core API** *(done)* — public browse (guides/rentals/spots), booking lifecycle (create/accept/decline/complete/cancel) with commission calculation, reviews, follows/blocks, chat, guide profile + calendar, renter rental CRUD, admin user verification/suspension + commission config + spot CRUD
3. **Realtime & notifications** *(next)* — Laravel Reverb (chat) + Firebase Cloud Messaging (push)
4. **Payments** — PayMongo/GCash/Maya integration, commission calculation on booking confirm
5. **Mobile app** — Expo screens: auth, role-based navigation, booking flow, chat, maps, calendar
6. **Admin dashboard** — Next.js: user verification, spot/restaurant CRUD, commission settings, reports
7. **Testing & deployment** — automated tests, VPS + domain + SSL, Play Store + App Store submission

## Final Project Structure
```
SiquiTour/
  apps/mobile
  apps/admin
  backend/laravel-api
  database
  docs
  design
  docker
  scripts
  .github
  README.md
```

## Build From Scratch
1. Plan requirements.
2. Design UI/UX.
3. Design MySQL database.
4. Build Laravel backend APIs.
5. Add authentication.
6. Build React Native mobile app.
7. Build Next.js admin panel.
8. Integrate Maps, Chat, Payments, Notifications.
9. Test.
10. Deploy backend and admin.
11. Publish Android and iOS apps.
12. Maintain and scale.

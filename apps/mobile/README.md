# SiquiTour Mobile

Expo Router app for Guest, Tour Guide, and Renter roles (Admin also has a lightweight
mobile screen set), talking to the Laravel API in `backend/laravel-api`.

## Running

1. Start the backend first (from `backend/laravel-api`): `php artisan serve`
   (needs MySQL running via XAMPP, database `siquitour`).
2. From `apps/mobile`: `npm run web` (or `npm start` for the Expo Go / simulator flow).

## Connecting to the API

The app reads `EXPO_PUBLIC_API_URL`. If unset, it falls back to:
- Android emulator: `http://10.0.2.2:8000` (emulator's alias for the host machine)
- iOS simulator / web: `http://127.0.0.1:8000`

For a physical device, set `EXPO_PUBLIC_API_URL` to your machine's LAN IP, e.g.:

```
EXPO_PUBLIC_API_URL=http://192.168.1.23:8000 npx expo start
```

## Structure

- `app/` — Expo Router file-based routes. `(auth)` is public; `(guest)`, `(guide)`,
  `(renter)`, `(admin)` are role-gated tab groups mounted by `app/_layout.tsx` based
  on the logged-in user's role.
- `src/api/client.ts` — fetch wrapper with bearer-token auth.
- `src/api/queries/` — TanStack Query hooks, one file per API resource.
- `src/auth/` — session context + token storage (SecureStore on native, localStorage on web).
- `src/types/api.ts` — TypeScript types mirroring the Laravel API's JSON responses.
- `src/components/` — shared UI (Button, Card, TextField, etc.), plain `StyleSheet`.
- `src/screens/` — screens shared across role groups (chat, profile).

## Not yet built

- Maps / location picker (needs a Google Maps API key)
- Native camera/gallery image upload (backend has no cloud storage wired up yet either —
  rental photos are added by URL for now)
- Push notifications (depends on Firebase Cloud Messaging, not set up)
- A real calendar widget for guide availability (currently a simple date list)

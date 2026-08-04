# SiquiTour

Tourism platform for Siquijor: mobile app, admin dashboard, and Laravel API. Roles: Guest, Tour Guide, Renter, and Super Admin.

See [docs/MASTER_PLAN.md](docs/MASTER_PLAN.md) for the full tech stack, architecture, features, and phased roadmap.

## Project Structure

```
SiquiTour/
  apps/mobile        React Native + Expo + TypeScript app
  apps/admin         Next.js + TypeScript + Tailwind admin dashboard
  backend/laravel-api Laravel 13 REST API
  database           MySQL schema, migrations, seeders
  docs               Planning docs, SRS, ERD, API specs
  design             UI/UX design files
  docker             Local dev containers
  scripts            Dev/deploy helper scripts
  .github            CI/CD workflows
```

## Getting Started

- Backend: see [backend/laravel-api/README.md](backend/laravel-api/README.md)
- Mobile: see [apps/mobile/README.md](apps/mobile/README.md)
- Admin: see [apps/admin/README.md](apps/admin/README.md)

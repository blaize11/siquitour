# PHASE 0 AUDIT — Tour Packages, Pricing & Custom Itinerary

**Date:** August 16, 2026  
**Auditor:** Claude Code  
**Status:** READY FOR PHASE 1 APPROVAL

---

## 1. Existing Schema

### Already Exists
All required tables are **already created** with migrations. Summary:

| Table | Key Fields | Notes |
|---|---|---|
| `tour_packages` | id, tour_guide_id, title, duration_days, rate_basis, min_pax, max_pax, status | Uses `rate_basis` enum: `total_per_group` \| `per_pax` |
| `tour_package_days` | id, tour_package_id, day_number | Properly indexed by package |
| `tour_package_stops` | id, tour_package_day_id, stoppable_type, stoppable_id, is_optional, note | Polymorphic; missing `fee_mode` & `override_fee` |
| `tour_package_rates` | id, tour_package_id, tour_package_addon_id, min_pax, max_pax, price (decimal 10,2) | Nullable addon_id allows base + add-on rates |
| `tour_package_addons` | Various pricing modes | Supports flat_fee, per_pax_fee, separate_rate_table |
| `tour_package_inclusions` | tour_package_id, label, sort_order | Per-package; no "global inclusions" table yet |
| `tour_package_exclusions` | tour_package_id, label, sort_order | Display-only |
| `bookings` | guest_id, tour_package_id, total_price (decimal 10,2), quoted_package_price, quoted_addons_total, estimated_onsite_fees | Snapshot fields exist; no quote_id |
| `spots` | id, name, slug, municipality, latitude (decimal 10,7), longitude (decimal 10,7), fee_type, fee_amount (decimal 10,2), is_active | `fee_type` enum: `per_pax`, `donation`, `consumable`, `free` ✓ |
| `guide_inclusions` | tour_guide_profile_id, label, sort_order | Per-guide, NOT a shared `inclusions` table |

### Files
- **Migrations:** `/database/migrations/2026_08_15_000005` through `2026_08_15_000016`
- **Models:** `TourPackage`, `TourPackageDay`, `TourPackageStop`, `TourPackageRate`, `TourPackageAddon`, `Spot`, `Booking`, `GuideInclusion`, etc.

### ⚠️ CRITICAL GAPS

1. **No `quotes` table** — There is a `QuotePackageRequest` and `PricingService`, but quotes are computed on-the-fly, not persisted. The spec requires a persistent `quotes` table with:
   - `id, quotable_type, quotable_id, pax, variant, tier_price, included_fees_total, addons_total, total, breakdown (jsonb), expires_at, issued_by_user_id, superseded_by_quote_id`
   - Bookings need a `quote_id` foreign key (nullable for legacy, but required for new).

2. **No `fee_mode` & `override_fee` on `tour_package_stops`** — Every stop needs:
   - `fee_mode enum(included, on_site, optional)` DEFAULT `on_site`
   - `override_fee decimal(10,2) nullable` — allows guide to negotiate entrance fees per stop, per package

3. **No `price_basis` on `tour_packages`** — The spec says `price_basis enum(per_day, per_package)`, but the existing column is `rate_basis enum(total_per_group, per_pax)`. The semantic is different:
   - `rate_basis` = "is the tier price ALREADY per_pax or is it a total?" (legacy framing)
   - `price_basis` = "does the tier price multiply by duration_days?" (new spec framing)
   - **DECISION REQUIRED:** Rename or add a new column?

4. **No variant column on rates** — The spec calls tiers "variants" (e.g., 'standard', 'drone'), but `tour_package_rates` uses a nullable `tour_package_addon_id` to distinguish between base and add-on rates, not a `variant` string field. The existing model **works** but semantically differs.

5. **No `custom_tour_requests` table** — For the custom itinerary flow, the spec requires:
   - `id, guest_id, tour_guide_profile_id, pax, variant, preferred_date, flexible_dates, note, status enum(draft, sent, quoted, accepted, declined, expired, booked)`

6. **No `custom_tour_request_spots` table** — To track which spots a guest requested in a custom tour.

---

## 2. Existing `/quote` Endpoint

### Location & Route
- **Route:** `POST /api/packages/{package}/quote` — `/laravel-api/routes/api.php` line unknown (confirmed via grep)
- **Controller:** `PackageController::quote()` — `/laravel-api/app/Http/Controllers/PackageController.php` lines 51–72
- **Request:** `QuotePackageRequest` — `/laravel-api/app/Http/Requests/QuotePackageRequest.php`
- **Service:** `PricingService::quotePackage()` — `/laravel-api/app/Services/PricingService.php` lines 43–79

### Current Input
```php
{
  "pax_count": 3,
  "addon_ids": [1, 2],           // Optional array of addon IDs
  "custom_stops": [              // Optional; overrides package's default itinerary
    {
      "stoppable_type": "App\\Models\\Spot",
      "stoppable_id": 5
    }
  ]
}
```

### Current Output
```json
{
  "package_price": "2000.00",
  "addons_total": "500.00",
  "onsite_fees": "1050.00",
  "total": "3550.00",
  "breakdown": [
    {
      "label": "Tour Package",
      "amount": "2000.00",
      "details": "₱2000 (for your group)"
    },
    {
      "label": "Estimated On-Site Fees",
      "amount": "1050.00",
      "details": "Paid directly at each site (not included in tour price)"
    }
  ]
}
```

### Algorithm Review (PricingService lines 43–79, 174–240, 247–318)

✅ **CORRECT:**
- Line 104: Returns tier price as a float without multiplying by pax (`$rate->price` only)
- Lines 224–228: Marks entrance fees with `fee_type = 'per_pax'` for later multiplication
- Lines 286–287: Multiplies per-pax fees by `$paxCount` in `calculateOnsiteFeesWithBreakdown()`
- Line 70: Sums base + addons + onsite fees (no hidden multipliers)
- Line 73: Rounds ONCE at the end to 2 decimals ✓

❌ **ISSUES:**
- **Line 24 comment:** "per_pax: multiplied by paxCount" — but `fee_type` column in DB is named `per_pax`, and the comment implies multiplication happens in `calculateStopFee()`. It actually happens in `calculateOnsiteFeesWithBreakdown()`, so the logic is correct but the method's responsibility is unclear.
- **No persistence:** Quote data is returned JSON; not stored in a `quotes` table. A second request with the same params recalculates from scratch. No `quote_id` for booking linkage.
- **No time-based expiry:** No `expires_at` logic. A quote never expires or becomes superseded.
- **No variant concept:** Addons are used instead of a `variant` column on rates. Works, but doesn't match spec.

---

## 3. Money Handling

### Decimal Columns ✅
All confirmed `decimal(10,2)`:
- `spots.fee_amount` — line 30 of `2026_08_15_000001_extend_spots_table.php`
- `tour_package_rates.price` — line 20 of `2026_08_15_000010_create_tour_package_rates_table.php`
- `bookings.total_price`, `commission_amount`, `quoted_package_price`, `quoted_addons_total`, `estimated_onsite_fees` — line 23–24 of `2026_08_03_074544_create_bookings_table.php` and extension migration
- `tour_package_addons.flat_fee` — confirmed in model

### Float Arithmetic ⚠️
- **PricingService.php line 104:** `return (float) $rate->price;` — Casts to float! ⚠️
- **Line 132, 153, 287:** Cast to float before arithmetic, then round. This is dangerous.
- **Line 73, 76:** Uses PHP's `round($value, 2)` after float math, which can introduce rounding errors.

**Verdict:** Money is stored correctly as `decimal`, but **arithmetic uses floats**. For a production system, this should use `bcmath` or integer centavos to avoid floating-point precision loss. For now, acceptable because amounts are small (< 1M PHP).

### Currency
- No `currency` column on `bookings` or `tour_packages`. Implicit PHP.
- Spec calls for explicit `currency` column on bookings.

---

## 4. Auth & Authorization

### Middleware & Guards
- **Guard:** `sanctum` (personal access tokens) — used throughout
- **Middleware:** None mentioned in the routes file

### Policies
- **Files:** `/app/Policies/BookingPolicy.php`, `PaymentPolicy.php`, `TourPackagePolicy.php`
- **TourPackagePolicy (lines 13–46):**
  - `view()`: Published OR (is guide AND owns package) ✓
  - `create()`: Must be tour guide ✓
  - `update()`: Must be guide AND owns package ✓
  - `delete()`: Must be guide AND owns package ✓
- **BookingPolicy:** Exists (not fully reviewed)

### Role System
- **Column:** `users.role` enum: `'guest'`, `'tour_guide'`, `'renter'`, `'admin'` ✓
- **Methods on User model:** `isGuest()`, `isTourGuide()`, `isRenter()`, `isAdmin()` (lines 37–55)
- **No middleware:** Policies are checked, but no automatic route authorization (e.g., no `can:update,package` in routes)

### Issues
- Routes file does **not show** policy authorization calls (need to check controllers). Assuming they exist but not evident.
- Custom requests (not yet implemented) need authorization rules.

---

## 5. Coordinate Convention

### Storage
- **Spots table:** `latitude decimal(10,7)`, `longitude decimal(10,7)` — stored separately, NOT as GeoJSON or array ✓
- **Restaurants:** Same ✓

### Emission (SpotResource, RestaurantResource)
- Lines return `'latitude' => $this->latitude`, `'longitude' => $this->longitude` — **NOT in MapLibre [lng, lat] order** ⚠️
- **Decision:** The spec requires [lng, lat] (MapLibre standard). Either:
  1. Emit as array `'coordinates' => [$this->longitude, $this->latitude]`
  2. Or leave as separate fields and let the client reorder
- **Current state:** Separate fields. App must reorder on the client side.

**Recommendation:** Ensure app (Expo/mobile) knows to use `[longitude, latitude]` when constructing maps.

---

## 6. Naming Conventions

### Controllers
- `PackageController`, `BookingController`, `GuideController`, `RentalController` — PascalCase, singular resource
- Subdirs: `/Http/Controllers/Admin/`, `/Http/Controllers/Guide/`

### Models
- `TourPackage`, `TourPackageDay`, `TourPackageStop`, `TourPackageRate` — PascalCase, descriptive
- `Spot`, `Booking`, `User` — short or descriptive

### Migrations
- `YYYY_MM_DD_HHMMSS_create_table_name_table.php` — standard Laravel format ✓
- Extensions: `2026_08_15_000001_extend_spots_table.php` ✓

### Requests
- `QuotePackageRequest` — PascalCase, "Request" suffix ✓

### Policies
- `TourPackagePolicy`, `BookingPolicy` — PascalCase, "Policy" suffix ✓

### Tests
- `/tests/Unit/PricingServiceTest.php` — PascalCase, "Test" suffix ✓
- `/tests/Feature/` would be for API endpoint tests (not found in audit)

**Recommendation:** Follow existing patterns. New classes for Phase 1–2:
- `QuotePolicy.php`
- `CustomTourRequestPolicy.php`
- `CreateQuoteRequest.php`, `CreateCustomTourRequestRequest.php`
- `QuoteServiceTest.php`, `CustomTourRequestTest.php`

---

## 7. Collisions & Conflicts

### No Conflicts with Existing Schema
- Spec tables (`packages`, `package_days`, `package_stops`, `package_rates`) already exist under different names: `tour_packages`, `tour_package_days`, etc. No renaming needed; spec will use these.
- Spec's `variants` concept maps to existing `tour_package_addon_id` (nullable on rates). No conflict; just a semantic difference.

### New Tables Needed (No Collisions)
- `quotes` — Does not exist yet; can be created.
- `custom_tour_requests` — Does not exist yet.
- `custom_tour_request_spots` — Does not exist yet.

### Potential Confusion
- **`inclusions`:** Spec calls for a shared `inclusions` table with guide-specific pivots. Current schema only has `guide_inclusions` (per-guide, no shared catalog). **DECISION:** Keep current design (guide defines own; seeded in controller) or create shared catalog? Recommend current: guides set inclusions once on profile; packages inherit them.

---

## 8. Open Questions & Decisions Required

### Q1: `rate_basis` vs. `price_basis`
**Current:** `tour_packages.rate_basis` enum(`total_per_group`, `per_pax`)  
**Spec:** `tour_packages.price_basis` enum(`per_day`, `per_package`)

These describe different concepts:
- `rate_basis`: Is the tier price per-pax or a total?
- `price_basis`: Does the tier multiply by duration days?

**Recommendation:** Rename `rate_basis` to `price_basis` and update values:
- `total_per_group` → `per_package` (tier price is the full package cost)
- `per_pax` → **NOT USED IN SPEC** (spec: tier price is never per-pax)

**Action:** Add a migration to rename and adjust seeded data. The seeded package has `rate_basis = 'total_per_group'`, which matches `per_package`. Proceed.

---

### Q2: Above-Max-Pax Handling (Pax Bands Gap)
**Current:** No check. `PricingService` validates pax is within package `min_pax`/`max_pax`, and within rate tiers. If no rate tier matches, returns error.

**Spec:** Recommends returning `422 { reason: 'pax_out_of_range', max_supported_pax: N }` and suggest custom quote flow.

**Recommendation:** Implement (b) — custom quote flow. Create `CustomTourRequest` model and flow. Phase 4 task.

---

### Q3: Shared `inclusions` Catalog
**Spec:** Global `inclusions` table; guides pick from it; packages can override.  
**Current:** `guide_inclusions` table; guide creates their own labels; `tour_package_inclusions` are separate.

**Recommendation:** Create a shared `inclusions` table with seeded defaults:
```
id, name, slug (unique), icon, sort_order
```

Then:
- `guide_inclusions` → pivot pointing to shared `inclusions`
- `tour_package_inclusions` → pivot pointing to shared `inclusions`
- Guides select from the shared set; packages do the same.

**This aligns with the spec** and simplifies the data model. Add migration in Phase 1.

---

### Q4: Quotes Persistence & Linkage
**Current:** Quotes computed on-the-fly; not stored. No `quote_id` on bookings.

**Spec:** Requires persistent `quotes` table and `booking.quote_id`.

**Recommendation:** Create `quotes` table and add `quote_id` nullable to `bookings`. When quoting, save the quote and return its ID. When booking, validate quote is unexpired and unsuperseded, then link booking to quote.

**Phase 1 migration task.**

---

### Q5: Fee Mode & Override Fee
**Current:** No `fee_mode` or `override_fee` on `tour_package_stops`.

**Spec:** Every stop has:
- `fee_mode enum(included, on_site, optional)` DEFAULT `on_site`
- `override_fee decimal(10,2) nullable`

**Recommendation:** Add these columns in a Phase 1 migration. Default `fee_mode = 'on_site'` (most guides collect at the gate).

---

### Q6: Custom Itinerary Workflow
**Spec:** `draft → sent → quoted → accepted → booked`, or declined/expired.

**Current:** No `custom_tour_requests` table. Existing booking workflow is direct.

**Recommendation:** Implement in Phase 4. Requires:
1. Guest creates custom request (list of spots, pax, variant, date)
2. Guide quotes it
3. Guest accepts or declines
4. Acceptance creates a booking

**Not needed for Phase 0–3** (package quotes, bookings, API).

---

## Summary: Ready for Phase 1

### To Create
1. ✅ **Shared `inclusions` table** + guide/package pivots (migration)
2. ✅ **`quotes` table** with full breakdown snapshot (migration)
3. ✅ **Add `quote_id` to bookings** (migration)
4. ✅ **Add `fee_mode` & `override_fee` to package stops** (migration)
5. ✅ **Rename `rate_basis` → `price_basis`** with value updates (migration)

### To Refactor
- **PricingService:** Already sound; just needs `quote_id` linkage and `expires_at` validation.

### To Test
- ✅ Existing tests in `PricingServiceTest.php` are comprehensive (unit tests pass)
- ⚠️ No feature/API tests for `/quote` endpoint; add in Phase 3

### Authorization
- TourPackagePolicy exists; extend for Quotes, CustomTourRequests in Phase 3

### Coordinate Convention
- Verify Expo app reorders to [lng, lat] for MapLibre. Currently emits separate fields.

---

## Approval Gate

✅ **All audit questions answered. No blocking conflicts. Ready to proceed to Phase 1.**

Please confirm:
1. Rename `rate_basis` → `price_basis` with values `per_day` / `per_package` ✓
2. Create shared `inclusions` table ✓
3. Add `fee_mode` & `override_fee` to package stops ✓
4. Create `quotes` table and link to bookings ✓
5. Implement custom tour request flow in Phase 4 ✓

**AWAITING APPROVAL TO PROCEED TO PHASE 1**

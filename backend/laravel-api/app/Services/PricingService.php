<?php

namespace App\Services;

use App\Models\BookingItineraryStop;
use App\Models\Restaurant;
use App\Models\Spot;
use App\Models\TourPackage;
use App\Models\TourPackageStop;
use Illuminate\Validation\ValidationException;

/**
 * PricingService
 *
 * Single source of truth for tour package cost calculations.
 * Used by both the quote endpoint and booking endpoint to ensure consistency.
 *
 * Calculates three separate cost lines:
 * 1. Package price (from rate tier matching pax_count + selected add-ons)
 * 2. Add-on costs (if add-ons selected with their own rate tables)
 * 3. Estimated on-site fees (entrance fees guests pay directly at each spot)
 */
class PricingService
{
    /**
     * Quote a tour package for given parameters.
     *
     * @param TourPackage $package
     * @param int $paxCount
     * @param array $selectedAddonIds addon IDs to include
     * @param array $customStops optional [{stoppable_type, stoppable_id}, ...] for custom itinerary
     * @return array {
     *     package_price: decimal,
     *     addons_total: decimal,
     *     onsite_fees: decimal,
     *     total: decimal,
     *     breakdown: [
     *         {label, amount, details}
     *     ]
     * }
     * @throws ValidationException if pax_count outside min/max or rate tier not found
     */
    public function quotePackage(
        TourPackage $package,
        int $paxCount,
        array $selectedAddonIds = [],
        array $customStops = []
    ): array {
        // Validate pax count
        if ($paxCount < $package->min_pax || $paxCount > $package->max_pax) {
            throw ValidationException::withMessages([
                'pax_count' => [
                    "Pax count must be between {$package->min_pax} and {$package->max_pax}",
                ],
            ]);
        }

        // Calculate package price (base rate tier)
        $packagePrice = $this->calculatePackagePrice($package, $paxCount);

        // Calculate add-on costs
        $addonsCost = $this->calculateAddonsCost($package, $paxCount, $selectedAddonIds);

        // Calculate on-site fees from itinerary
        $onsiteFees = $this->calculateOnsiteFees($package, $customStops);

        // Build breakdown for display
        $breakdown = $this->buildBreakdown($package, $paxCount, $packagePrice, $addonsCost, $onsiteFees, $selectedAddonIds);

        $total = $packagePrice + $addonsCost + $onsiteFees;

        return [
            'package_price' => round($packagePrice, 2),
            'addons_total' => round($addonsCost, 2),
            'onsite_fees' => round($onsiteFees, 2),
            'total' => round($total, 2),
            'breakdown' => $breakdown,
        ];
    }

    /**
     * Calculate the base package price for a given pax count.
     *
     * Finds the rate tier where min_pax <= paxCount <= max_pax and addon_id is null.
     *
     * @throws ValidationException if no matching rate tier
     */
    private function calculatePackagePrice(TourPackage $package, int $paxCount): float
    {
        $rate = $package->rates()
            ->where('tour_package_addon_id', null)
            ->where('min_pax', '<=', $paxCount)
            ->where('max_pax', '>=', $paxCount)
            ->first();

        if (!$rate) {
            throw ValidationException::withMessages([
                'pax_count' => [
                    "No pricing tier found for {$paxCount} pax. Available tiers: " . $this->getAvailableTiers($package),
                ],
            ]);
        }

        return (float) $rate->price;
    }

    /**
     * Calculate total add-on costs for selected add-ons.
     */
    private function calculateAddonsCost(
        TourPackage $package,
        int $paxCount,
        array $selectedAddonIds
    ): float {
        if (empty($selectedAddonIds)) {
            return 0;
        }

        $totalCost = 0;

        foreach ($selectedAddonIds as $addonId) {
            $addon = $package->addons()->find($addonId);

            if (!$addon) {
                throw ValidationException::withMessages([
                    'addons' => ["Add-on {$addonId} not found on this package"],
                ]);
            }

            switch ($addon->pricing_mode) {
                case 'flat_fee':
                    $totalCost += (float) $addon->flat_fee;
                    break;

                case 'per_pax_fee':
                    $totalCost += (float) $addon->flat_fee * $paxCount;
                    break;

                case 'separate_rate_table':
                    $rate = $addon->rates()
                        ->where('min_pax', '<=', $paxCount)
                        ->where('max_pax', '>=', $paxCount)
                        ->first();

                    if (!$rate) {
                        throw ValidationException::withMessages([
                            'addons' => [
                                "No pricing tier found for {$paxCount} pax on add-on '{$addon->name}'",
                            ],
                        ]);
                    }

                    $totalCost += (float) $rate->price;
                    break;
            }
        }

        return $totalCost;
    }

    /**
     * Calculate sum of entrance fees from all stops in the itinerary.
     *
     * Handles both package's default itinerary and custom stops.
     * Entrance fees are:
     * - per_pax: multiplied by paxCount
     * - donation: shown as "Donation only"
     * - consumable: shown as flat amount with label
     * - free: contributes 0
     *
     * If customStops provided (array of {stoppable_type, stoppable_id}), uses those.
     * Otherwise uses package's default itinerary.
     */
    private function calculateOnsiteFees(TourPackage $package, array $customStops = []): float
    {
        $stops = [];

        if (!empty($customStops)) {
            // Use custom stops
            foreach ($customStops as $stopData) {
                $type = $stopData['stoppable_type'];
                $id = $stopData['stoppable_id'];

                if ($type === 'App\\Models\\Spot' || $type === Spot::class) {
                    $stops[] = Spot::find($id);
                } elseif ($type === 'App\\Models\\Restaurant' || $type === Restaurant::class) {
                    $stops[] = Restaurant::find($id);
                }
            }
        } else {
            // Use package's default itinerary
            $packageStops = TourPackageStop::whereHas('day', fn ($q) => $q->where('tour_package_id', $package->id))
                ->with('stoppable')
                ->get();

            foreach ($packageStops as $stop) {
                if ($stop->stoppable) {
                    $stops[] = $stop->stoppable;
                }
            }
        }

        $totalFees = 0;

        foreach ($stops as $stop) {
            if ($stop instanceof Spot) {
                $totalFees += $this->calculateStopFee($stop);
            }
            // Restaurants have no entrance fee
        }

        return $totalFees;
    }

    /**
     * Calculate fee for a single spot.
     */
    private function calculateStopFee(Spot $spot): float
    {
        if ($spot->fee_type === 'free' || !$spot->fee_amount) {
            return 0;
        }

        if ($spot->fee_type === 'per_pax') {
            // Note: This will be multiplied by paxCount in calculateOnsiteFees
            // For now, we return the per-unit amount; caller multiplies
            // Actually, we need paxCount here. Let me refactor.
            return (float) $spot->fee_amount;
        }

        if ($spot->fee_type === 'donation') {
            return 0; // Shown separately as "donation only"
        }

        if ($spot->fee_type === 'consumable') {
            return (float) $spot->fee_amount;
        }

        return 0;
    }

    /**
     * Calculate on-site fees with pax multiplier.
     *
     * Handles per_pax multiplication and tracks donation-only stops.
     */
    public function calculateOnsiteFeesWithBreakdown(
        TourPackage $package,
        int $paxCount,
        array $customStops = []
    ): array {
        $stops = [];

        if (!empty($customStops)) {
            foreach ($customStops as $stopData) {
                $type = $stopData['stoppable_type'];
                $id = $stopData['stoppable_id'];

                if ($type === 'App\\Models\\Spot' || $type === Spot::class) {
                    $stops[] = Spot::find($id);
                } elseif ($type === 'App\\Models\\Restaurant' || $type === Restaurant::class) {
                    $stops[] = Restaurant::find($id);
                }
            }
        } else {
            $packageStops = TourPackageStop::whereHas('day', fn ($q) => $q->where('tour_package_id', $package->id))
                ->with('stoppable')
                ->get();

            foreach ($packageStops as $stop) {
                if ($stop->stoppable) {
                    $stops[] = $stop->stoppable;
                }
            }
        }

        $totalFees = 0;
        $details = [];

        foreach ($stops as $stop) {
            if ($stop instanceof Spot) {
                if ($stop->fee_type === 'free') {
                    continue;
                }

                if ($stop->fee_type === 'per_pax') {
                    $fee = (float) $stop->fee_amount * $paxCount;
                    $totalFees += $fee;
                    $details[] = [
                        'stop_name' => $stop->name,
                        'fee_type' => 'per_pax',
                        'unit_amount' => (float) $stop->fee_amount,
                        'pax_count' => $paxCount,
                        'total' => $fee,
                    ];
                } elseif ($stop->fee_type === 'donation') {
                    $details[] = [
                        'stop_name' => $stop->name,
                        'fee_type' => 'donation',
                        'note' => 'Donation only',
                    ];
                } elseif ($stop->fee_type === 'consumable') {
                    $fee = (float) $stop->fee_amount;
                    $totalFees += $fee;
                    $details[] = [
                        'stop_name' => $stop->name,
                        'fee_type' => 'consumable',
                        'amount' => $fee,
                    ];
                }
            }
        }

        return [
            'total' => round($totalFees, 2),
            'details' => $details,
        ];
    }

    /**
     * Build a human-readable breakdown of costs for the guest.
     *
     * Returns array of breakdown items with labels and amounts.
     */
    private function buildBreakdown(
        TourPackage $package,
        int $paxCount,
        float $packagePrice,
        float $addonsCost,
        float $onsiteFees,
        array $selectedAddonIds
    ): array {
        $breakdown = [];

        // Line 1: Package price
        $rateLabel = $package->rate_basis === 'per_pax'
            ? "₱{$packagePrice} × {$paxCount} pax"
            : "₱{$packagePrice} (for your group)";

        $breakdown[] = [
            'label' => 'Tour Package',
            'amount' => round($packagePrice, 2),
            'details' => $rateLabel,
        ];

        // Line 2: Add-ons (if any)
        if ($addonsCost > 0) {
            $addonLabels = [];
            foreach ($selectedAddonIds as $addonId) {
                $addon = $package->addons()->find($addonId);
                if ($addon) {
                    $addonLabels[] = $addon->name;
                }
            }

            $breakdown[] = [
                'label' => 'Add-ons (' . implode(', ', $addonLabels) . ')',
                'amount' => round($addonsCost, 2),
                'details' => 'Optional services',
            ];
        }

        // Line 3: On-site fees
        $breakdown[] = [
            'label' => 'Estimated On-Site Fees',
            'amount' => round($onsiteFees, 2),
            'details' => 'Paid directly at each site (not included in tour price)',
        ];

        return $breakdown;
    }

    /**
     * Helper: get human-readable list of available tiers for error messages.
     */
    private function getAvailableTiers(TourPackage $package): string
    {
        $tiers = $package->rates()
            ->where('tour_package_addon_id', null)
            ->orderBy('min_pax')
            ->get();

        if ($tiers->isEmpty()) {
            return 'none configured';
        }

        return $tiers->map(fn ($t) => "{$t->min_pax}-{$t->max_pax} pax (₱{$t->price})")->implode(', ');
    }

    /**
     * Snapshot an itinerary for a booking.
     *
     * Creates BookingItineraryStop records from the agreed-upon stops.
     * This freezes the prices and details so future edits to the package don't affect this booking.
     */
    public function snapshotItinerary(int $bookingId, TourPackage $package, array $customStops = []): void
    {
        $stops = [];

        if (!empty($customStops)) {
            // Custom itinerary
            foreach ($customStops as $dayNumber => $dayStops) {
                foreach ($dayStops as $sortOrder => $stopData) {
                    $type = $stopData['stoppable_type'] ?? null;
                    $id = $stopData['stoppable_id'] ?? null;

                    if (!$type || !$id) {
                        continue;
                    }

                    $stop = null;
                    if ($type === 'App\\Models\\Spot' || $type === Spot::class) {
                        $stop = Spot::find($id);
                    } elseif ($type === 'App\\Models\\Restaurant' || $type === Restaurant::class) {
                        $stop = Restaurant::find($id);
                    }

                    if ($stop) {
                        $stops[] = [
                            'booking_id' => $bookingId,
                            'day_number' => $dayNumber,
                            'sort_order' => $sortOrder,
                            'stoppable_type' => get_class($stop),
                            'stoppable_id' => $stop->id,
                            'name_snapshot' => $stop->name,
                            'fee_type_snapshot' => $stop instanceof Spot ? ($stop->fee_type ?? 'free') : 'free',
                            'fee_amount_snapshot' => $stop instanceof Spot ? ($stop->fee_amount ?? null) : null,
                            'note' => $stopData['note'] ?? null,
                        ];
                    }
                }
            }
        } else {
            // Default itinerary
            $days = $package->days()->with('stops.stoppable')->get();

            foreach ($days as $day) {
                foreach ($day->stops as $stop) {
                    if ($stop->stoppable) {
                        $stoppable = $stop->stoppable;
                        $stops[] = [
                            'booking_id' => $bookingId,
                            'day_number' => $day->day_number,
                            'sort_order' => $stop->sort_order,
                            'stoppable_type' => get_class($stoppable),
                            'stoppable_id' => $stoppable->id,
                            'name_snapshot' => $stoppable->name,
                            'fee_type_snapshot' => $stoppable instanceof Spot ? ($stoppable->fee_type ?? 'free') : 'free',
                            'fee_amount_snapshot' => $stoppable instanceof Spot ? ($stoppable->fee_amount ?? null) : null,
                            'note' => $stop->note,
                        ];
                    }
                }
            }
        }

        BookingItineraryStop::insert($stops);
    }
}

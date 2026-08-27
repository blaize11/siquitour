<?php

namespace App\Services;

use App\Models\GuidePaxPrice;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class GuidePricingService
{
    /**
     * Minimum PAX quantity
     */
    public const MIN_PAX = 1;

    /**
     * Maximum PAX quantity
     */
    public const MAX_PAX = 20;

    /**
     * Add or update a pax price for a guide
     */
    public static function setPaxPrice(User $guide, int $paxQuantity, float $price): GuidePaxPrice
    {
        self::validatePaxQuantity($paxQuantity);
        self::validatePrice($price);

        return GuidePaxPrice::updateOrCreate(
            [
                'tour_guide_id' => $guide->id,
                'pax_quantity' => $paxQuantity,
            ],
            [
                'price' => $price,
            ]
        );
    }

    /**
     * Get price for a specific guide and pax quantity
     */
    public static function getPriceForPax(User $guide, int $paxQuantity): ?GuidePaxPrice
    {
        return GuidePaxPrice::where('tour_guide_id', $guide->id)
            ->where('pax_quantity', $paxQuantity)
            ->first();
    }

    /**
     * Get all prices for a guide
     */
    public static function getAllPrices(User $guide): Collection
    {
        return GuidePaxPrice::where('tour_guide_id', $guide->id)
            ->orderBy('pax_quantity')
            ->get();
    }

    /**
     * Delete a pax price
     */
    public static function deletePaxPrice(User $guide, int $paxQuantity): bool
    {
        return GuidePaxPrice::where('tour_guide_id', $guide->id)
            ->where('pax_quantity', $paxQuantity)
            ->delete() > 0;
    }

    /**
     * Validate pax quantity
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public static function validatePaxQuantity(int $paxQuantity): void
    {
        if ($paxQuantity < self::MIN_PAX || $paxQuantity > self::MAX_PAX) {
            throw new \Illuminate\Validation\ValidationException(
                \Illuminate\Validation\Validator::make([], [])->errors()
                    ->add('pax_quantity', "Pax quantity must be between " . self::MIN_PAX . " and " . self::MAX_PAX . ".")
            );
        }
    }

    /**
     * Validate price
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public static function validatePrice(float $price): void
    {
        if ($price <= 0) {
            throw new \Illuminate\Validation\ValidationException(
                \Illuminate\Validation\Validator::make([], [])->errors()
                    ->add('price', 'Price must be greater than 0.')
            );
        }

        if ($price > 999999.99) {
            throw new \Illuminate\Validation\ValidationException(
                \Illuminate\Validation\Validator::make([], [])->errors()
                    ->add('price', 'Price is too high.')
            );
        }
    }

    /**
     * Check if guide has pricing configured
     */
    public static function hasPricing(User $guide): bool
    {
        return GuidePaxPrice::where('tour_guide_id', $guide->id)->exists();
    }

    /**
     * Get available pax options for a guide
     */
    public static function getAvailablePaxOptions(User $guide): array
    {
        return GuidePaxPrice::where('tour_guide_id', $guide->id)
            ->orderBy('pax_quantity')
            ->get()
            ->map(fn($price) => [
                'pax' => $price->pax_quantity,
                'price' => $price->price,
                'display' => "{$price->pax_quantity} pax - ₱" . number_format($price->price, 2),
            ])
            ->toArray();
    }
}

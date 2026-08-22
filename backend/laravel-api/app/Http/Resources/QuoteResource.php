<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * QuoteResource
 *
 * Serializes a Quote model for API responses.
 * Includes all pricing details, breakdown, and expiry information.
 */
class QuoteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'quote_number' => "QT-{$this->id}",  // Simple quote reference

            // What is being quoted
            'quotable' => [
                'type' => class_basename($this->quotable_type),
                'id' => $this->quotable_id,
            ],

            // Quote parameters
            'pax' => $this->pax,
            'variant' => $this->variant,
            'price_basis' => $this->price_basis,
            'duration_days' => $this->duration_days,
            'currency' => $this->currency,

            // Pricing breakdown
            'pricing' => [
                'tier_price' => (float) $this->tier_price,
                'included_fees_total' => (float) $this->included_fees_total,
                'addons_total' => (float) $this->addons_total,
                'total' => (float) $this->total,
            ],

            // Itemized breakdown for display
            'breakdown' => $this->breakdown,

            // Validity status
            'expires_at' => $this->expires_at->toIso8601String(),
            'is_expired' => $this->isExpired(),
            'is_superseded' => $this->isSuperseded(),
            'is_valid' => $this->isValid(),

            // Supersession tracking
            'superseded_by_quote_id' => $this->superseded_by_quote_id,

            // Metadata
            'issued_by_user_id' => $this->issued_by_user_id,
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * Quote
 *
 * Immutable snapshot of pricing for a specific booking request.
 * Quotes are created from either a TourPackage or a CustomTourRequest.
 *
 * A quote contains:
 * - The exact parameters (pax, variant, date)
 * - The full cost breakdown (base, inclusions, fees, addons, total)
 * - An expiry time (after which it is no longer valid)
 * - A link to any newer quote that supersedes it
 *
 * Once a booking is created, it references the quote that locked in the price.
 * This ensures the booking price never changes if the package is updated later.
 */
#[Fillable([
    'quotable_type', 'quotable_id',
    'pax', 'variant', 'price_basis', 'duration_days',
    'tier_price', 'included_fees_total', 'addons_total', 'total',
    'breakdown', 'currency', 'expires_at', 'superseded_by_quote_id', 'issued_by_user_id'
])]
class Quote extends Model
{
    protected function casts(): array
    {
        return [
            'pax' => 'integer',
            'duration_days' => 'integer',
            'tier_price' => 'decimal:2',
            'included_fees_total' => 'decimal:2',
            'addons_total' => 'decimal:2',
            'total' => 'decimal:2',
            'breakdown' => 'array',
            'expires_at' => 'datetime',
        ];
    }

    /**
     * Polymorphic: the thing being quoted (Package or CustomTourRequest)
     */
    public function quotable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Who issued this quote (NULL if auto-computed)
     */
    public function issuedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by_user_id');
    }

    /**
     * Any quote that supersedes this one
     */
    public function supersededBy(): BelongsTo
    {
        return $this->belongsTo(Quote::class, 'superseded_by_quote_id');
    }

    /**
     * Quotes this one superseded
     */
    public function supersedes(): HasMany
    {
        return $this->hasMany(Quote::class, 'superseded_by_quote_id');
    }

    /**
     * Check if this quote is still valid
     */
    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    /**
     * Check if this quote has been superseded
     */
    public function isSuperseded(): bool
    {
        return !is_null($this->superseded_by_quote_id);
    }

    /**
     * A quote is valid if it's not expired and not superseded
     */
    public function isValid(): bool
    {
        return !$this->isExpired() && !$this->isSuperseded();
    }
}

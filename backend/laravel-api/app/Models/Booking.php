<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphTo;

#[Fillable(['guest_id', 'bookable_type', 'bookable_id', 'tour_package_id', 'itinerary_mode', 'pax_count', 'start_date', 'end_date', 'status', 'total_price', 'commission_amount', 'quoted_package_price', 'quoted_addons_total', 'estimated_onsite_fees', 'custom_stops_added'])]
class Booking extends Model
{
    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'total_price' => 'decimal:2',
            'commission_amount' => 'decimal:2',
            'quoted_package_price' => 'decimal:2',
            'quoted_addons_total' => 'decimal:2',
            'estimated_onsite_fees' => 'decimal:2',
            'custom_stops_added' => 'boolean',
        ];
    }

    public function guest(): BelongsTo
    {
        return $this->belongsTo(User::class, 'guest_id');
    }

    public function bookable(): MorphTo
    {
        return $this->morphTo();
    }

    public function tourPackage(): BelongsTo
    {
        return $this->belongsTo(TourPackage::class);
    }

    public function itineraryStops(): HasMany
    {
        return $this->hasMany(BookingItineraryStop::class)->orderBy('day_number')->orderBy('sort_order');
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    public function review(): HasOne
    {
        return $this->hasOne(Review::class);
    }
}

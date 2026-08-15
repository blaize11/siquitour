<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

#[Fillable(['renter_id', 'type', 'other_label', 'title', 'description', 'price_per_day', 'latitude', 'longitude', 'address', 'status'])]
class Rental extends Model
{
    protected function casts(): array
    {
        return [
            'price_per_day' => 'decimal:2',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
        ];
    }

    public function renter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'renter_id');
    }

    public function images(): HasMany
    {
        return $this->hasMany(RentalImage::class)->orderBy('sort_order');
    }

    public function bookings(): MorphMany
    {
        return $this->morphMany(Booking::class, 'bookable');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }
}

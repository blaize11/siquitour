<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['tour_guide_id', 'title', 'description', 'duration_days', 'cover_image_url', 'price_basis', 'min_pax', 'max_pax', 'is_customizable', 'status', 'sort_order'])]
class TourPackage extends Model
{
    protected function casts(): array
    {
        return [
            'is_customizable' => 'boolean',
        ];
    }

    public function guide(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tour_guide_id');
    }

    public function days(): HasMany
    {
        return $this->hasMany(TourPackageDay::class)->orderBy('day_number');
    }

    public function inclusions(): HasMany
    {
        return $this->hasMany(TourPackageInclusion::class)->orderBy('sort_order');
    }

    public function exclusions(): HasMany
    {
        return $this->hasMany(TourPackageExclusion::class)->orderBy('sort_order');
    }

    public function addons(): HasMany
    {
        return $this->hasMany(TourPackageAddon::class)->orderBy('sort_order');
    }

    public function rates(): HasMany
    {
        return $this->hasMany(TourPackageRate::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Package-specific inclusion overrides (maps to shared Inclusion catalog)
     */
    public function inclusionOverrides(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Inclusion::class, 'package_inclusions')
                    ->withPivot('sort_order')
                    ->withTimestamps();
    }

    /**
     * Get inclusions for this package: either overrides (if set) or guide's defaults
     */
    public function getInclusionsAttribute()
    {
        $overrides = $this->inclusionOverrides()->get();
        if ($overrides->isNotEmpty()) {
            return $overrides;
        }
        return $this->guide->tourGuideProfile?->inclusions() ?? collect();
    }
}

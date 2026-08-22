<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Inclusion
 *
 * Shared catalog of services/amenities that guides can offer.
 * Examples: Transportation, Gas, Tour Guide, Driver, Photographer, Videographer.
 *
 * Guides select which inclusions they provide (via guide_inclusions_pivot).
 * Packages can override or customize the inclusion list (via tour_package_inclusions_pivot).
 */
#[Fillable(['name', 'slug', 'icon', 'sort_order'])]
class Inclusion extends Model
{
    public function guideProfiles(): BelongsToMany
    {
        return $this->belongsToMany(TourGuideProfile::class, 'guide_inclusion_catalog')
                    ->withPivot('notes')
                    ->withTimestamps();
    }

    public function packages(): BelongsToMany
    {
        return $this->belongsToMany(TourPackage::class, 'package_inclusions')
                    ->withPivot('sort_order')
                    ->withTimestamps();
    }
}

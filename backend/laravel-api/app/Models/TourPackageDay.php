<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['tour_package_id', 'day_number', 'title', 'notes'])]
class TourPackageDay extends Model
{
    public function package(): BelongsTo
    {
        return $this->belongsTo(TourPackage::class, 'tour_package_id');
    }

    public function stops(): HasMany
    {
        return $this->hasMany(TourPackageStop::class)->orderBy('sort_order');
    }
}

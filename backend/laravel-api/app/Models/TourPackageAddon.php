<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['tour_package_id', 'name', 'description', 'pricing_mode', 'flat_fee', 'sort_order'])]
class TourPackageAddon extends Model
{
    protected function casts(): array
    {
        return [
            'flat_fee' => 'decimal:2',
        ];
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(TourPackage::class, 'tour_package_id');
    }

    public function rates(): HasMany
    {
        return $this->hasMany(TourPackageRate::class, 'tour_package_addon_id');
    }
}

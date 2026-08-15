<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['tour_package_id', 'tour_package_addon_id', 'min_pax', 'max_pax', 'price'])]
class TourPackageRate extends Model
{
    public const TIMESTAMPS = false;

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
        ];
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(TourPackage::class, 'tour_package_id');
    }

    public function addon(): BelongsTo
    {
        return $this->belongsTo(TourPackageAddon::class, 'tour_package_addon_id');
    }
}

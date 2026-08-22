<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

#[Fillable(['tour_package_day_id', 'stoppable_type', 'stoppable_id', 'sort_order', 'is_optional', 'note', 'fee_mode', 'override_fee'])]
class TourPackageStop extends Model
{
    protected function casts(): array
    {
        return [
            'is_optional' => 'boolean',
            'override_fee' => 'decimal:2',
        ];
    }

    public function day(): BelongsTo
    {
        return $this->belongsTo(TourPackageDay::class, 'tour_package_day_id');
    }

    public function stoppable(): MorphTo
    {
        return $this->morphTo();
    }
}

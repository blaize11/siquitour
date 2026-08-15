<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['spot_id', 'url', 'sort_order'])]
class SpotImage extends Model
{
    public function spot(): BelongsTo
    {
        return $this->belongsTo(Spot::class);
    }
}

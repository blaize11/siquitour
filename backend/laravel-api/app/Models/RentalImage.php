<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['rental_id', 'url', 'sort_order'])]
class RentalImage extends Model
{
    public function rental(): BelongsTo
    {
        return $this->belongsTo(Rental::class);
    }
}

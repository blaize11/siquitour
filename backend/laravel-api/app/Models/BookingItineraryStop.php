<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

#[Fillable(['booking_id', 'day_number', 'sort_order', 'stoppable_type', 'stoppable_id', 'name_snapshot', 'fee_type_snapshot', 'fee_amount_snapshot', 'note'])]
class BookingItineraryStop extends Model
{
    protected function casts(): array
    {
        return [
            'fee_amount_snapshot' => 'decimal:2',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function stoppable(): MorphTo
    {
        return $this->morphTo();
    }
}

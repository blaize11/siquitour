<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'bio', 'years_experience', 'rate_per_pax', 'is_verified'])]
class TourGuideProfile extends Model
{
    protected function casts(): array
    {
        return [
            'is_verified' => 'boolean',
            'rate_per_pax' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

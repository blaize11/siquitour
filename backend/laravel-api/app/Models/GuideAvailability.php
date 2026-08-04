<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['tour_guide_id', 'date', 'is_available', 'note'])]
class GuideAvailability extends Model
{
    protected $table = 'guide_availability';

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'is_available' => 'boolean',
        ];
    }

    public function tourGuide(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tour_guide_id');
    }
}

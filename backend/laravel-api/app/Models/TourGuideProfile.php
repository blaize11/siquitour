<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['user_id', 'bio', 'years_experience', 'rate_per_pax', 'is_verified', 'additional_services'])]
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

    /**
     * Legacy: guide-created inclusions (kept for backward compatibility)
     */
    public function inclusionsLegacy(): HasMany
    {
        return $this->hasMany(GuideInclusion::class)
            ->orderBy('sort_order')
            ->orderBy('id');
    }

    /**
     * Shared inclusions catalog entries selected by this guide
     */
    public function inclusions(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Inclusion::class, 'guide_inclusion_catalog')
                    ->withPivot('notes')
                    ->withTimestamps()
                    ->orderBy('sort_order');
    }
}

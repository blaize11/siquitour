<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['user_id', 'bio', 'years_experience', 'is_verified', 'additional_services'])]
class TourGuideProfile extends Model
{
    protected function casts(): array
    {
        return [
            'is_verified' => 'boolean',
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

    /**
     * Guide's verification document (driver's license)
     */
    public function verificationDocument(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->user->verificationDocument();
    }

    /**
     * Guide's per-pax pricing
     */
    public function paxPrices(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->user->paxPrices();
    }
}

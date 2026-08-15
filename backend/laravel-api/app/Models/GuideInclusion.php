<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['tour_guide_profile_id', 'label', 'sort_order'])]
class GuideInclusion extends Model
{
    public function guideProfile(): BelongsTo
    {
        return $this->belongsTo(TourGuideProfile::class, 'tour_guide_profile_id');
    }
}

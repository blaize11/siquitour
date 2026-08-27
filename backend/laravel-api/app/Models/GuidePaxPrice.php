<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['tour_guide_id', 'pax_quantity', 'price'])]
class GuidePaxPrice extends Model
{
    protected function casts(): array
    {
        return [
            'pax_quantity' => 'integer',
            'price' => 'decimal:2',
        ];
    }

    /**
     * The tour guide who set this price
     */
    public function guide(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tour_guide_id');
    }

    /**
     * Get price for a specific guide and pax quantity
     */
    public static function getPriceForGuide(int $guideId, int $paxQuantity): ?self
    {
        return self::where('tour_guide_id', $guideId)
            ->where('pax_quantity', $paxQuantity)
            ->first();
    }

    /**
     * Get all prices for a guide, ordered by pax quantity
     */
    public static function getPricesForGuide(int $guideId)
    {
        return self::where('tour_guide_id', $guideId)
            ->orderBy('pax_quantity')
            ->get();
    }
}

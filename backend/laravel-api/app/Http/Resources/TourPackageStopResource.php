<?php

namespace App\Http\Resources;

use App\Models\Restaurant;
use App\Models\Spot;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TourPackageStopResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $stoppable = $this->whenLoaded('stoppable');

        return [
            'id' => $this->id,
            'tour_package_day_id' => $this->tour_package_day_id,
            'sort_order' => $this->sort_order,
            'is_optional' => $this->is_optional,
            'note' => $this->note,
            'stoppable_type' => $this->stoppable_type,
            'stoppable_id' => $this->stoppable_id,

            // Inline the stoppable object (Spot or Restaurant)
            'stoppable' => $stoppable ? $this->getStoppableResource($stoppable) : null,

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    private function getStoppableResource($stoppable)
    {
        if ($stoppable instanceof Spot) {
            return new SpotResource($stoppable);
        } elseif ($stoppable instanceof Restaurant) {
            return new RestaurantResource($stoppable);
        }

        return null;
    }
}

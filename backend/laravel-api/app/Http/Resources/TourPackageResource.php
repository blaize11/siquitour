<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TourPackageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'duration_days' => $this->duration_days,
            'cover_image_url' => $this->cover_image_url,
            'rate_basis' => $this->rate_basis,
            'min_pax' => $this->min_pax,
            'max_pax' => $this->max_pax,
            'is_customizable' => $this->is_customizable,
            'status' => $this->status,
            'tour_guide_id' => $this->tour_guide_id,
            'guide' => new UserResource($this->whenLoaded('guide')),

            // Nested structures
            'days' => TourPackageDayResource::collection($this->whenLoaded('days')),
            'inclusions' => TourPackageInclusionResource::collection($this->whenLoaded('inclusions')),
            'exclusions' => TourPackageExclusionResource::collection($this->whenLoaded('exclusions')),
            'addons' => TourPackageAddonResource::collection($this->whenLoaded('addons')),
            'rates' => TourPackageRateResource::collection($this->whenLoaded('rates')),

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

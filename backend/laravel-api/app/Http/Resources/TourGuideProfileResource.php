<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TourGuideProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'bio' => $this->bio,
            'years_experience' => $this->years_experience,
            'is_verified' => $this->is_verified,
            'additional_services' => $this->additional_services,
            'inclusions' => GuideInclusionResource::collection($this->inclusions),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

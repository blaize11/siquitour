<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TourPackageAddonResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'pricing_mode' => $this->pricing_mode,
            'flat_fee' => $this->flat_fee,
            'sort_order' => $this->sort_order,
            'rates' => TourPackageRateResource::collection($this->whenLoaded('rates')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

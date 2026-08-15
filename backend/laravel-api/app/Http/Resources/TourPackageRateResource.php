<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TourPackageRateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tour_package_id' => $this->tour_package_id,
            'tour_package_addon_id' => $this->tour_package_addon_id,
            'min_pax' => $this->min_pax,
            'max_pax' => $this->max_pax,
            'price' => $this->price,
        ];
    }
}

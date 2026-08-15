<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class QuotePackageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Anyone can quote
    }

    public function rules(): array
    {
        return [
            'pax_count' => ['required', 'integer', 'min:1'],
            'addon_ids' => ['nullable', 'array'],
            'addon_ids.*' => ['integer', 'exists:tour_package_addons,id'],
            'custom_stops' => ['nullable', 'array'],
            'custom_stops.*.stoppable_type' => ['required', 'in:App\\Models\\Spot,App\\Models\\Restaurant'],
            'custom_stops.*.stoppable_id' => ['required', 'integer'],
        ];
    }
}

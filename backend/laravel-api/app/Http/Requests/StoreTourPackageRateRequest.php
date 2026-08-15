<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTourPackageRateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->isTourGuide();
    }

    public function rules(): array
    {
        return [
            'min_pax' => ['required', 'integer', 'min:1'],
            'max_pax' => ['required', 'integer', 'min:1', 'gte:min_pax'],
            'price' => ['required', 'numeric', 'min:0'],
            'tour_package_addon_id' => ['nullable', 'integer', 'exists:tour_package_addons,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'max_pax.gte' => 'Max pax must be >= min pax',
        ];
    }
}

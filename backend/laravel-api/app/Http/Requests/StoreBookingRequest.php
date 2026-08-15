<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->isGuest();
    }

    public function rules(): array
    {
        return [
            // Legacy: direct guide/rental booking
            'bookable_type' => [
                'nullable',
                Rule::requiredIf(fn () => !$this->filled('tour_package_id')),
                'in:guide,rental',
            ],
            'bookable_id' => [
                'nullable',
                Rule::requiredIf(fn () => !$this->filled('tour_package_id')),
                'integer',
            ],
            'pax_count' => [
                'nullable',
                Rule::requiredIf(fn () => $this->input('bookable_type') === 'guide' || $this->filled('tour_package_id')),
                'integer',
                'min:1',
            ],

            // Package-based booking
            'tour_package_id' => ['nullable', 'integer', 'exists:tour_packages,id'],
            'itinerary_mode' => ['nullable', 'in:default,custom'],
            'addon_ids' => ['nullable', 'array'],
            'addon_ids.*' => ['integer', 'exists:tour_package_addons,id'],
            'custom_stops' => ['nullable', 'array'],
            'custom_stops.*.day_number' => ['required', 'integer', 'min:1'],
            'custom_stops.*.sort_order' => ['required', 'integer', 'min:0'],
            'custom_stops.*.stoppable_type' => ['required', 'in:App\\Models\\Spot,App\\Models\\Restaurant'],
            'custom_stops.*.stoppable_id' => ['required', 'integer'],

            // Common
            'start_date' => ['required', 'date', 'after_or_equal:today'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
        ];
    }

    public function messages(): array
    {
        return [
            'bookable_type.required_if' => 'Either tour_package_id or bookable_type is required.',
            'pax_count.required_if' => 'pax_count is required for this booking type.',
        ];
    }
}

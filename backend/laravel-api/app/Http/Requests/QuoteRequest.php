<?php

namespace App\Http\Requests;

use App\Models\TourPackage;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * QuoteRequest
 *
 * Validates tour package quote requests from clients.
 * NOTE: Client cannot supply totals; only input parameters are accepted.
 * The server recomputes all prices to prevent tampering.
 */
class QuoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Any authenticated user can request a quote
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $package = TourPackage::findOrFail($this->route('package_id') ?? $this->input('package_id'));

        return [
            // Package being quoted
            'package_id' => [
                'required',
                'integer',
                Rule::exists('tour_packages', 'id'),
            ],

            // Number of participants
            'pax' => [
                'required',
                'integer',
                'min:' . $package->min_pax,
                'max:' . $package->max_pax,
            ],

            // Optional: selected add-ons (array of add-on IDs)
            'selected_addons' => [
                'nullable',
                'array',
            ],
            'selected_addons.*' => [
                'integer',
                Rule::exists('tour_package_addons', 'id')
                    ->where('tour_package_id', $package->id),
            ],

            // Optional: custom itinerary (not used for standard quote)
            'custom_stops' => [
                'nullable',
                'array',
            ],
            'custom_stops.*.stoppable_type' => [
                'required_with:custom_stops',
                Rule::in(['App\\Models\\Spot', 'App\\Models\\Restaurant']),
            ],
            'custom_stops.*.stoppable_id' => [
                'required_with:custom_stops',
                'integer',
            ],

            // Optional: override expiry hours (default 24)
            'expiry_hours' => [
                'nullable',
                'integer',
                'min:1',
                'max:720', // 30 days max
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'package_id.required' => 'Package ID is required',
            'package_id.exists' => 'Package not found',
            'pax.required' => 'Number of participants is required',
            'pax.min' => 'Minimum :min participants required',
            'pax.max' => 'Maximum :max participants allowed',
            'selected_addons.*.exists' => 'One or more selected add-ons are not valid for this package',
            'custom_stops.*.stoppable_type.in' => 'Invalid stop type',
            'expiry_hours.min' => 'Expiry must be at least 1 hour',
            'expiry_hours.max' => 'Expiry cannot exceed 30 days',
        ];
    }

    /**
     * Get the sanitized data for quote generation.
     * Explicitly excludes any price fields to prevent tampering.
     */
    public function getQuoteData(): array
    {
        return [
            'package_id' => $this->integer('package_id'),
            'pax' => $this->integer('pax'),
            'selected_addons' => $this->input('selected_addons', []),
            'custom_stops' => $this->input('custom_stops', []),
            'expiry_hours' => $this->integer('expiry_hours', 24),
        ];
    }
}

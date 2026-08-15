<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTourPackageAddonRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->isTourGuide();
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'pricing_mode' => ['required', 'in:flat_fee,per_pax_fee,separate_rate_table'],
            'flat_fee' => ['nullable', 'numeric', 'min:0'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $pricingMode = $this->input('pricing_mode');
            $flatFee = $this->input('flat_fee');

            if (in_array($pricingMode, ['flat_fee', 'per_pax_fee']) && !$flatFee) {
                $validator->errors()->add('flat_fee', 'flat_fee is required for flat_fee and per_pax_fee pricing modes');
            }

            if ($pricingMode === 'separate_rate_table' && $flatFee) {
                $validator->errors()->add('flat_fee', 'flat_fee must be null for separate_rate_table pricing mode');
            }
        });
    }
}

<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePackageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->isTourGuide();
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'duration_days' => ['required', 'integer', 'min:1', 'max:30'],
            'cover_image_url' => ['nullable', 'url'],
            'rate_basis' => ['required', 'in:total_per_group,per_pax'],
            'min_pax' => ['required', 'integer', 'min:1'],
            'max_pax' => ['required', 'integer', 'min:1', 'gte:min_pax'],
            'is_customizable' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'max_pax.gte' => 'Maximum pax must be greater than or equal to minimum pax.',
            'duration_days.max' => 'Duration cannot exceed 30 days.',
        ];
    }
}

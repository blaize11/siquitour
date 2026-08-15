<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTourPackageStopRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->isTourGuide();
    }

    public function rules(): array
    {
        return [
            'stoppable_type' => ['required', 'in:App\\Models\\Spot,App\\Models\\Restaurant'],
            'stoppable_id' => ['required', 'integer', 'exists:spots,id|exists:restaurants,id'],
            'sort_order' => ['required', 'integer', 'min:0'],
            'is_optional' => ['nullable', 'boolean'],
            'note' => ['nullable', 'string', 'max:255'],
        ];
    }
}

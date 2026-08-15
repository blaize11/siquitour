<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTourPackageInclusionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->isTourGuide();
    }

    public function rules(): array
    {
        return [
            'label' => ['required', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Spot;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SpotController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category' => ['required', Rule::in(['spot', 'restaurant'])],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:4000'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
        ]);

        $spot = Spot::create($validated + ['created_by' => $request->user()->id]);

        return response()->json($spot, 201);
    }

    public function update(Request $request, Spot $spot)
    {
        $validated = $request->validate([
            'category' => ['sometimes', Rule::in(['spot', 'restaurant'])],
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:4000'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
        ]);

        $spot->update($validated);

        return response()->json($spot);
    }

    public function destroy(Spot $spot)
    {
        $spot->delete();

        return response()->json(null, 204);
    }
}

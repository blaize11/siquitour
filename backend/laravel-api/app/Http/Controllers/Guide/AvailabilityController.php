<?php

namespace App\Http\Controllers\Guide;

use App\Http\Controllers\Controller;
use App\Models\GuideAvailability;
use Illuminate\Http\Request;

class AvailabilityController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            $request->user()->availability()->orderBy('date')->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => ['required', 'date'],
            'is_available' => ['required', 'boolean'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        $availability = GuideAvailability::updateOrCreate(
            ['tour_guide_id' => $request->user()->id, 'date' => $validated['date']],
            ['is_available' => $validated['is_available'], 'note' => $validated['note'] ?? null]
        );

        return response()->json($availability, 201);
    }

    public function destroy(Request $request, GuideAvailability $availability)
    {
        abort_unless($availability->tour_guide_id === $request->user()->id, 403);

        $availability->delete();

        return response()->json(null, 204);
    }
}

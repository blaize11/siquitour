<?php

namespace App\Http\Controllers;

use App\Http\Resources\SpotResource;
use App\Models\Spot;
use Illuminate\Http\Request;

class SpotController extends Controller
{
    public function index(Request $request)
    {
        $query = Spot::query()->where('is_active', true);

        // Filter by category
        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        // Filter by municipality
        if ($request->filled('municipality')) {
            $query->where('municipality', $request->input('municipality'));
        }

        // Search by name or description
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $spots = $query->with('images')->latest()->paginate(20);

        return SpotResource::collection($spots);
    }

    public function show(Spot $spot)
    {
        abort_unless($spot->is_active, 404);
        return new SpotResource($spot->load('images'));
    }
}

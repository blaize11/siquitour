<?php

namespace App\Http\Controllers;

use App\Models\Spot;
use Illuminate\Http\Request;

class SpotController extends Controller
{
    public function index(Request $request)
    {
        $query = Spot::query();

        // Filter by category (spot, restaurant, etc.)
        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        // Search by name or description
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $spots = $query->latest()->paginate(20);

        return response()->json($spots);
    }

    public function show(Spot $spot)
    {
        return response()->json($spot);
    }
}

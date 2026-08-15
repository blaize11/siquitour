<?php

namespace App\Http\Controllers;

use App\Http\Resources\RestaurantResource;
use App\Models\Restaurant;
use Illuminate\Http\Request;

class RestaurantController extends Controller
{
    public function index(Request $request)
    {
        $query = Restaurant::query()->where('is_active', true);

        // Filter by municipality
        if ($request->filled('municipality')) {
            $query->where('municipality', $request->input('municipality'));
        }

        // Filter by price range
        if ($request->filled('price_range')) {
            $query->where('price_range', $request->input('price_range'));
        }

        // Search by name or description
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $restaurants = $query->with('images')->latest()->paginate(20);

        return RestaurantResource::collection($restaurants);
    }

    public function show(Restaurant $restaurant)
    {
        abort_unless($restaurant->is_active, 404);
        return new RestaurantResource($restaurant->load('images'));
    }
}

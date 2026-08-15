<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\RestaurantResource;
use App\Models\Restaurant;
use App\Models\RestaurantImage;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;

/**
 * Admin restaurant catalog management.
 */
class RestaurantController extends Controller
{
    /**
     * POST /api/admin/restaurants
     * Create a new restaurant.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:restaurants'],
            'description' => ['nullable', 'string'],
            'municipality' => ['required', 'in:Lazi,San Juan,Larena,Maria,Siquijor,Enrique Villanueva,San Antonio'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'price_range' => ['nullable', 'in:budget,mid,premium'],
            'cuisine_tags' => ['nullable', 'array'],
            'cuisine_tags.*' => ['string', 'max:255'],
            'opening_time' => ['nullable', 'date_format:H:i'],
            'closing_time' => ['nullable', 'date_format:H:i'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $restaurant = Restaurant::create([
            ...$validated,
            'slug' => \Illuminate\Support\Str::slug($validated['name']),
        ]);

        return response()->json(new RestaurantResource($restaurant), 201);
    }

    /**
     * PUT /api/admin/restaurants/{id}
     * Update a restaurant.
     */
    public function update(Request $request, Restaurant $restaurant)
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255', Rule::unique('restaurants')->ignore($restaurant)],
            'description' => ['nullable', 'string'],
            'municipality' => ['sometimes', 'in:Lazi,San Juan,Larena,Maria,Siquijor,Enrique Villanueva,San Antonio'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'price_range' => ['nullable', 'in:budget,mid,premium'],
            'cuisine_tags' => ['nullable', 'array'],
            'cuisine_tags.*' => ['string', 'max:255'],
            'opening_time' => ['nullable', 'date_format:H:i'],
            'closing_time' => ['nullable', 'date_format:H:i'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = \Illuminate\Support\Str::slug($validated['name']);
        }

        $restaurant->update($validated);

        return new RestaurantResource($restaurant);
    }

    /**
     * DELETE /api/admin/restaurants/{id}
     * Delete a restaurant.
     */
    public function destroy(Restaurant $restaurant)
    {
        $restaurant->delete();

        return response()->noContent();
    }

    /**
     * POST /api/admin/restaurants/{restaurant}/images
     * Upload an image for a restaurant.
     */
    public function addImage(Request $request, Restaurant $restaurant)
    {
        $validated = $request->validate([
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        // Get the highest sort_order and increment
        $maxSortOrder = $restaurant->images()->max('sort_order') ?? -1;

        // Store image
        $path = $request->file('image')->store('restaurants', 'public');
        $url = Storage::disk('public')->url($path);

        $image = $restaurant->images()->create([
            'url' => $url,
            'sort_order' => $validated['sort_order'] ?? $maxSortOrder + 1,
        ]);

        return response()->json([
            'id' => $image->id,
            'url' => $image->url,
            'sort_order' => $image->sort_order,
        ], 201);
    }

    /**
     * PUT /api/admin/restaurants/{restaurant}/images/{image}
     * Update an image for a restaurant.
     */
    public function updateImage(Request $request, Restaurant $restaurant, RestaurantImage $image)
    {
        abort_unless($image->restaurant_id === $restaurant->id, 404);

        $validated = $request->validate([
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        // If new image is provided, delete old one and upload new
        if ($request->hasFile('image')) {
            // Delete old image from storage if it exists
            $oldPath = str_replace(Storage::disk('public')->url(''), '', $image->url);
            if (Storage::disk('public')->exists($oldPath)) {
                Storage::disk('public')->delete($oldPath);
            }

            // Store new image
            $path = $request->file('image')->store('restaurants', 'public');
            $validated['url'] = Storage::disk('public')->url($path);
        }

        $image->update($validated);

        return response()->json([
            'id' => $image->id,
            'url' => $image->url,
            'sort_order' => $image->sort_order,
        ]);
    }

    /**
     * DELETE /api/admin/restaurants/{restaurant}/images/{image}
     * Delete an image from a restaurant.
     */
    public function deleteImage(Restaurant $restaurant, RestaurantImage $image)
    {
        abort_unless($image->restaurant_id === $restaurant->id, 404);

        // Delete from storage
        $path = str_replace(Storage::disk('public')->url(''), '', $image->url);
        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }

        $image->delete();

        return response()->noContent();
    }
}

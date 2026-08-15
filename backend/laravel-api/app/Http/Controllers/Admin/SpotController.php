<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\SpotResource;
use App\Models\Spot;
use App\Models\SpotImage;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;

/**
 * Admin spot catalog management.
 */
class SpotController extends Controller
{
    /**
     * POST /api/admin/spots
     * Create a new spot.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:spots'],
            'description' => ['nullable', 'string'],
            'municipality' => ['required', 'in:Lazi,San Juan,Larena,Maria,Siquijor,Enrique Villanueva,San Antonio'],
            'category' => ['required', 'string', 'max:255'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'fee_type' => ['required', 'in:per_pax,donation,consumable,free'],
            'fee_amount' => ['nullable', 'numeric', 'min:0'],
            'typical_duration_minutes' => ['required', 'integer', 'min:1'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $spot = Spot::create([
            ...$validated,
            'slug' => \Illuminate\Support\Str::slug($validated['name']),
            'created_by' => $request->user()->id,
        ]);

        return response()->json(new SpotResource($spot), 201);
    }

    /**
     * PUT /api/admin/spots/{id}
     * Update a spot.
     */
    public function update(Request $request, Spot $spot)
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255', Rule::unique('spots')->ignore($spot)],
            'description' => ['nullable', 'string'],
            'municipality' => ['sometimes', 'in:Lazi,San Juan,Larena,Maria,Siquijor,Enrique Villanueva,San Antonio'],
            'category' => ['sometimes', 'string', 'max:255'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'fee_type' => ['sometimes', 'in:per_pax,donation,consumable,free'],
            'fee_amount' => ['nullable', 'numeric', 'min:0'],
            'typical_duration_minutes' => ['sometimes', 'integer', 'min:1'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = \Illuminate\Support\Str::slug($validated['name']);
        }

        $spot->update($validated);

        return new SpotResource($spot);
    }

    /**
     * DELETE /api/admin/spots/{id}
     * Delete a spot.
     */
    public function destroy(Spot $spot)
    {
        $spot->delete();

        return response()->noContent();
    }

    /**
     * POST /api/admin/spots/{spot}/images
     * Upload an image for a spot.
     */
    public function addImage(Request $request, Spot $spot)
    {
        $validated = $request->validate([
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        // Get the highest sort_order and increment
        $maxSortOrder = $spot->images()->max('sort_order') ?? -1;

        // Store image
        $path = $request->file('image')->store('spots', 'public');
        $url = Storage::disk('public')->url($path);

        $image = $spot->images()->create([
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
     * PUT /api/admin/spots/{spot}/images/{image}
     * Update an image for a spot.
     */
    public function updateImage(Request $request, Spot $spot, SpotImage $image)
    {
        abort_unless($image->spot_id === $spot->id, 404);

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
            $path = $request->file('image')->store('spots', 'public');
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
     * DELETE /api/admin/spots/{spot}/images/{image}
     * Delete an image from a spot.
     */
    public function deleteImage(Spot $spot, SpotImage $image)
    {
        abort_unless($image->spot_id === $spot->id, 404);

        // Delete from storage
        $path = str_replace(Storage::disk('public')->url(''), '', $image->url);
        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }

        $image->delete();

        return response()->noContent();
    }
}

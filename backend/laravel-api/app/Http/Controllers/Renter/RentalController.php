<?php

namespace App\Http\Controllers\Renter;

use App\Http\Controllers\Controller;
use App\Models\Rental;
use App\Models\RentalImage;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RentalController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            $request->user()->rentals()->with('images')->latest()->paginate(20)
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => ['required', Rule::in(['motorbike', 'car', 'tuktuk', 'van', 'bicycle', 'room'])],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:4000'],
            'price_per_day' => ['required', 'numeric', 'min:0'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'address' => ['nullable', 'string', 'max:255'],
        ]);

        $rental = $request->user()->rentals()->create($validated + ['status' => 'active']);

        return response()->json($rental, 201);
    }

    public function update(Request $request, Rental $rental)
    {
        $this->assertOwner($request, $rental);

        $validated = $request->validate([
            'type' => ['sometimes', Rule::in(['motorbike', 'car', 'tuktuk', 'van', 'bicycle', 'room'])],
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:4000'],
            'price_per_day' => ['sometimes', 'numeric', 'min:0'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'address' => ['nullable', 'string', 'max:255'],
            'status' => ['sometimes', Rule::in(['active', 'inactive'])],
        ]);

        $rental->update($validated);

        return response()->json($rental->fresh('images'));
    }

    public function destroy(Request $request, Rental $rental)
    {
        $this->assertOwner($request, $rental);

        $rental->delete();

        return response()->json(null, 204);
    }

    public function addImage(Request $request, Rental $rental)
    {
        $this->assertOwner($request, $rental);

        $validated = $request->validate([
            'url' => ['required', 'string', 'max:2048'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $image = $rental->images()->create([
            'url' => $validated['url'],
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        return response()->json($image, 201);
    }

    public function deleteImage(Request $request, Rental $rental, RentalImage $image)
    {
        $this->assertOwner($request, $rental);
        abort_unless($image->rental_id === $rental->id, 404);

        $image->delete();

        return response()->json(null, 204);
    }

    private function assertOwner(Request $request, Rental $rental): void
    {
        abort_unless($rental->renter_id === $request->user()->id, 403);
    }
}

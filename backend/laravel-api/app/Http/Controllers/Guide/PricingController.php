<?php

namespace App\Http\Controllers\Guide;

use App\Http\Controllers\Controller;
use App\Models\GuidePaxPrice;
use App\Services\GuidePricingService;
use Illuminate\Http\Request;

class PricingController extends Controller
{
    /**
     * List all pax prices for the guide
     */
    public function index(Request $request)
    {
        $user = $request->user();
        abort_unless($user->role === 'tour_guide', 403);

        $prices = GuidePricingService::getAllPrices($user);

        return response()->json([
            'pax_prices' => $prices->map(fn($price) => [
                'id' => $price->id,
                'pax_quantity' => $price->pax_quantity,
                'price' => $price->price,
            ]),
        ]);
    }

    /**
     * Add or update a pax price
     */
    public function store(Request $request)
    {
        $user = $request->user();
        abort_unless($user->role === 'tour_guide', 403);

        $validated = $request->validate([
            'pax_quantity' => ['required', 'integer', 'min:1', 'max:20'],
            'price' => ['required', 'numeric', 'min:0.01'],
        ]);

        try {
            $price = GuidePricingService::setPaxPrice(
                $user,
                $validated['pax_quantity'],
                (float) $validated['price']
            );

            return response()->json([
                'id' => $price->id,
                'pax_quantity' => $price->pax_quantity,
                'price' => $price->price,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        }
    }

    /**
     * Update a pax price
     */
    public function update(Request $request, GuidePaxPrice $price)
    {
        $user = $request->user();
        abort_unless($user->role === 'tour_guide', 403);

        // Ensure guide owns this price
        abort_unless($price->tour_guide_id === $user->id, 403);

        $validated = $request->validate([
            'price' => ['required', 'numeric', 'min:0.01'],
        ]);

        try {
            $price->update(['price' => (float) $validated['price']]);

            return response()->json([
                'id' => $price->id,
                'pax_quantity' => $price->pax_quantity,
                'price' => $price->price,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        }
    }

    /**
     * Delete a pax price
     */
    public function destroy(Request $request, GuidePaxPrice $price)
    {
        $user = $request->user();
        abort_unless($user->role === 'tour_guide', 403);

        // Ensure guide owns this price
        abort_unless($price->tour_guide_id === $user->id, 403);

        $price->delete();

        return response()->json(null, 204);
    }
}

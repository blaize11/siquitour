<?php

namespace App\Http\Controllers;

use App\Http\Requests\QuotePackageRequest;
use App\Http\Resources\TourPackageResource;
use App\Models\TourPackage;
use App\Services\PricingService;
use Illuminate\Http\Request;

/**
 * Public package browsing endpoints.
 * Guests can view packages, get quotes, but not modify them.
 */
class PackageController extends Controller
{
    public function __construct(private PricingService $pricingService)
    {
    }

    /**
     * GET /api/guides/{guide}/packages
     * List published packages for a specific guide.
     */
    public function guidePackages($guideId)
    {
        $packages = TourPackage::query()
            ->where('tour_guide_id', $guideId)
            ->where('status', 'published')
            ->with(['days.stops.stoppable', 'inclusions', 'exclusions', 'addons', 'rates'])
            ->orderBy('sort_order')
            ->get();

        return TourPackageResource::collection($packages);
    }

    /**
     * GET /api/packages/{id}
     * Get full package detail with all nested data.
     */
    public function show(TourPackage $package)
    {
        abort_unless($package->status === 'published', 404);

        $package->load(['guide', 'days.stops.stoppable', 'inclusions', 'exclusions', 'addons.rates', 'rates']);

        return new TourPackageResource($package);
    }

    /**
     * POST /api/packages/{id}/quote
     * Get a price quote for this package with given parameters.
     *
     * Returns the three-line cost breakdown without creating a booking.
     */
    public function quote(TourPackage $package, QuotePackageRequest $request)
    {
        abort_unless($package->status === 'published', 404);

        try {
            $quote = $this->pricingService->quotePackage(
                $package,
                $request->input('pax_count'),
                $request->input('addon_ids', []),
                $request->input('custom_stops', [])
            );

            return response()->json($quote);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }
}

<?php

namespace App\Http\Controllers\Guide;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePackageRequest;
use App\Http\Resources\TourPackageResource;
use App\Models\TourPackage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

/**
 * Guide self-service package management.
 * Guides can create, update, delete, and publish their own packages.
 */
class PackageController extends Controller
{
    /**
     * GET /api/guide/packages
     * List all packages (draft, published, archived) for the authenticated guide.
     */
    public function index(Request $request)
    {
        $guide = $request->user();

        $packages = TourPackage::query()
            ->where('tour_guide_id', $guide->id)
            ->with(['days.stops.stoppable', 'inclusions', 'exclusions', 'addons', 'rates'])
            ->orderBy('sort_order')
            ->paginate(20);

        return TourPackageResource::collection($packages);
    }

    /**
     * POST /api/guide/packages
     * Create a new package.
     */
    public function store(StorePackageRequest $request)
    {
        $guide = $request->user();

        $package = TourPackage::create([
            'tour_guide_id' => $guide->id,
            'title' => $request->input('title'),
            'description' => $request->input('description'),
            'duration_days' => $request->input('duration_days'),
            'cover_image_url' => $request->input('cover_image_url'),
            'rate_basis' => $request->input('rate_basis'),
            'min_pax' => $request->input('min_pax'),
            'max_pax' => $request->input('max_pax'),
            'is_customizable' => $request->boolean('is_customizable'),
            'status' => 'draft',
        ]);

        return response()->json(new TourPackageResource($package), 201);
    }

    /**
     * PUT /api/guide/packages/{id}
     * Update package details (not itinerary, rates, or add-ons).
     */
    public function update(TourPackage $package, StorePackageRequest $request)
    {
        Gate::authorize('update', $package);

        $package->update([
            'title' => $request->input('title'),
            'description' => $request->input('description'),
            'duration_days' => $request->input('duration_days'),
            'cover_image_url' => $request->input('cover_image_url'),
            'rate_basis' => $request->input('rate_basis'),
            'min_pax' => $request->input('min_pax'),
            'max_pax' => $request->input('max_pax'),
            'is_customizable' => $request->boolean('is_customizable'),
        ]);

        return new TourPackageResource($package);
    }

    /**
     * DELETE /api/guide/packages/{id}
     * Soft delete / archive a package.
     */
    public function destroy(TourPackage $package)
    {
        Gate::authorize('delete', $package);

        $package->update(['status' => 'archived']);

        return response()->noContent();
    }

    /**
     * POST /api/guide/packages/{id}/publish
     * Publish a draft package.
     */
    public function publish(TourPackage $package)
    {
        Gate::authorize('update', $package);

        // Validate package has required data before publishing
        if ($package->days()->count() === 0) {
            return response()->json(['error' => 'Package must have at least one day'], 422);
        }

        if ($package->rates()->where('tour_package_addon_id', null)->count() === 0) {
            return response()->json(['error' => 'Package must have at least one base rate tier'], 422);
        }

        $package->update(['status' => 'published']);

        return new TourPackageResource($package);
    }
}

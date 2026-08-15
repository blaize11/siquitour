<?php

namespace App\Http\Controllers\Guide;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTourPackageAddonRequest;
use App\Http\Requests\StoreTourPackageExclusionRequest;
use App\Http\Requests\StoreTourPackageInclusionRequest;
use App\Http\Requests\StoreTourPackageDayRequest;
use App\Http\Requests\StoreTourPackageRateRequest;
use App\Http\Requests\StoreTourPackageStopRequest;
use App\Http\Resources\TourPackageAddonResource;
use App\Http\Resources\TourPackageDayResource;
use App\Http\Resources\TourPackageExclusionResource;
use App\Http\Resources\TourPackageInclusionResource;
use App\Http\Resources\TourPackageRateResource;
use App\Models\TourPackage;
use App\Models\TourPackageAddon;
use App\Models\TourPackageDay;
use App\Models\TourPackageExclusion;
use App\Models\TourPackageInclusion;
use App\Models\TourPackageRate;
use App\Models\TourPackageStop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

/**
 * Guide package builder — manage days, stops, inclusions, exclusions, add-ons, rates.
 */
class PackageBuilderController extends Controller
{
    /**
     * POST /api/guide/packages/{package}/days
     * Add a day to the package.
     */
    public function storeDay(TourPackage $package, StoreTourPackageDayRequest $request)
    {
        Gate::authorize('update', $package);

        $day = TourPackageDay::create([
            'tour_package_id' => $package->id,
            'day_number' => $request->input('day_number'),
            'title' => $request->input('title'),
            'notes' => $request->input('notes'),
        ]);

        return response()->json(new TourPackageDayResource($day), 201);
    }

    /**
     * PUT /api/guide/packages/{package}/days/{day}
     * Update a day.
     */
    public function updateDay(TourPackage $package, TourPackageDay $day, StoreTourPackageDayRequest $request)
    {
        Gate::authorize('update', $package);
        abort_if($day->tour_package_id !== $package->id, 404);

        $day->update($request->validated());

        return new TourPackageDayResource($day);
    }

    /**
     * DELETE /api/guide/packages/{package}/days/{day}
     * Delete a day and all its stops.
     */
    public function destroyDay(TourPackage $package, TourPackageDay $day)
    {
        Gate::authorize('update', $package);
        abort_if($day->tour_package_id !== $package->id, 404);

        $day->delete();

        return response()->noContent();
    }

    /**
     * POST /api/guide/packages/{package}/days/{day}/stops
     * Add a stop to a day.
     */
    public function storeStop(TourPackage $package, TourPackageDay $day, StoreTourPackageStopRequest $request)
    {
        Gate::authorize('update', $package);
        abort_if($day->tour_package_id !== $package->id, 404);

        $stop = TourPackageStop::create([
            'tour_package_day_id' => $day->id,
            'stoppable_type' => $request->input('stoppable_type'),
            'stoppable_id' => $request->input('stoppable_id'),
            'sort_order' => $request->input('sort_order', 0),
            'is_optional' => $request->boolean('is_optional'),
            'note' => $request->input('note'),
        ]);

        return response()->json($stop->load('stoppable'), 201);
    }

    /**
     * PUT /api/guide/packages/{package}/days/{day}/stops/{stop}
     * Update a stop.
     */
    public function updateStop(TourPackage $package, TourPackageDay $day, TourPackageStop $stop, StoreTourPackageStopRequest $request)
    {
        Gate::authorize('update', $package);
        abort_if($day->tour_package_id !== $package->id, 404);
        abort_if($stop->tour_package_day_id !== $day->id, 404);

        $stop->update($request->validated());

        return response()->json($stop->load('stoppable'));
    }

    /**
     * DELETE /api/guide/packages/{package}/days/{day}/stops/{stop}
     * Delete a stop.
     */
    public function destroyStop(TourPackage $package, TourPackageDay $day, TourPackageStop $stop)
    {
        Gate::authorize('update', $package);
        abort_if($day->tour_package_id !== $package->id, 404);
        abort_if($stop->tour_package_day_id !== $day->id, 404);

        $stop->delete();

        return response()->noContent();
    }

    /**
     * POST /api/guide/packages/{package}/inclusions
     * Add an inclusion.
     */
    public function storeInclusion(TourPackage $package, StoreTourPackageInclusionRequest $request)
    {
        Gate::authorize('update', $package);

        $inclusion = TourPackageInclusion::create([
            'tour_package_id' => $package->id,
            'label' => $request->input('label'),
            'sort_order' => $request->input('sort_order', 0),
        ]);

        return response()->json(new TourPackageInclusionResource($inclusion), 201);
    }

    /**
     * PUT /api/guide/packages/{package}/inclusions/{inclusion}
     * Update an inclusion.
     */
    public function updateInclusion(TourPackage $package, TourPackageInclusion $inclusion, StoreTourPackageInclusionRequest $request)
    {
        Gate::authorize('update', $package);
        abort_if($inclusion->tour_package_id !== $package->id, 404);

        $inclusion->update($request->validated());

        return new TourPackageInclusionResource($inclusion);
    }

    /**
     * DELETE /api/guide/packages/{package}/inclusions/{inclusion}
     * Delete an inclusion.
     */
    public function destroyInclusion(TourPackage $package, TourPackageInclusion $inclusion)
    {
        Gate::authorize('update', $package);
        abort_if($inclusion->tour_package_id !== $package->id, 404);

        $inclusion->delete();

        return response()->noContent();
    }

    /**
     * POST /api/guide/packages/{package}/exclusions
     * Add an exclusion.
     */
    public function storeExclusion(TourPackage $package, StoreTourPackageExclusionRequest $request)
    {
        Gate::authorize('update', $package);

        $exclusion = TourPackageExclusion::create([
            'tour_package_id' => $package->id,
            'label' => $request->input('label'),
            'sort_order' => $request->input('sort_order', 0),
        ]);

        return response()->json(new TourPackageExclusionResource($exclusion), 201);
    }

    /**
     * PUT /api/guide/packages/{package}/exclusions/{exclusion}
     * Update an exclusion.
     */
    public function updateExclusion(TourPackage $package, TourPackageExclusion $exclusion, StoreTourPackageExclusionRequest $request)
    {
        Gate::authorize('update', $package);
        abort_if($exclusion->tour_package_id !== $package->id, 404);

        $exclusion->update($request->validated());

        return new TourPackageExclusionResource($exclusion);
    }

    /**
     * DELETE /api/guide/packages/{package}/exclusions/{exclusion}
     * Delete an exclusion.
     */
    public function destroyExclusion(TourPackage $package, TourPackageExclusion $exclusion)
    {
        Gate::authorize('update', $package);
        abort_if($exclusion->tour_package_id !== $package->id, 404);

        $exclusion->delete();

        return response()->noContent();
    }

    /**
     * POST /api/guide/packages/{package}/addons
     * Add an add-on.
     */
    public function storeAddon(TourPackage $package, StoreTourPackageAddonRequest $request)
    {
        Gate::authorize('update', $package);

        $addon = TourPackageAddon::create([
            'tour_package_id' => $package->id,
            'name' => $request->input('name'),
            'description' => $request->input('description'),
            'pricing_mode' => $request->input('pricing_mode'),
            'flat_fee' => $request->input('flat_fee'),
            'sort_order' => $request->input('sort_order', 0),
        ]);

        return response()->json(new TourPackageAddonResource($addon->load('rates')), 201);
    }

    /**
     * PUT /api/guide/packages/{package}/addons/{addon}
     * Update an add-on.
     */
    public function updateAddon(TourPackage $package, TourPackageAddon $addon, StoreTourPackageAddonRequest $request)
    {
        Gate::authorize('update', $package);
        abort_if($addon->tour_package_id !== $package->id, 404);

        $addon->update($request->validated());

        return new TourPackageAddonResource($addon->load('rates'));
    }

    /**
     * DELETE /api/guide/packages/{package}/addons/{addon}
     * Delete an add-on (and its rate tiers).
     */
    public function destroyAddon(TourPackage $package, TourPackageAddon $addon)
    {
        Gate::authorize('update', $package);
        abort_if($addon->tour_package_id !== $package->id, 404);

        $addon->delete();

        return response()->noContent();
    }

    /**
     * POST /api/guide/packages/{package}/rates
     * Add a rate tier (for base package or addon).
     */
    public function storeRate(TourPackage $package, StoreTourPackageRateRequest $request)
    {
        Gate::authorize('update', $package);

        // Validate no overlaps/gaps
        $this->validateRateTierRange($package, $request);

        $rate = TourPackageRate::create([
            'tour_package_id' => $package->id,
            'tour_package_addon_id' => $request->input('tour_package_addon_id'),
            'min_pax' => $request->input('min_pax'),
            'max_pax' => $request->input('max_pax'),
            'price' => $request->input('price'),
        ]);

        return response()->json(new TourPackageRateResource($rate), 201);
    }

    /**
     * PUT /api/guide/packages/{package}/rates/{rate}
     * Update a rate tier.
     */
    public function updateRate(TourPackage $package, TourPackageRate $rate, StoreTourPackageRateRequest $request)
    {
        Gate::authorize('update', $package);
        abort_if($rate->tour_package_id !== $package->id, 404);

        $this->validateRateTierRange($package, $request, $rate->id);

        $rate->update($request->validated());

        return new TourPackageRateResource($rate);
    }

    /**
     * DELETE /api/guide/packages/{package}/rates/{rate}
     * Delete a rate tier.
     */
    public function destroyRate(TourPackage $package, TourPackageRate $rate)
    {
        Gate::authorize('update', $package);
        abort_if($rate->tour_package_id !== $package->id, 404);

        $rate->delete();

        return response()->noContent();
    }

    /**
     * Validate rate tier ranges don't overlap and have no gaps.
     */
    private function validateRateTierRange(TourPackage $package, StoreTourPackageRateRequest $request, ?int $excludeRateId = null)
    {
        $minPax = $request->input('min_pax');
        $maxPax = $request->input('max_pax');
        $addonId = $request->input('tour_package_addon_id');

        // Query existing tiers for this package/addon
        $query = TourPackageRate::where('tour_package_id', $package->id)
            ->where('tour_package_addon_id', $addonId);

        if ($excludeRateId) {
            $query->where('id', '!=', $excludeRateId);
        }

        $existingRates = $query->get();

        // Check for overlaps
        foreach ($existingRates as $existing) {
            if (($minPax >= $existing->min_pax && $minPax <= $existing->max_pax) ||
                ($maxPax >= $existing->min_pax && $maxPax <= $existing->max_pax) ||
                ($minPax < $existing->min_pax && $maxPax > $existing->max_pax)) {
                throw new \Illuminate\Validation\ValidationException(\Illuminate\Validation\Validator::make([], [
                    'tier_overlap' => 'Rate tier overlaps with existing tier (' . $existing->min_pax . '-' . $existing->max_pax . ' pax)',
                ])->errors());
            }
        }
    }
}

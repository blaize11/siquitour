<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\GuideInclusion;
use App\Models\TourGuideProfile;
use App\Models\User;
use App\Http\Resources\TourGuideProfileResource;
use Illuminate\Http\Request;

class GuideController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query()
            ->where('role', 'tour_guide')
            ->where('status', 'active')
            ->with('tourGuideProfile');

        // Search by name or bio
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhereHas('tourGuideProfile', function ($q) use ($search) {
                      $q->where('bio', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by minimum experience
        if ($request->filled('min_experience')) {
            $query->whereHas('tourGuideProfile', function ($q) use ($request) {
                $q->where('years_experience', '>=', $request->input('min_experience'));
            });
        }

        // Filter by maximum price
        if ($request->filled('max_price')) {
            $query->whereHas('tourGuideProfile', function ($q) use ($request) {
                $q->where('rate_per_pax', '<=', $request->input('max_price'));
            });
        }

        // Filter by verification status
        if ($request->input('verified') === 'true') {
            $query->whereHas('tourGuideProfile', function ($q) {
                $q->where('is_verified', true);
            });
        }

        $guides = $query->latest()->paginate(20);

        return response()->json($guides);
    }

    public function show(User $guide)
    {
        abort_unless($guide->role === 'tour_guide', 404);

        $guide->load('tourGuideProfile', 'reviewsReceived');

        return response()->json($guide);
    }

    public function bookedDates(User $guide)
    {
        abort_unless($guide->role === 'tour_guide', 404);

        // Get all bookings for this guide that are not cancelled/declined
        $bookings = Booking::query()
            ->where('bookable_type', User::class)
            ->where('bookable_id', $guide->id)
            ->whereIn('status', ['pending', 'accepted', 'completed'])
            ->pluck('start_date')
            ->map(fn ($date) => $date->format('Y-m-d'))
            ->unique()
            ->values();

        return response()->json(['booked_dates' => $bookings]);
    }

    /**
     * GET /api/guides/me/profile
     * Get the authenticated guide's profile with inclusions
     */
    public function getMyProfile(Request $request)
    {
        $user = $request->user();
        abort_unless($user->role === 'tour_guide', 403, 'Only tour guides can access this');

        $profile = $user->tourGuideProfile;
        abort_unless($profile, 404, 'Tour guide profile not found');

        return response()->json(new TourGuideProfileResource($profile));
    }

    /**
     * PUT /api/guides/me/profile
     * Update the authenticated guide's profile
     */
    public function updateMyProfile(Request $request)
    {
        $user = $request->user();
        abort_unless($user->role === 'tour_guide', 403, 'Only tour guides can update their profile');

        $profile = $user->tourGuideProfile;
        abort_unless($profile, 404, 'Tour guide profile not found');

        $validated = $request->validate([
            'bio' => 'nullable|string|max:1000',
            'years_experience' => 'nullable|integer|min:0|max:100',
            'rate_per_pax' => 'nullable|numeric|min:0',
            'additional_services' => 'nullable|string|max:1000',
        ]);

        $profile->update($validated);

        return response()->json(new TourGuideProfileResource($profile));
    }

    /**
     * POST /api/guides/me/inclusions
     * Add an inclusion to the authenticated guide's profile
     */
    public function addInclusion(Request $request)
    {
        $user = $request->user();
        abort_unless($user->role === 'tour_guide', 403, 'Only tour guides can manage inclusions');

        $profile = $user->tourGuideProfile;
        abort_unless($profile, 404, 'Tour guide profile not found');

        $validated = $request->validate([
            'label' => 'required|string|max:100',
        ]);

        // Get the highest sort_order and increment
        $maxSortOrder = $profile->inclusions()->max('sort_order') ?? -1;

        $inclusion = $profile->inclusions()->create([
            'label' => $validated['label'],
            'sort_order' => $maxSortOrder + 1,
        ]);

        return response()->json(
            new TourGuideProfileResource($profile->fresh()),
            201
        );
    }

    /**
     * PUT /api/guides/me/inclusions/{inclusion}
     * Update an inclusion for the authenticated guide
     */
    public function updateInclusion(Request $request, GuideInclusion $inclusion)
    {
        $user = $request->user();
        abort_unless($user->role === 'tour_guide', 403, 'Only tour guides can manage inclusions');

        $profile = $user->tourGuideProfile;
        abort_unless($inclusion->tour_guide_profile_id === $profile->id, 403, 'Not your inclusion');

        $validated = $request->validate([
            'label' => 'required|string|max:100',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $inclusion->update($validated);

        return response()->json(
            new TourGuideProfileResource($profile->fresh())
        );
    }

    /**
     * DELETE /api/guides/me/inclusions/{inclusion}
     * Delete an inclusion from the authenticated guide's profile
     */
    public function deleteInclusion(Request $request, GuideInclusion $inclusion)
    {
        $user = $request->user();
        abort_unless($user->role === 'tour_guide', 403, 'Only tour guides can manage inclusions');

        $profile = $user->tourGuideProfile;
        abort_unless($inclusion->tour_guide_profile_id === $profile->id, 403, 'Not your inclusion');

        $inclusion->delete();

        return response()->json(
            new TourGuideProfileResource($profile->fresh())
        );
    }

    /**
     * PUT /api/guides/me/inclusions/reorder
     * Reorder all inclusions for the authenticated guide
     */
    public function reorderInclusions(Request $request)
    {
        $user = $request->user();
        abort_unless($user->role === 'tour_guide', 403, 'Only tour guides can manage inclusions');

        $profile = $user->tourGuideProfile;

        $validated = $request->validate([
            'inclusions' => 'required|array',
            'inclusions.*.id' => 'required|integer',
            'inclusions.*.sort_order' => 'required|integer|min:0',
        ]);

        foreach ($validated['inclusions'] as $item) {
            $inclusion = GuideInclusion::find($item['id']);
            abort_unless($inclusion && $inclusion->tour_guide_profile_id === $profile->id, 403);
            $inclusion->update(['sort_order' => $item['sort_order']]);
        }

        return response()->json(
            new TourGuideProfileResource($profile->fresh())
        );
    }
}

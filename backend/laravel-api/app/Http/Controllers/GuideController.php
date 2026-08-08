<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\User;
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
}

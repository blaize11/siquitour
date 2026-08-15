<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Rental;
use App\Models\Restaurant;
use App\Models\Spot;
use App\Models\User;
use Illuminate\Http\Request;

class ExploreController extends Controller
{
    /**
     * GET /api/explore
     * Browse all listings - available to all authenticated users.
     * Guests can book, others can only view.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $guides = $this->getGuides($request);
        $rentals = $this->getRentals($request);
        $spots = $this->getSpots($request);
        $restaurants = $this->getRestaurants($request);

        return response()->json([
            'guides' => $guides,
            'rentals' => $rentals,
            'spots' => $spots,
            'restaurants' => $restaurants,
            'user_role' => $user->isRole('guest') ? 'guest' : 'read-only',
            'can_book' => $user->isRole('guest'),
        ]);
    }

    /**
     * GET /api/explore/guides
     * Browse tour guides - all users can view, only guests can book.
     */
    public function guides(Request $request)
    {
        $guides = $this->getGuides($request);

        return response()->json([
            'data' => $guides,
            'total' => count($guides),
            'can_book' => $request->user()->isRole('guest'),
        ]);
    }

    /**
     * GET /api/explore/rentals
     * Browse rentals - all users can view, only guests can book.
     */
    public function rentals(Request $request)
    {
        $rentals = $this->getRentals($request);

        return response()->json([
            'data' => $rentals,
            'total' => count($rentals),
            'can_book' => $request->user()->isRole('guest'),
        ]);
    }

    /**
     * GET /api/explore/spots
     * Browse tourist spots - all users can view.
     */
    public function spots(Request $request)
    {
        $spots = $this->getSpots($request);

        return response()->json([
            'data' => $spots,
            'total' => count($spots),
        ]);
    }

    /**
     * GET /api/explore/restaurants
     * Browse restaurants - all users can view.
     */
    public function restaurants(Request $request)
    {
        $restaurants = $this->getRestaurants($request);

        return response()->json([
            'data' => $restaurants,
            'total' => count($restaurants),
        ]);
    }

    /**
     * GET /api/explore/guides/{guide}
     * View specific guide profile - all users can view, only guests can book.
     */
    public function showGuide(Request $request, User $guide)
    {
        abort_unless($guide->role === 'tour_guide', 404, 'Guide not found.');

        // Must be verified to be visible
        $userRole = $guide->userRoles()
            ->where('role_id', function ($query) {
                $query->select('id')->from('roles')->where('name', 'tour_guide');
            })
            ->first();

        abort_unless($userRole && $userRole->status === 'verified', 404, 'Guide not found.');

        return response()->json([
            'data' => [
                'id' => $guide->id,
                'name' => $guide->name,
                'avatar_url' => $guide->avatar_url,
                'phone' => $request->user()->isRole('guest') ? $guide->phone : null,
                'municipality' => $guide->municipality,
                'profile' => $guide->tourGuideProfile,
                'packages' => $guide->tourPackages()->where('status', 'published')->get(),
                'reviews' => $guide->reviewsReceived()->paginate(10),
                'followers_count' => $guide->followers()->count(),
                'is_following' => $request->user()->following()->where('followed_id', $guide->id)->exists(),
            ],
            'can_book' => $request->user()->isRole('guest'),
        ]);
    }

    /**
     * GET /api/explore/rentals/{rental}
     * View specific rental - all users can view, only guests can book.
     */
    public function showRental(Request $request, Rental $rental)
    {
        abort_unless($rental->status === 'active', 404, 'Rental not found.');

        $renter = $rental->renter;

        return response()->json([
            'data' => [
                'id' => $rental->id,
                'title' => $rental->title,
                'type' => $rental->type,
                'description' => $rental->description,
                'price_per_day' => $rental->price_per_day,
                'latitude' => $rental->latitude,
                'longitude' => $rental->longitude,
                'address' => $rental->address,
                'images' => $rental->images,
                'renter' => [
                    'id' => $renter->id,
                    'name' => $renter->name,
                    'avatar_url' => $renter->avatar_url,
                    'phone' => $request->user()->isRole('guest') ? $renter->phone : null,
                ],
                'reviews' => $rental->reviews()->paginate(10),
                'booked_dates' => $this->getBookedDates($rental),
            ],
            'can_book' => $request->user()->isRole('guest'),
        ]);
    }

    /**
     * GET /api/explore/spots/{spot}
     * View specific spot - all users can view.
     */
    public function showSpot(Request $request, Spot $spot)
    {
        abort_unless($spot->is_active, 404, 'Spot not found.');

        return response()->json([
            'data' => [
                'id' => $spot->id,
                'name' => $spot->name,
                'category' => $spot->category,
                'description' => $spot->description,
                'municipality' => $spot->municipality,
                'latitude' => $spot->latitude,
                'longitude' => $spot->longitude,
                'fee_type' => $spot->fee_type,
                'fee_amount' => $spot->fee_amount,
                'typical_duration_minutes' => $spot->typical_duration_minutes,
                'images' => $spot->images,
                'creator' => $spot->creator,
            ],
        ]);
    }

    /**
     * GET /api/explore/restaurants/{restaurant}
     * View specific restaurant - all users can view.
     */
    public function showRestaurant(Request $request, Restaurant $restaurant)
    {
        abort_unless($restaurant->is_active, 404, 'Restaurant not found.');

        return response()->json([
            'data' => [
                'id' => $restaurant->id,
                'name' => $restaurant->name,
                'description' => $restaurant->description,
                'municipality' => $restaurant->municipality,
                'latitude' => $restaurant->latitude,
                'longitude' => $restaurant->longitude,
                'price_range' => $restaurant->price_range,
                'cuisine_tags' => $restaurant->cuisine_tags,
                'opening_time' => $restaurant->opening_time,
                'closing_time' => $restaurant->closing_time,
                'images' => $restaurant->images,
            ],
        ]);
    }

    /**
     * Get guides with filtering and search.
     */
    private function getGuides(Request $request)
    {
        $query = User::query()
            ->where('role', 'tour_guide')
            ->where('status', 'active')
            ->with('tourGuideProfile', 'reviewsReceived')
            ->whereHas('userRoles', function ($q) {
                $q->where('status', 'verified');
            });

        // Search
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhereHas('tourGuideProfile', fn($q2) => $q2->where('bio', 'like', "%{$search}%"));
            });
        }

        // Filter by experience
        if ($request->filled('min_experience')) {
            $query->whereHas('tourGuideProfile', fn($q) =>
                $q->where('years_experience', '>=', $request->input('min_experience'))
            );
        }

        // Filter by price
        if ($request->filled('max_price')) {
            $query->whereHas('tourGuideProfile', fn($q) =>
                $q->where('rate_per_pax', '<=', $request->input('max_price'))
            );
        }

        // Sort
        $sort = $request->input('sort', 'latest');
        if ($sort === 'rating') {
            $query->withAvg('reviewsReceived', 'rating')->orderBy('reviews_received_avg_rating', 'desc');
        } else {
            $query->latest();
        }

        return $query->paginate(10);
    }

    /**
     * Get active rentals with filtering and search.
     */
    private function getRentals(Request $request)
    {
        $query = Rental::query()
            ->where('status', 'active')
            ->with('renter', 'images');

        // Search
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by type
        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        // Filter by price
        if ($request->filled('max_price')) {
            $query->where('price_per_day', '<=', $request->input('max_price'));
        }

        // Sort
        $sort = $request->input('sort', 'latest');
        if ($sort === 'price_low') {
            $query->orderBy('price_per_day', 'asc');
        } elseif ($sort === 'price_high') {
            $query->orderBy('price_per_day', 'desc');
        } else {
            $query->latest();
        }

        return $query->paginate(10);
    }

    /**
     * Get active spots with filtering and search.
     */
    private function getSpots(Request $request)
    {
        $query = Spot::query()
            ->where('is_active', true)
            ->with('images');

        // Search
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }

        // Filter by category
        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        // Filter by municipality
        if ($request->filled('municipality')) {
            $query->where('municipality', $request->input('municipality'));
        }

        return $query->latest()->paginate(10);
    }

    /**
     * Get active restaurants with filtering and search.
     */
    private function getRestaurants(Request $request)
    {
        $query = Restaurant::query()
            ->where('is_active', true)
            ->with('images');

        // Search
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by cuisine
        if ($request->filled('cuisine')) {
            $cuisine = $request->input('cuisine');
            $query->where('cuisine_tags', 'like', "%{$cuisine}%");
        }

        // Filter by price range
        if ($request->filled('price_range')) {
            $query->where('price_range', $request->input('price_range'));
        }

        // Filter by municipality
        if ($request->filled('municipality')) {
            $query->where('municipality', $request->input('municipality'));
        }

        return $query->latest()->paginate(10);
    }

    /**
     * Get booked dates for a rental to show unavailability.
     */
    private function getBookedDates(Rental $rental)
    {
        return Booking::query()
            ->where('bookable_type', Rental::class)
            ->where('bookable_id', $rental->id)
            ->whereIn('status', ['pending', 'accepted', 'completed'])
            ->pluck('start_date', 'end_date')
            ->map(fn($date) => $date->format('Y-m-d'))
            ->toArray();
    }
}

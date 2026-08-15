<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Notification;
use App\Models\Rental;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    // Get reviews for the authenticated tour guide
    public function index(Request $request)
    {
        $user = $request->user();

        // Only tour guides can view their reviews
        abort_unless($user->role === 'tour_guide', 403, 'Only tour guides can view reviews.');

        $reviews = Review::where('tour_guide_id', $user->id)
            ->with(['booking', 'guest'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $reviews,
            'total' => $reviews->count(),
            'average_rating' => $reviews->avg('rating'),
        ]);
    }

    // Get reviews posted by the authenticated guest
    public function getGuestReviews(Request $request)
    {
        $user = $request->user();

        // Only guests can view their posted reviews
        abort_unless($user->role === 'guest', 403, 'Only guests can view their posted reviews.');

        $reviews = Review::where('guest_id', $user->id)
            ->with(['booking', 'tourGuide', 'rental', 'renter'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Calculate average rating across all reviews posted by guest
        $averageRating = $reviews->count() > 0 ? $reviews->avg('rating') : 0;

        return response()->json([
            'data' => $reviews,
            'total' => $reviews->count(),
            'average_rating' => $averageRating,
        ]);
    }

    // Get reviews for the authenticated renter's rentals
    public function getRenterReviews(Request $request)
    {
        $user = $request->user();

        // Only renters can view reviews of their rentals
        abort_unless($user->role === 'renter', 403, 'Only renters can view reviews of their rentals.');

        $reviews = Review::where('renter_id', $user->id)
            ->with(['booking', 'guest', 'rental'])
            ->orderBy('created_at', 'desc')
            ->get();

        $averageRating = $reviews->count() > 0 ? $reviews->avg('rating') : 0;

        return response()->json([
            'data' => $reviews,
            'total' => $reviews->count(),
            'average_rating' => $averageRating,
        ]);
    }

    // Store a review (by guest) - handles both tour guide and rental reviews
    public function store(Request $request, Booking $booking)
    {
        $user = $request->user();

        // RULE: Only guests can review (spec module 8)
        abort_unless($user->isRole('guest'), 403, 'Only guests can write reviews.');

        // RULE: Must own the booking
        abort_unless($booking->guest_id === $user->id, 403, 'You can only review your own bookings.');

        // RULE: Booking must be completed (spec module 8)
        abort_unless($booking->status === 'completed', 422, 'Booking must be completed before it can be reviewed.');

        // RULE: One review per booking (spec module 8)
        abort_if($booking->review()->exists(), 422, 'This booking has already been reviewed.');

        $validated = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:2000'],
        ]);

        // Check if this is a tour guide booking or rental booking
        if ($booking->bookable_type === User::class) {
            // Tour guide review
            $review = Review::create([
                'booking_id' => $booking->id,
                'guest_id' => $user->id,
                'tour_guide_id' => $booking->bookable_id,
                'rating' => $validated['rating'],
                'comment' => $validated['comment'] ?? null,
            ]);

            // Create notification for tour guide
            Notification::create([
                'user_id' => $booking->bookable_id,
                'type' => 'review_received',
                'title' => 'New Review ⭐',
                'message' => "{$user->name} left a {$validated['rating']}-star review.",
                'icon' => '⭐',
                'related_id' => $review->id,
                'related_type' => 'review',
            ]);
        } else if ($booking->bookable_type === Rental::class) {
            // Rental review
            $rental = Rental::find($booking->bookable_id);
            $review = Review::create([
                'booking_id' => $booking->id,
                'rental_id' => $booking->bookable_id,
                'guest_id' => $user->id,
                'renter_id' => $rental->renter_id,
                'rating' => $validated['rating'],
                'comment' => $validated['comment'] ?? null,
            ]);

            // Create notification for renter
            Notification::create([
                'user_id' => $rental->renter_id,
                'type' => 'review_received',
                'title' => 'New Review ⭐',
                'message' => "{$user->name} left a {$validated['rating']}-star review.",
                'icon' => '⭐',
                'related_id' => $review->id,
                'related_type' => 'review',
            ]);
        } else {
            abort(422, 'Invalid booking type for review.');
        }

        return response()->json($review, 201);
    }

    // Reply to a review (by tour guide)
    public function reply(Request $request, Review $review)
    {
        $user = $request->user();

        // Only the tour guide who received the review can reply
        abort_unless($review->tour_guide_id === $user->id, 403, 'You can only reply to your own reviews.');

        $validated = $request->validate([
            'guide_reply' => ['required', 'string', 'max:2000'],
        ]);

        $review->update([
            'guide_reply' => $validated['guide_reply'],
            'replied_at' => now(),
        ]);

        // Create notification for guest
        Notification::create([
            'user_id' => $review->guest_id,
            'type' => 'review_replied',
            'title' => 'Tour Guide Replied 💬',
            'message' => "{$user->name} replied to your review.",
            'icon' => '💬',
            'related_id' => $review->id,
            'related_type' => 'review',
        ]);

        return response()->json($review);
    }

    // Reply to a rental review (by renter)
    public function renterReply(Request $request, Review $review)
    {
        $user = $request->user();

        // Only the renter who received the review can reply
        abort_unless($review->renter_id === $user->id, 403, 'You can only reply to your own reviews.');

        $validated = $request->validate([
            'renter_reply' => ['required', 'string', 'max:2000'],
        ]);

        $review->update([
            'renter_reply' => $validated['renter_reply'],
            'renter_replied_at' => now(),
        ]);

        // Create notification for guest
        Notification::create([
            'user_id' => $review->guest_id,
            'type' => 'review_replied',
            'title' => 'Renter Replied 💬',
            'message' => "{$user->name} replied to your review.",
            'icon' => '💬',
            'related_id' => $review->id,
            'related_type' => 'review',
        ]);

        return response()->json($review);
    }
}

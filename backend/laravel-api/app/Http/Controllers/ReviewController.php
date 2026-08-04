<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function store(Request $request, Booking $booking)
    {
        $user = $request->user();

        abort_unless($booking->guest_id === $user->id, 403);
        abort_unless($booking->bookable_type === User::class, 422, 'Only tour guide bookings can be reviewed.');
        abort_unless($booking->status === 'completed', 422, 'Booking must be completed before it can be reviewed.');
        abort_if($booking->review()->exists(), 422, 'This booking has already been reviewed.');

        $validated = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:2000'],
        ]);

        $review = Review::create([
            'booking_id' => $booking->id,
            'guest_id' => $user->id,
            'tour_guide_id' => $booking->bookable_id,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
        ]);

        return response()->json($review, 201);
    }
}

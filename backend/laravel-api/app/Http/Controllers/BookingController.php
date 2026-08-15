<?php

namespace App\Http\Controllers;

use App\Models\Block;
use App\Models\Booking;
use App\Models\CommissionSetting;
use App\Models\Notification;
use App\Models\Rental;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Booking::query()->with(['guest:id,name', 'bookable']);

        // Admin can see all bookings
        if ($user->isRole('admin')) {
            // Show all bookings
        }
        // Guest can only see their own
        elseif ($user->isRole('guest')) {
            $query->where('guest_id', $user->id);
        }
        // Tour guide can only see bookings for their tours
        elseif ($user->isRole('tour_guide')) {
            $query->where('bookable_type', User::class)->where('bookable_id', $user->id);
        }
        // Renter can only see bookings for their rentals
        elseif ($user->isRole('renter')) {
            $query->where('bookable_type', Rental::class)->whereIn('bookable_id', $user->rentals()->pluck('id'));
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function store(Request $request)
    {
        $user = $request->user();
        abort_unless($user->isRole('guest'), 403, 'Only guests can create bookings.');

        $validated = $request->validate([
            'bookable_type' => ['required', Rule::in(['guide', 'rental'])],
            'bookable_id' => ['required', 'integer'],
            'pax_count' => ['nullable', 'integer', 'min:1'],
            'start_date' => ['required', 'date', 'after_or_equal:today'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
        ]);

        if ($validated['bookable_type'] === 'guide') {
            $guide = User::where('role', 'tour_guide')->where('status', 'active')->find($validated['bookable_id']);
            abort_if(! $guide, 404, 'Tour guide not found.');

            // CRITICAL: Self-transaction guard (spec rule #2)
            abort_if(
                $guide->id === $user->id,
                403,
                'You cannot book from yourself.'
            );

            abort_unless($validated['pax_count'] ?? null, 422, 'pax_count is required when booking a tour guide.');

            $this->assertNotBlocked($user, $guide);

            $totalPrice = (float) $guide->tourGuideProfile->rate_per_pax * $validated['pax_count'];
            $bookableType = User::class;
            $bookableId = $guide->id;
        } else {
            $rental = Rental::where('status', 'active')->find($validated['bookable_id']);
            abort_if(! $rental, 404, 'Rental not found.');

            // CRITICAL: Self-transaction guard (spec rule #2)
            abort_if(
                $rental->renter_id === $user->id,
                403,
                'You cannot book from yourself.'
            );

            $this->assertNotBlocked($user, $rental->renter);

            $endDate = $validated['end_date'] ?? $validated['start_date'];
            $days = max(1, Carbon::parse($validated['start_date'])->diffInDays(Carbon::parse($endDate)) + 1);
            $totalPrice = (float) $rental->price_per_day * $days;
            $bookableType = Rental::class;
            $bookableId = $rental->id;
        }

        $commissionPercentage = (float) (CommissionSetting::where('is_active', true)->value('percentage') ?? 0);

        $booking = Booking::create([
            'guest_id' => $user->id,
            'bookable_type' => $bookableType,
            'bookable_id' => $bookableId,
            'pax_count' => $validated['pax_count'] ?? null,
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'] ?? null,
            'status' => 'pending',
            'total_price' => $totalPrice,
            'commission_amount' => round($totalPrice * $commissionPercentage / 100, 2),
        ]);

        // Create notification for guide/renter
        $recipientId = $bookableType === User::class ? $bookableId : Rental::find($bookableId)->renter_id;
        $bookingType = $bookableType === User::class ? 'tour booking' : 'rental booking';

        Notification::create([
            'user_id' => $recipientId,
            'type' => 'booking_request',
            'title' => 'New Booking Request 📅',
            'message' => "You have a new {$bookingType} request from {$user->name}. Please review and respond.",
            'icon' => '📅',
            'related_id' => $booking->id,
            'related_type' => 'booking',
        ]);

        return response()->json($booking->load('bookable'), 201);
    }

    public function show(Request $request, Booking $booking)
    {
        Gate::authorize('view', $booking);

        return response()->json($booking->load(['guest:id,name', 'bookable', 'payment', 'review']));
    }

    public function accept(Request $request, Booking $booking)
    {
        Gate::authorize('respond', $booking);
        $this->assertStatus($booking, 'pending');

        $booking->update(['status' => 'accepted']);

        // Create notification for guest
        Notification::create([
            'user_id' => $booking->guest_id,
            'type' => 'booking_accepted',
            'title' => 'Booking Accepted ✅',
            'message' => 'Your booking has been accepted! Check your bookings for more details.',
            'icon' => '✅',
            'related_id' => $booking->id,
            'related_type' => 'booking',
        ]);

        return response()->json($booking);
    }

    public function decline(Request $request, Booking $booking)
    {
        Gate::authorize('respond', $booking);
        $this->assertStatus($booking, 'pending');

        $booking->update(['status' => 'declined']);

        // Create notification for guest
        Notification::create([
            'user_id' => $booking->guest_id,
            'type' => 'booking_declined',
            'title' => 'Booking Declined ❌',
            'message' => 'Unfortunately, your booking has been declined. Try booking another time.',
            'icon' => '❌',
            'related_id' => $booking->id,
            'related_type' => 'booking',
        ]);

        return response()->json($booking);
    }

    public function complete(Request $request, Booking $booking)
    {
        Gate::authorize('respond', $booking);
        $this->assertStatus($booking, 'accepted');

        $booking->update(['status' => 'completed']);

        return response()->json($booking);
    }

    public function cancel(Request $request, Booking $booking)
    {
        Gate::authorize('cancel', $booking);

        $booking->update(['status' => 'cancelled']);

        return response()->json($booking);
    }

    private function assertStatus(Booking $booking, string $expected): void
    {
        if ($booking->status !== $expected) {
            throw ValidationException::withMessages([
                'status' => ["Booking must be {$expected} to perform this action (currently {$booking->status})."],
            ]);
        }
    }

    private function assertNotBlocked(User $guest, User $owner): void
    {
        $blocked = Block::where(function ($query) use ($guest, $owner) {
            $query->where('blocker_id', $guest->id)->where('blocked_id', $owner->id);
        })->orWhere(function ($query) use ($guest, $owner) {
            $query->where('blocker_id', $owner->id)->where('blocked_id', $guest->id);
        })->exists();

        abort_if($blocked, 403, 'Booking is not available between these accounts.');
    }
}

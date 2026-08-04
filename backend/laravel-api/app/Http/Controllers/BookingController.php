<?php

namespace App\Http\Controllers;

use App\Models\Block;
use App\Models\Booking;
use App\Models\CommissionSetting;
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

        if ($user->role === 'guest') {
            $query->where('guest_id', $user->id);
        } elseif ($user->role === 'tour_guide') {
            $query->where('bookable_type', User::class)->where('bookable_id', $user->id);
        } elseif ($user->role === 'renter') {
            $query->where('bookable_type', Rental::class)->whereIn('bookable_id', $user->rentals()->pluck('id'));
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function store(Request $request)
    {
        $user = $request->user();
        abort_unless($user->role === 'guest', 403, 'Only guests can create bookings.');

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
            abort_unless($validated['pax_count'] ?? null, 422, 'pax_count is required when booking a tour guide.');

            $this->assertNotBlocked($user, $guide);

            $totalPrice = (float) $guide->tourGuideProfile->rate_per_pax * $validated['pax_count'];
            $bookableType = User::class;
            $bookableId = $guide->id;
        } else {
            $rental = Rental::where('status', 'active')->find($validated['bookable_id']);
            abort_if(! $rental, 404, 'Rental not found.');

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

        return response()->json($booking);
    }

    public function decline(Request $request, Booking $booking)
    {
        Gate::authorize('respond', $booking);
        $this->assertStatus($booking, 'pending');

        $booking->update(['status' => 'declined']);

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

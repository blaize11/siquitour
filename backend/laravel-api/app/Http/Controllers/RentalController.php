<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Rental;
use Carbon\Carbon;
use Illuminate\Http\Request;

class RentalController extends Controller
{
    public function index(Request $request)
    {
        $query = Rental::query()
            ->where('status', 'active')
            ->with(['images', 'renter:id,name']);

        // Filter by type (motorbike, car, room, etc.)
        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        // Search by title or description
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%");
            });
        }

        // Filter by maximum price
        if ($request->filled('max_price')) {
            $query->where('price_per_day', '<=', $request->input('max_price'));
        }

        // Filter by minimum price
        if ($request->filled('min_price')) {
            $query->where('price_per_day', '>=', $request->input('min_price'));
        }

        $rentals = $query->latest()->paginate(20);

        return response()->json($rentals);
    }

    public function show(Rental $rental)
    {
        $rental->load(['images', 'renter:id,name']);

        return response()->json($rental);
    }

    public function bookedDates(Rental $rental)
    {
        // Get all bookings for this rental that are not cancelled/declined
        $bookings = Booking::query()
            ->where('bookable_type', Rental::class)
            ->where('bookable_id', $rental->id)
            ->whereIn('status', ['pending', 'accepted', 'completed'])
            ->get();

        // Collect all booked dates including ranges
        $bookedDates = [];
        foreach ($bookings as $booking) {
            $startDate = Carbon::parse($booking->start_date);
            $endDate = $booking->end_date ? Carbon::parse($booking->end_date) : $startDate;

            while ($startDate <= $endDate) {
                $bookedDates[] = $startDate->format('Y-m-d');
                $startDate->addDay();
            }
        }

        return response()->json([
            'booked_dates' => array_unique($bookedDates),
            'rental_id' => $rental->id,
            'rental_name' => $rental->title,
        ]);
    }
}

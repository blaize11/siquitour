<?php

namespace App\Http\Controllers;

use App\Models\Rental;
use Illuminate\Http\Request;

class RentalController extends Controller
{
    public function index(Request $request)
    {
        $rentals = Rental::query()
            ->where('status', 'active')
            ->when($request->query('type'), fn ($query, $type) => $query->where('type', $type))
            ->with(['images', 'renter:id,name'])
            ->paginate(20);

        return response()->json($rentals);
    }

    public function show(Rental $rental)
    {
        $rental->load(['images', 'renter:id,name']);

        return response()->json($rental);
    }
}

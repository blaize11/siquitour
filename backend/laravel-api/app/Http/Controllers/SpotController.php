<?php

namespace App\Http\Controllers;

use App\Models\Spot;
use Illuminate\Http\Request;

class SpotController extends Controller
{
    public function index(Request $request)
    {
        $spots = Spot::query()
            ->when($request->query('category'), fn ($query, $category) => $query->where('category', $category))
            ->paginate(20);

        return response()->json($spots);
    }

    public function show(Spot $spot)
    {
        return response()->json($spot);
    }
}

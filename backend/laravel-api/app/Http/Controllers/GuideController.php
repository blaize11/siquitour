<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class GuideController extends Controller
{
    public function index(Request $request)
    {
        $guides = User::query()
            ->where('role', 'tour_guide')
            ->where('status', 'active')
            ->with('tourGuideProfile')
            ->paginate(20);

        return response()->json($guides);
    }

    public function show(User $guide)
    {
        abort_unless($guide->role === 'tour_guide', 404);

        $guide->load('tourGuideProfile', 'reviewsReceived');

        return response()->json($guide);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Follow;
use App\Models\User;
use Illuminate\Http\Request;

class FollowController extends Controller
{
    public function store(Request $request, User $user)
    {
        $follower = $request->user();
        abort_if($follower->id === $user->id, 422, 'You cannot follow yourself.');

        Follow::firstOrCreate([
            'follower_id' => $follower->id,
            'followed_id' => $user->id,
        ]);

        return response()->json(['following' => true]);
    }

    public function destroy(Request $request, User $user)
    {
        Follow::where('follower_id', $request->user()->id)
            ->where('followed_id', $user->id)
            ->delete();

        return response()->json(['following' => false]);
    }
}

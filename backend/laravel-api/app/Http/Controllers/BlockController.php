<?php

namespace App\Http\Controllers;

use App\Models\Block;
use App\Models\User;
use Illuminate\Http\Request;

class BlockController extends Controller
{
    public function store(Request $request, User $user)
    {
        $blocker = $request->user();
        abort_if($blocker->id === $user->id, 422, 'You cannot block yourself.');

        Block::firstOrCreate([
            'blocker_id' => $blocker->id,
            'blocked_id' => $user->id,
        ]);

        return response()->json(['blocked' => true]);
    }

    public function destroy(Request $request, User $user)
    {
        Block::where('blocker_id', $request->user()->id)
            ->where('blocked_id', $user->id)
            ->delete();

        return response()->json(['blocked' => false]);
    }
}

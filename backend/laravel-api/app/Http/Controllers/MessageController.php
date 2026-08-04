<?php

namespace App\Http\Controllers;

use App\Models\Block;
use App\Models\Conversation;
use App\Models\User;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function index(Request $request, Conversation $conversation)
    {
        $this->assertParticipant($request->user(), $conversation);

        return response()->json(
            $conversation->messages()->with('sender:id,name')->oldest()->paginate(50)
        );
    }

    public function store(Request $request, Conversation $conversation)
    {
        $user = $request->user();
        $this->assertParticipant($user, $conversation);

        $otherId = $conversation->participant_one_id === $user->id
            ? $conversation->participant_two_id
            : $conversation->participant_one_id;

        $blocked = Block::where(function ($query) use ($user, $otherId) {
            $query->where('blocker_id', $user->id)->where('blocked_id', $otherId);
        })->orWhere(function ($query) use ($user, $otherId) {
            $query->where('blocker_id', $otherId)->where('blocked_id', $user->id);
        })->exists();
        abort_if($blocked, 403, 'Cannot message this account.');

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:4000'],
        ]);

        $message = $conversation->messages()->create([
            'sender_id' => $user->id,
            'body' => $validated['body'],
        ]);
        $conversation->touch();

        return response()->json($message->load('sender:id,name'), 201);
    }

    private function assertParticipant(User $user, Conversation $conversation): void
    {
        abort_unless(
            in_array($user->id, [$conversation->participant_one_id, $conversation->participant_two_id], true),
            403
        );
    }
}

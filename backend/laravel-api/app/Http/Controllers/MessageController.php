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
            $conversation->messages()->with('sender:id,name,avatar_url')->oldest()->paginate(50)
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

        return response()->json($message->load('sender:id,name,avatar_url'), 201);
    }

    public function markAsRead(Request $request, Conversation $conversation)
    {
        $user = $request->user();
        $this->assertParticipant($user, $conversation);

        // Mark all messages from the other user as read
        $updatedCount = $conversation->messages()
            ->where('sender_id', '!=', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        \Log::info('Marked ' . $updatedCount . ' messages as read for conversation ' . $conversation->id . ' by user ' . $user->id);

        return response()->json(['success' => true, 'updated' => $updatedCount]);
    }

    private function assertParticipant(User $user, Conversation $conversation): void
    {
        abort_unless(
            in_array($user->id, [$conversation->participant_one_id, $conversation->participant_two_id], true),
            403
        );
    }
}

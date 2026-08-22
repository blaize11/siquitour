<?php

namespace App\Http\Controllers;

use App\Models\Block;
use App\Models\Conversation;
use Illuminate\Http\Request;

class ConversationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $conversations = Conversation::query()
            ->where('participant_one_id', $user->id)
            ->orWhere('participant_two_id', $user->id)
            ->with([
                'participantOne:id,name,role,avatar_url',
                'participantTwo:id,name,role,avatar_url',
            ])
            ->withCount('messages')
            ->latest('updated_at')
            ->paginate(20);

        // Add unread messages count and latest message for each conversation
        $conversations->getCollection()->transform(function ($conversation) use ($user) {
            $unreadCount = $conversation->messages()
                ->where('sender_id', '!=', $user->id)
                ->whereNull('read_at')
                ->count();
            $conversation->unread_messages_count = $unreadCount;

            // Get the latest message
            $latestMessage = $conversation->messages()
                ->latest('created_at')
                ->first(['id', 'body', 'created_at']);

            if ($latestMessage) {
                $conversation->latest_message = [
                    'content' => $latestMessage->body,
                    'created_at' => $latestMessage->created_at,
                ];
            }

            return $conversation;
        });

        return response()->json($conversations);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $otherId = (int) $validated['user_id'];
        abort_if($otherId === $user->id, 422, 'You cannot message yourself.');

        // RULE: Block Guest-to-Guest messaging (spec module 6)
        if ($user->isRole('guest')) {
            $otherUser = \App\Models\User::find($otherId);
            abort_if(
                $otherUser && $otherUser->isRole('guest'),
                403,
                'Guests cannot message other guests.'
            );
        }

        // Check blocks
        $blocked = Block::where(function ($query) use ($user, $otherId) {
            $query->where('blocker_id', $user->id)->where('blocked_id', $otherId);
        })->orWhere(function ($query) use ($user, $otherId) {
            $query->where('blocker_id', $otherId)->where('blocked_id', $user->id);
        })->exists();
        abort_if($blocked, 403, 'Cannot start a conversation between these accounts.');

        [$one, $two] = [$user->id, $otherId];
        if ($one > $two) {
            [$one, $two] = [$two, $one];
        }

        $conversation = Conversation::firstOrCreate([
            'participant_one_id' => $one,
            'participant_two_id' => $two,
        ]);

        return response()->json($conversation->load(['participantOne:id,name,role', 'participantTwo:id,name,role']), 201);
    }
}

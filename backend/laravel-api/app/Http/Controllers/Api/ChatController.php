<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    /**
     * Get all conversations for the authenticated user
     */
    public function getConversations()
    {
        $user = Auth::user();

        $conversations = Conversation::where('participant_one_id', $user->id)
            ->orWhere('participant_two_id', $user->id)
            ->with(['participantOne', 'participantTwo', 'messages' => function ($query) {
                $query->latest()->limit(1);
            }])
            ->latest('updated_at')
            ->get()
            ->map(function ($conversation) use ($user) {
                $otherParticipant = $conversation->participant_one_id === $user->id
                    ? $conversation->participantTwo
                    : $conversation->participantOne;

                $lastMessage = $conversation->messages->first();

                return [
                    'id' => $conversation->id,
                    'participant' => $otherParticipant,
                    'lastMessage' => $lastMessage ? [
                        'body' => $lastMessage->body,
                        'sender_id' => $lastMessage->sender_id,
                        'created_at' => $lastMessage->created_at,
                    ] : null,
                    'updated_at' => $conversation->updated_at,
                ];
            });

        return response()->json($conversations);
    }

    /**
     * Start or get a conversation with another user
     */
    public function startConversation($userId)
    {
        $authUser = Auth::user();

        // Validate that the user exists
        $otherUser = User::findOrFail($userId);

        // Check if conversation already exists
        $conversation = Conversation::where(function ($query) use ($authUser, $userId) {
            $query->where('participant_one_id', $authUser->id)
                  ->where('participant_two_id', $userId);
        })->orWhere(function ($query) use ($authUser, $userId) {
            $query->where('participant_one_id', $userId)
                  ->where('participant_two_id', $authUser->id);
        })->first();

        // Create new conversation if it doesn't exist
        if (!$conversation) {
            $conversation = Conversation::create([
                'participant_one_id' => $authUser->id,
                'participant_two_id' => $userId,
            ]);
        }

        return response()->json([
            'id' => $conversation->id,
            'participant' => $otherUser,
        ]);
    }

    /**
     * Get messages for a conversation
     */
    public function getMessages($conversationId)
    {
        $authUser = Auth::user();
        $conversation = Conversation::findOrFail($conversationId);

        // Verify user is part of this conversation
        if ($conversation->participant_one_id !== $authUser->id && $conversation->participant_two_id !== $authUser->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $messages = $conversation->messages()
            ->with('sender')
            ->orderBy('created_at', 'asc')
            ->paginate(50);

        return response()->json($messages);
    }

    /**
     * Send a message
     */
    public function sendMessage(Request $request, $conversationId)
    {
        $authUser = Auth::user();
        $conversation = Conversation::findOrFail($conversationId);

        // Verify user is part of this conversation
        if ($conversation->participant_one_id !== $authUser->id && $conversation->participant_two_id !== $authUser->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Validate request
        $validated = $request->validate([
            'body' => 'required|string|min:1|max:5000',
        ]);

        // Create message
        $message = $conversation->messages()->create([
            'sender_id' => $authUser->id,
            'body' => $validated['body'],
        ]);

        // Update conversation's updated_at timestamp
        $conversation->touch();

        return response()->json([
            'id' => $message->id,
            'body' => $message->body,
            'sender_id' => $message->sender_id,
            'created_at' => $message->created_at,
        ], 201);
    }

    /**
     * Mark message as read
     */
    public function markAsRead(Request $request, $conversationId)
    {
        $authUser = Auth::user();
        $conversation = Conversation::findOrFail($conversationId);

        // Verify user is part of this conversation
        if ($conversation->participant_one_id !== $authUser->id && $conversation->participant_two_id !== $authUser->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Mark messages as read
        Message::where('conversation_id', $conversationId)
            ->where('sender_id', '!=', $authUser->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['success' => true]);
    }

    /**
     * Delete a message
     */
    public function deleteMessage($conversationId, $messageId)
    {
        $authUser = Auth::user();
        $conversation = Conversation::findOrFail($conversationId);

        // Verify user is part of this conversation
        if ($conversation->participant_one_id !== $authUser->id && $conversation->participant_two_id !== $authUser->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $message = Message::findOrFail($messageId);

        // Verify user is the sender
        if ($message->sender_id !== $authUser->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $message->delete();

        return response()->json(['success' => true]);
    }
}

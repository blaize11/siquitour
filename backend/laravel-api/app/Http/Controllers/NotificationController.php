<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    // Get all notifications for authenticated user
    public function index(Request $request)
    {
        $user = $request->user();

        $unreadCount = Notification::where('user_id', $user->id)
            ->where('read', false)
            ->count();

        $notifications = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    // Mark notification as read
    public function markAsRead(Request $request, Notification $notification)
    {
        $user = $request->user();

        abort_unless($notification->user_id === $user->id, 403, 'Unauthorized');

        $notification->update([
            'read' => true,
            'read_at' => now(),
        ]);

        return response()->json($notification);
    }

    // Mark all notifications as read
    public function markAllAsRead(Request $request)
    {
        $user = $request->user();

        Notification::where('user_id', $user->id)
            ->where('read', false)
            ->update([
                'read' => true,
                'read_at' => now(),
            ]);

        return response()->json(['message' => 'All notifications marked as read']);
    }

    // Delete a notification
    public function destroy(Request $request, Notification $notification)
    {
        $user = $request->user();

        abort_unless($notification->user_id === $user->id, 403, 'Unauthorized');

        $notification->delete();

        return response()->json(['message' => 'Notification deleted']);
    }
}

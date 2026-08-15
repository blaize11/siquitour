<?php

namespace App\Http\Controllers;

use App\Http\Resources\NotificationResource;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * GET /api/notifications
     * Get all notifications for authenticated user with navigation routing.
     */
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
            'data' => NotificationResource::collection($notifications),
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * PATCH /api/notifications/{notification}/read
     * Mark a single notification as read and return it with navigation info.
     */
    public function markAsRead(Request $request, Notification $notification)
    {
        $user = $request->user();

        abort_unless($notification->user_id === $user->id, 403, 'Unauthorized');

        $notification->update([
            'read' => true,
            'read_at' => now(),
        ]);

        return response()->json(new NotificationResource($notification));
    }

    /**
     * POST /api/notifications/read-all
     * Mark all notifications as read.
     */
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

    /**
     * DELETE /api/notifications/{notification}
     * Delete a notification.
     */
    public function destroy(Request $request, Notification $notification)
    {
        $user = $request->user();

        abort_unless($notification->user_id === $user->id, 403, 'Unauthorized');

        $notification->delete();

        return response()->json(['message' => 'Notification deleted']);
    }
}

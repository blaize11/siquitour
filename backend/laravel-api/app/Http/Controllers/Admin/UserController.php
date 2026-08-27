<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * List all users with details and verification status
     */
    public function index(Request $request)
    {
        $users = User::query()
            ->with(['tourGuideProfile:id,user_id,verification_status'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Format response for mobile app
        $formattedData = $users->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar_url' => $user->avatar_url,
                'role' => $user->role,
                'status' => $user->status,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
                'tour_guide_profile' => $user->tourGuideProfile ? [
                    'verification_status' => $user->tourGuideProfile->verification_status,
                ] : null,
            ];
        });

        return response()->json(['data' => $formattedData]);
    }

    /**
     * Get single user details
     */
    public function show(User $user)
    {
        $user->load(['tourGuideProfile', 'renterProfile']);

        return response()->json($user);
    }

    public function verify(Request $request, User $user)
    {
        if ($user->role === 'tour_guide') {
            $user->tourGuideProfile()->update(['is_verified' => true]);
        } elseif ($user->role === 'renter') {
            $user->renterProfile()->update(['is_verified' => true]);
        } else {
            abort(422, 'Only tour guides and renters can be verified.');
        }

        return response()->json($user->fresh(['tourGuideProfile', 'renterProfile']));
    }

    public function updateStatus(Request $request, User $user)
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['active', 'suspended'])],
        ]);

        abort_if($user->role === 'admin', 422, 'Admin accounts cannot be suspended.');

        $user->update(['status' => $validated['status']]);

        return response()->json($user);
    }
}

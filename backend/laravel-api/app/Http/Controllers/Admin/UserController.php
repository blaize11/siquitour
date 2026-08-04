<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::query()
            ->when($request->query('role'), fn ($query, $role) => $query->where('role', $role))
            ->with(['tourGuideProfile', 'renterProfile'])
            ->latest()
            ->paginate(20);

        return response()->json($users);
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

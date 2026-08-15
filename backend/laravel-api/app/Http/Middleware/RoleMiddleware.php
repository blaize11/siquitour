<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * Usage in routes:
     * Route::middleware('role:guest')->post('/bookings', ...);
     * Route::middleware('role:tour_guide,renter')->get('/my-items', ...);
     *
     * @param \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response) $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // Get user's active role
        $activeRole = $user->activeRole?->name ?? $user->role;

        // Check if active role matches allowed roles
        if (!in_array($activeRole, $roles)) {
            return response()->json(
                [
                    'message' => 'Unauthorized',
                    'user_role' => $activeRole,
                    'required_roles' => $roles,
                ],
                403
            );
        }

        return $next($request);
    }
}

<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifiedGuide
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is authenticated
        if (!$request->user()) {
            return response()->json([
                'message' => 'Unauthenticated',
            ], 401);
        }

        // Check if user is a tour guide
        if ($request->user()->role !== 'tour_guide') {
            return response()->json([
                'message' => 'Only tour guides can access this resource',
            ], 403);
        }

        // Check if guide is verified
        $guide = $request->user()->tourGuideProfile;
        if (!$guide || $guide->verification_status !== 'approved') {
            return response()->json([
                'message' => 'Your account must be verified before you can access this resource',
                'verification_status' => $guide?->verification_status,
            ], 403);
        }

        return $next($request);
    }
}

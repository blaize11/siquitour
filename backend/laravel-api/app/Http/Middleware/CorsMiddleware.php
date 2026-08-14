<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CorsMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:8081',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:8081',
            'http://localhost:8000',
        ];

        $origin = $request->header('Origin');

        // Handle preflight OPTIONS requests first
        if ($request->isMethod('OPTIONS')) {
            if (in_array($origin, $allowedOrigins)) {
                return response('', 200)
                    ->header('Access-Control-Allow-Origin', $origin)
                    ->header('Access-Control-Allow-Credentials', 'true')
                    ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
                    ->header('Access-Control-Allow-Headers', 'DNT, User-Agent, X-Requested-With, If-Modified-Since, Cache-Control, Content-Type, Range, Authorization')
                    ->header('Access-Control-Max-Age', '1728000');
            }
            return response('', 403);
        }

        // Handle regular requests
        $response = $next($request);

        if (in_array($origin, $allowedOrigins)) {
            $response->header('Access-Control-Allow-Origin', $origin)
                ->header('Access-Control-Allow-Credentials', 'true')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'DNT, User-Agent, X-Requested-With, If-Modified-Since, Cache-Control, Content-Type, Range, Authorization')
                ->header('Access-Control-Max-Age', '1728000');
        }

        return $response;
    }
}

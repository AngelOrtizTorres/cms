<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class Cors
{
    public function handle(Request $request, Closure $next): Response
    {
        $allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:3001',
        ];

        $origin = $request->header('origin');
        $response = $next($request);

        // Agregar headers CORS si el origen está permitido
        if (in_array($origin, $allowedOrigins)) {
            $response->header('Access-Control-Allow-Origin', $origin)
                    ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
                    ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
                    ->header('Access-Control-Allow-Credentials', 'true')
                    ->header('Access-Control-Max-Age', '3600');
        }

        return $response;
    }
}

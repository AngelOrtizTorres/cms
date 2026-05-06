<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class SkipCsrfForAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Skip CSRF verification for auth-related routes
        if ($request->is('session/login', 'session/logout', 'register-admin', 'api/session/login', 'api/session/logout', 'api/auth/login', 'api/register-admin')) {
            return $next($request);
        }

        return $next($request);
    }
}

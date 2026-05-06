<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// Ruta raíz mínima para comprobar que la app está arriba
Route::get('/', function () {
    return response()->json(['message' => 'API running']);
});

// Sanctum CSRF cookie - required for session-based auth from SPA
Route::get('/sanctum/csrf-cookie', function () {
    \Illuminate\Support\Facades\Cookie::queue('XSRF-TOKEN', csrf_token(), 0, '/');
    return response()->noContent();
});

// Session-based auth endpoints for SPA (expects /sanctum/csrf-cookie first)
Route::post('/session/login', [AuthController::class, 'loginSession']);
Route::post('/session/logout', [AuthController::class, 'logoutSession']);
Route::post('/register-admin', [AuthController::class, 'registerAdmin']);
Route::get('/session/me', [AuthController::class, 'sessionMe']);

// Nota: las rutas API se declaran en routes/api.php y se cargan
// con el middleware y prefijo apropiados por la configuración de bootstrap.


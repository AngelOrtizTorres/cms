<?php

use Illuminate\Support\Facades\Route;
<<<<<<< HEAD
=======
use App\Http\Controllers\AuthController;
>>>>>>> main

// Ruta raíz mínima para comprobar que la app está arriba
Route::get('/', function () {
    return response()->json(['message' => 'API running']);
});

<<<<<<< HEAD
=======
// Session-based auth endpoints for SPA (expects /sanctum/csrf-cookie first)
Route::post('/session/login', [AuthController::class, 'loginSession']);
Route::post('/session/logout', [AuthController::class, 'logoutSession']);
Route::post('/register-admin', [AuthController::class, 'registerAdmin']);
Route::get('/session/me', [AuthController::class, 'sessionMe']);

// Nota: las rutas API se declaran en routes/api.php y se cargan
// con el middleware y prefijo apropiados por la configuración de bootstrap.

>>>>>>> main

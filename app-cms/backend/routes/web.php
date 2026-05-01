<?php

use Illuminate\Support\Facades\Route;

// Ruta raíz mínima para comprobar que la app está arriba
Route::get('/', function () {
    return response()->json(['message' => 'API running']);
});

// Nota: las rutas API se declaran en routes/api.php y se cargan
// con el middleware y prefijo apropiados por la configuración de bootstrap.


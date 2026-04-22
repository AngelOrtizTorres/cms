<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ArticleController;

Route::get('/', function () {
    return view('welcome');
});

// Incluir rutas API con prefijo /api/
Route::prefix('api')->group(function () {
    // Endpoint de prueba
    Route::get('/test', function () {
        return response()->json(['message' => 'API funcionando correctamente']);
    });

    // Artículos públicas
    Route::prefix('articles')->group(function () {
        Route::get('/', [ArticleController::class, 'index']);
        Route::get('/featured', [ArticleController::class, 'featured']);
        Route::get('/search', [ArticleController::class, 'search']);
        Route::get('/section/{sectionId}', [ArticleController::class, 'bySection']);
        Route::get('/tag/{tagId}', [ArticleController::class, 'byTag']);
        Route::get('/{slug}', [ArticleController::class, 'bySlug']);
    });
});


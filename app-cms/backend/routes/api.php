<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\AuthController;

// Endpoint de prueba
Route::get('/test', function () {
	return response()->json(['message' => 'API funcionando correctamente']);
});

// Autenticación (login/logout/me) - token simple
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/logout', [AuthController::class, 'logout']);
Route::get('/auth/me', [AuthController::class, 'me']);

// Artículos públicas
Route::prefix('articles')->group(function () {
	Route::get('/', [ArticleController::class, 'index']);
	Route::get('/featured', [ArticleController::class, 'featured']);
	Route::get('/search', [ArticleController::class, 'search']);
	Route::get('/section/{sectionId}', [ArticleController::class, 'bySection']);
	Route::get('/tag/{tagId}', [ArticleController::class, 'byTag']);
	Route::get('/{slug}', [ArticleController::class, 'bySlug']);
});


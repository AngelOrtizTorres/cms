<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SiteController;
use App\Http\Controllers\UserController;

// Endpoint de prueba
Route::get('/test', function () {
	return response()->json(['message' => 'API funcionando correctamente']);
});

// Autenticación (login/logout/me) - token simple
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/logout', [AuthController::class, 'logout']);
Route::get('/auth/me', [AuthController::class, 'me']);
// Comprueba si ya existe un administrador (frontend lo usa para ocultar registro)
Route::get('/admin-exists', [AuthController::class, 'adminExists']);
// Forgot/reset password via API (Fortify-compatible)
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

// Artículos públicas
Route::prefix('articles')->group(function () {
	Route::get('/', [ArticleController::class, 'index']);
	Route::get('/featured', [ArticleController::class, 'featured']);
	Route::get('/search', [ArticleController::class, 'search']);
	Route::get('/section/{sectionId}', [ArticleController::class, 'bySection']);
	Route::get('/tag/{tagId}', [ArticleController::class, 'byTag']);
	Route::get('/{slug}', [ArticleController::class, 'bySlug']);
});

// Sites (Webs) - lightweight JSON-backed implementation
Route::get('/sites', [SiteController::class, 'index']);
Route::get('/sites/{id}', [SiteController::class, 'show']);
Route::post('/sites', [SiteController::class, 'store']);
Route::put('/sites/{id}', [SiteController::class, 'update']);
Route::delete('/sites/{id}', [SiteController::class, 'destroy']);
Route::get('/sites/{id}/capabilities', [SiteController::class, 'capabilities']);

// Users management
Route::get('/users', [UserController::class, 'index']);
Route::put('/users/{id}', [UserController::class, 'update']);
Route::delete('/users/{id}', [UserController::class, 'destroy']);


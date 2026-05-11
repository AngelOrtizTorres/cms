<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SiteController;
use App\Http\Controllers\SectionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\BannerController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\SettingsController;

// Endpoint de prueba
Route::get('/test', function () {
	return response()->json(['message' => 'API funcionando correctamente']);
});

// Sanctum CSRF cookie alias - ensure `/api/sanctum/csrf-cookie` also works
Route::get('/sanctum/csrf-cookie', function () {
	\Illuminate\Support\Facades\Cookie::queue('XSRF-TOKEN', csrf_token(), 0, '/');
	return response()->noContent();
});

// Autenticación (login/logout/me) - token simple
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/logout', [AuthController::class, 'logout']);
Route::get('/auth/me', [AuthController::class, 'me']);
// Also expose session-based endpoints under /api/session/* as an alias
// so clients accidentally calling /api/session/* still reach the session handlers.
Route::post('/session/login', [AuthController::class, 'loginSession']);
Route::post('/session/logout', [AuthController::class, 'logoutSession']);
Route::get('/session/me', [AuthController::class, 'sessionMe']);
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
	Route::post('/', [ArticleController::class, 'store']); // Create
	Route::get('/{slug}', [ArticleController::class, 'bySlug']);
	Route::put('/{id}', [ArticleController::class, 'update']); // Update by ID
	Route::delete('/{id}', [ArticleController::class, 'destroy']); // Delete
});

// Sites (Webs) - lightweight JSON-backed implementation
Route::get('/sites', [SiteController::class, 'index']);
Route::get('/sites/{id}', [SiteController::class, 'show']);
Route::post('/sites', [SiteController::class, 'store']);
Route::put('/sites/{id}', [SiteController::class, 'update']);
Route::delete('/sites/{id}', [SiteController::class, 'destroy']);
Route::get('/sites/{id}/capabilities', [SiteController::class, 'capabilities']);

// Sections (categorías) - CRUD básico para el panel
Route::get('/sections', [SectionController::class, 'index']);
Route::get('/sections/{id}', [SectionController::class, 'show']);
Route::post('/sections', [SectionController::class, 'store']);
Route::put('/sections/{id}', [SectionController::class, 'update']);
Route::delete('/sections/{id}', [SectionController::class, 'destroy']);

// Users management
Route::get('/users', [UserController::class, 'index']);
Route::post('/users', [UserController::class, 'store']);
Route::put('/users/{id}', [UserController::class, 'update']);
Route::delete('/users/{id}', [UserController::class, 'destroy']);

// News (noticias) - endpoints para listado y CRUD (incluye rutas por sitio)
Route::get('/news', [NewsController::class, 'index']);
Route::post('/news', [NewsController::class, 'store']);
Route::get('/news/{id}', [NewsController::class, 'show']);
Route::put('/news/{id}', [NewsController::class, 'update']);
Route::delete('/news/{id}', [NewsController::class, 'destroy']);

Route::get('/sites/{siteId}/news', [NewsController::class, 'siteIndex']);
Route::post('/sites/{siteId}/news', [NewsController::class, 'siteStore']);

// Banners
Route::get('/banners', [BannerController::class, 'index']);
Route::get('/banners/{position}', [BannerController::class, 'byPosition']);
Route::post('/banners', [BannerController::class, 'store']);
Route::put('/banners/{id}', [BannerController::class, 'update']);
Route::delete('/banners/{id}', [BannerController::class, 'destroy']);
Route::get('/sites/{siteId}/banners', [BannerController::class, 'siteIndex']);
Route::post('/sites/{siteId}/banners', [BannerController::class, 'siteStore']);

// Sections por sitio (acepta id numérico o slug)
Route::get('/sites/{siteId}/sections', [SectionController::class, 'index']);
Route::post('/sites/{siteId}/sections', [SectionController::class, 'store']);

// Media
Route::get('/media', [MediaController::class, 'index']);
Route::post('/media', [MediaController::class, 'store']);
Route::delete('/media/{id}', [MediaController::class, 'destroy']);

// Contact / Messages
Route::post('/contact', [ContactController::class, 'store']);
Route::get('/contact/messages', [ContactController::class, 'index']);
Route::delete('/contact/messages/{id}', [ContactController::class, 'destroy']);

// Settings / Homepage
Route::get('/settings', [SettingsController::class, 'index']);
Route::put('/settings', [SettingsController::class, 'update']);
Route::get('/homepage', [SettingsController::class, 'getHomepage']);
Route::put('/homepage', [SettingsController::class, 'updateHomepage']);

// Tags (list + articles by tag slug)
Route::get('/tags', [TagController::class, 'index']);
Route::get('/tags/{slug}', [TagController::class, 'show']);
// Site-scoped tags
Route::get('/sites/{siteId}/tags', [TagController::class, 'siteIndex']);
Route::post('/sites/{siteId}/tags', [TagController::class, 'siteStore']);

// Search (top-level alias)
Route::get('/search', [ArticleController::class, 'search']);




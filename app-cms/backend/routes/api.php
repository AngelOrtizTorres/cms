<?php
<<<<<<< HEAD
=======

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SiteController;
use App\Http\Controllers\SectionController;
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
>>>>>>> main

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{
    ArticleController,
    AuthController,
    BannerController,
    ContactController,
    SearchController,
    SectionController,
    TagController,
    UserController,
    WebsiteController
};

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/

Route::get('/', fn () => response()->json(['message' => 'CMS API']));
Route::get('/test', fn () => response()->json(['message' => 'API OK']));

Route::post('/auth/login', [AuthController::class, 'login']);

Route::get('/articles', [ArticleController::class, 'index']);
Route::get('/articles/featured', [ArticleController::class, 'featured']);
Route::get('/articles/{slug}', [ArticleController::class, 'bySlug']);

// Sections, Tags, Banners (singular resources used by frontend)
Route::get('/sections/{slug}', [SectionController::class, 'bySlug']);
Route::get('/categories/{slug}', [SectionController::class, 'bySlug']);
Route::get('/tags/{slug}', [TagController::class, 'bySlug']);
Route::get('/banners/{position}', [BannerController::class, 'byPosition']);

// Settings & Homepage (public read)
Route::get('/settings', [\App\Http\Controllers\SettingsController::class, 'show']);
Route::get('/homepage', [\App\Http\Controllers\SettingsController::class, 'homepage']);

// Allow public access to websites listing (frontend uses fallback when unauthenticated)
Route::get('/websites', [WebsiteController::class, 'index']);

Route::get('/sections', [SectionController::class, 'index']);
Route::get('/categories', [SectionController::class, 'index']);
Route::get('/tags', [TagController::class, 'index']);
Route::get('/banners', [BannerController::class, 'index']);
Route::get('/search', [SearchController::class, 'search']);

Route::post('/contact', [ContactController::class, 'send']);

/*
|--------------------------------------------------------------------------
| AUTH ROUTES
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::post('/articles', [ArticleController::class, 'store']);
    Route::put('/articles/{id}', [ArticleController::class, 'update']);
    Route::delete('/articles/{id}', [ArticleController::class, 'destroy']);

    // Websites
    Route::get('/websites', [WebsiteController::class, 'index']);
    Route::get('/websites/{id}', [WebsiteController::class, 'show']);
    Route::post('/websites', [WebsiteController::class, 'store']);
    Route::put('/websites/{id}', [WebsiteController::class, 'update']);
    Route::delete('/websites/{id}', [WebsiteController::class, 'destroy']);

	Route::post('/sections', [SectionController::class, 'store']);
	Route::put('/sections/{id}', [SectionController::class, 'update']);
	Route::delete('/sections/{id}', [SectionController::class, 'destroy']);

    Route::post('/categories', [SectionController::class, 'store']);
    Route::put('/categories/{id}', [SectionController::class, 'update']);
    Route::delete('/categories/{id}', [SectionController::class, 'destroy']);

	Route::post('/tags', [TagController::class, 'store']);
	Route::put('/tags/{id}', [TagController::class, 'update']);
	Route::delete('/tags/{id}', [TagController::class, 'destroy']);

	Route::post('/banners', [BannerController::class, 'store']);
	Route::put('/banners/{id}', [BannerController::class, 'update']);
	Route::delete('/banners/{id}', [BannerController::class, 'destroy']);

    Route::put('/users/{id}', [UserController::class, 'update']);
});

/*
|--------------------------------------------------------------------------
| ADMIN (SPATIE ROLE)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {

    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);

    Route::get('/contact/messages', [ContactController::class, 'messages']);
    Route::delete('/contact/messages/{id}', [ContactController::class, 'destroyMessage']);
});

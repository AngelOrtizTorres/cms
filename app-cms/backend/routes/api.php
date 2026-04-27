<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{
    ArticleController,
    AuthController,
    BannerController,
    ContactController,
    SearchController,
    SectionController,
    TagController,
    UserController
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

Route::get('/sections', [SectionController::class, 'index']);
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

	Route::post('/sections', [SectionController::class, 'store']);
	Route::put('/sections/{id}', [SectionController::class, 'update']);
	Route::delete('/sections/{id}', [SectionController::class, 'destroy']);

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
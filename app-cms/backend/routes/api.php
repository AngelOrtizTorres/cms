<?php

use App\Http\Controllers\ArticleController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BannerController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\SectionController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
	return response()->json([
		'message' => 'CMS API endpoints',
		'base' => '/api',
		'endpoints' => [
			['method' => 'GET', 'path' => '/articles', 'auth' => false],
			['method' => 'GET', 'path' => '/articles/{slug}', 'auth' => false],
			['method' => 'GET', 'path' => '/articles/featured', 'auth' => false],
			['method' => 'POST', 'path' => '/articles', 'auth' => true],
			['method' => 'PUT', 'path' => '/articles/{id}', 'auth' => true],
			['method' => 'DELETE', 'path' => '/articles/{id}', 'auth' => true],

			['method' => 'GET', 'path' => '/sections', 'auth' => false],
			['method' => 'GET', 'path' => '/sections/{slug}', 'auth' => false],
			['method' => 'POST', 'path' => '/sections', 'auth' => true],
			['method' => 'PUT', 'path' => '/sections/{id}', 'auth' => true],
			['method' => 'DELETE', 'path' => '/sections/{id}', 'auth' => true],

			['method' => 'GET', 'path' => '/tags', 'auth' => false],
			['method' => 'GET', 'path' => '/tags/{slug}', 'auth' => false],
			['method' => 'POST', 'path' => '/tags', 'auth' => true],
			['method' => 'PUT', 'path' => '/tags/{id}', 'auth' => true],
			['method' => 'DELETE', 'path' => '/tags/{id}', 'auth' => true],

			['method' => 'GET', 'path' => '/banners', 'auth' => false],
			['method' => 'GET', 'path' => '/banners/{position}', 'auth' => false],
			['method' => 'POST', 'path' => '/banners', 'auth' => true],
			['method' => 'PUT', 'path' => '/banners/{id}', 'auth' => true],
			['method' => 'DELETE', 'path' => '/banners/{id}', 'auth' => true],

			['method' => 'GET', 'path' => '/search', 'auth' => false],

			['method' => 'GET', 'path' => '/auth/me', 'auth' => true],

			['method' => 'GET', 'path' => '/users', 'auth' => true, 'admin' => true],
			['method' => 'POST', 'path' => '/users', 'auth' => true, 'admin' => true],
			['method' => 'PUT', 'path' => '/users/{id}', 'auth' => true],
			['method' => 'DELETE', 'path' => '/users/{id}', 'auth' => true, 'admin' => true],

			['method' => 'POST', 'path' => '/contact', 'auth' => false],
			['method' => 'GET', 'path' => '/contact/messages', 'auth' => true, 'admin' => true],
			['method' => 'DELETE', 'path' => '/contact/messages/{id}', 'auth' => true, 'admin' => true],
		],
	]);
});

Route::get('/test', function () {
	return response()->json(['message' => 'API funcionando correctamente']);
});

// Public endpoints
Route::get('/articles', [ArticleController::class, 'index']);
Route::get('/articles/featured', [ArticleController::class, 'featured']);
Route::get('/articles/{slug}', [ArticleController::class, 'bySlug']);

Route::get('/sections', [SectionController::class, 'index']);
Route::get('/sections/{slug}', [SectionController::class, 'bySlug']);

Route::get('/tags', [TagController::class, 'index']);
Route::get('/tags/{slug}', [TagController::class, 'bySlug']);

Route::get('/banners', [BannerController::class, 'index']);
Route::get('/banners/{position}', [BannerController::class, 'byPosition']);

Route::get('/search', [SearchController::class, 'search']);
Route::post('/contact', [ContactController::class, 'send']);

// Authenticated endpoints
Route::middleware('auth')->group(function () {
	Route::get('/auth/me', [AuthController::class, 'me']);

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

	// Admin-only endpoints
	Route::middleware('admin')->group(function () {
		Route::get('/users', [UserController::class, 'index']);
		Route::post('/users', [UserController::class, 'store']);
		Route::delete('/users/{id}', [UserController::class, 'destroy']);

		Route::get('/contact/messages', [ContactController::class, 'messages']);
		Route::delete('/contact/messages/{id}', [ContactController::class, 'destroyMessage']);
	});
});


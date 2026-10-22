<?php

use App\Http\Controllers\Auth\SocialController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => redirect()->away(config('app.frontend_url')));

// The redirect sign-ins leave and re-enter the browser, so they are session routes,
// not JSON ones: they need the full web stack whatever origin the listener arrives from.
Route::get('/auth/{provider}/redirect', [SocialController::class, 'redirect']);
Route::get('/auth/{provider}/callback', [SocialController::class, 'callback']);

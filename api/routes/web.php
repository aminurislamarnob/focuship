<?php

use App\Http\Controllers\Auth\SignInPageController;
use App\Http\Controllers\Auth\SocialController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => redirect()->away(config('app.frontend_url')));

// The redirect sign-ins leave and re-enter the browser, so they are session routes,
// not JSON ones: they need the full web stack whatever origin the listener arrives from.
Route::get('/auth/{provider}/redirect', [SocialController::class, 'redirect']);
Route::get('/auth/{provider}/callback', [SocialController::class, 'callback']);

// Signing in on this origin, for the MCP consent flow. Named `login` because that is
// where Laravel sends a guest who lands on /oauth/authorize.
Route::get('/sign-in', [SignInPageController::class, 'show'])->name('sign-in');
Route::get('/login', fn (Request $request) => redirect()->route('sign-in', ['next' => $request->fullUrl()]))->name('login');
Route::post('/sign-in/code', [SignInPageController::class, 'sendCode'])
    ->middleware('throttle:email-code')->name('sign-in.code');
Route::post('/sign-in/verify', [SignInPageController::class, 'verifyCode'])
    ->middleware('throttle:email-verify')->name('sign-in.verify');

<?php

use App\Http\Controllers\Auth\EmailCodeController;
use App\Http\Controllers\Auth\SessionController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => ['status' => 'ok']);

// Sign-in. Public by necessity, so every route here is throttled (see AppServiceProvider).
Route::post('/auth/email/code', [EmailCodeController::class, 'send'])->middleware('throttle:email-code');
Route::post('/auth/email/verify', [EmailCodeController::class, 'verify'])->middleware('throttle:email-verify');

Route::get('/auth/me', [SessionController::class, 'show']);
Route::post('/auth/sign-out', [SessionController::class, 'destroy']);

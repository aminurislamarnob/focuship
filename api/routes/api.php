<?php

use App\Http\Controllers\Account\ConnectedAppController;
use App\Http\Controllers\Account\DeleteAccountController;
use App\Http\Controllers\Account\FavoriteController;
use App\Http\Controllers\Account\PresetController;
use App\Http\Controllers\Account\SettingsController;
use App\Http\Controllers\Auth\EmailCodeController;
use App\Http\Controllers\Auth\GoogleTokenController;
use App\Http\Controllers\Auth\SessionController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => ['status' => 'ok']);

// Sign-in. Public by necessity, so every route here is throttled (see AppServiceProvider).
Route::post('/auth/email/code', [EmailCodeController::class, 'send'])->middleware('throttle:email-code');
Route::post('/auth/email/verify', [EmailCodeController::class, 'verify'])->middleware('throttle:email-verify');

Route::post('/auth/google/token', GoogleTokenController::class)->middleware('throttle:email-verify');

Route::get('/auth/me', [SessionController::class, 'show']);
Route::post('/auth/sign-out', [SessionController::class, 'destroy']);

// A preset someone shared: public by its owner's choice, so no account needed.
Route::get('/presets/{id}', [PresetController::class, 'shared']);

// The listener's own library. Everything here is theirs alone.
Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    Route::get('/account/presets', [PresetController::class, 'index']);
    Route::post('/account/presets', [PresetController::class, 'store']);
    Route::patch('/account/presets/{id}', [PresetController::class, 'update']);
    Route::delete('/account/presets/{id}', [PresetController::class, 'destroy']);

    Route::get('/account/favorites', [FavoriteController::class, 'index']);
    Route::post('/account/favorites', [FavoriteController::class, 'store']);
    Route::delete('/account/favorites/{ref}', [FavoriteController::class, 'destroy']);

    Route::get('/account/settings', [SettingsController::class, 'show']);
    Route::put('/account/settings', [SettingsController::class, 'update']);

    Route::get('/account/connected-apps', [ConnectedAppController::class, 'index']);
    Route::delete('/account/connected-apps/{client}', [ConnectedAppController::class, 'destroy']);

    Route::delete('/account', DeleteAccountController::class);
});

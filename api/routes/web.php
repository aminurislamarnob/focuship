<?php

use Illuminate\Support\Facades\Route;

Route::get('/', fn () => redirect()->away(config('app.frontend_url')));

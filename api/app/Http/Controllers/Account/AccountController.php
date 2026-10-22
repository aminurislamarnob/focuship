<?php

namespace App\Http\Controllers\Account;

use App\Account\Library;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

/** A controller acting on the signed-in listener's library. */
abstract class AccountController extends Controller
{
    protected function library(Request $request): Library
    {
        /** @var User $user */
        $user = $request->user();

        return $user->library();
    }
}

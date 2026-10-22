<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

/**
 * Deleting the account: the listener, everything they saved, and every way back in.
 * Deliberately not reachable from the MCP (ADR 0004).
 */
class DeleteAccountController extends Controller
{
    public function __invoke(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        auth()->guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // The route's own guard (sanctum) still holds the listener until it is forgotten.
        Auth::forgetGuards();

        // Presets, favorites, settings and identities all cascade from the user row.
        $user->delete();

        return response()->noContent();
    }
}

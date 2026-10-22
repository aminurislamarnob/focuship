<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

/**
 * Who is signed in, and signing out. The site reads this on load, so it answers
 * for guests too rather than 401-ing.
 */
class SessionController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        /** @var User|null $user */
        $user = $request->user();

        return response()->json(['user' => $user?->toCloudUser()]);
    }

    public function destroy(Request $request): Response
    {
        auth()->guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // The route's own guard (sanctum) still holds the listener until it is forgotten.
        Auth::forgetGuards();

        return response()->noContent();
    }
}

<?php

namespace App\Http\Controllers\Auth;

use App\Auth\Accounts;
use App\Auth\GoogleIdToken;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/**
 * Signing in with the ID token from Google's own button, so Google's consent screen
 * names focuship.app rather than a third party.
 */
class GoogleTokenController extends Controller
{
    public function __invoke(Request $request, GoogleIdToken $tokens, Accounts $accounts): JsonResponse
    {
        $fields = $request->validate([
            'token' => ['required', 'string'],
            'nonce' => ['required', 'string'],
        ]);

        $claims = $tokens->verify($fields['token'], $fields['nonce']);

        if ($claims === null) {
            throw ValidationException::withMessages([
                'token' => 'Couldn’t sign in with Google. Try again.',
            ]);
        }

        $user = $accounts->forProvider('google', $claims['sub'], $claims['email'], $claims['name'], $claims['picture']);

        $request->session()->regenerate();
        auth()->login($user, remember: true);

        return response()->json(['user' => $user->toCloudUser()]);
    }
}

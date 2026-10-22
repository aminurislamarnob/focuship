<?php

namespace App\Http\Controllers\Auth;

use App\Auth\Accounts;
use App\Auth\EmailCodes;
use App\Auth\Turnstile;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;

/**
 * Signing in with a 6-digit code emailed to the listener: the way in without a
 * social account.
 */
class EmailCodeController extends Controller
{
    public function send(Request $request, Turnstile $turnstile, EmailCodes $codes): Response
    {
        $fields = $request->validate([
            'email' => ['required', 'email:rfc', 'max:254'],
            'turnstile' => ['nullable', 'string'],
        ]);

        if (! $turnstile->passes($fields['turnstile'] ?? null, $request->ip())) {
            throw ValidationException::withMessages([
                'turnstile' => 'The security check didn’t pass. Try again.',
            ]);
        }

        $codes->send($fields['email']);

        return response()->noContent();
    }

    public function verify(Request $request, EmailCodes $codes, Accounts $accounts): JsonResponse
    {
        $fields = $request->validate([
            'email' => ['required', 'email:rfc', 'max:254'],
            'code' => ['required', 'string'],
        ]);

        if (! $codes->consume($fields['email'], $fields['code'])) {
            throw ValidationException::withMessages([
                'code' => 'That code is wrong or has expired. Ask for a new one.',
            ]);
        }

        $user = $accounts->forEmail($fields['email']);

        $request->session()->regenerate();
        auth()->login($user, remember: true);

        return response()->json(['user' => $user->toCloudUser()]);
    }
}

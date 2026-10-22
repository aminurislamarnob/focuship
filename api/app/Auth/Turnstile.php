<?php

namespace App\Auth;

use Illuminate\Support\Facades\Http;

/**
 * Cloudflare Turnstile, the security check in front of emailed sign-in codes.
 *
 * Verified server-side so a bot cannot mail codes to strangers. With no secret
 * configured (local development, CI) the check passes and nothing is called.
 */
class Turnstile
{
    private const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

    public function passes(?string $token, ?string $ip = null): bool
    {
        $secret = config('services.turnstile.secret');

        if (blank($secret)) {
            return true;
        }

        if (blank($token)) {
            return false;
        }

        $response = Http::asForm()
            ->timeout(10)
            ->post(self::VERIFY_URL, array_filter([
                'secret' => $secret,
                'response' => $token,
                'remoteip' => $ip,
            ]));

        return $response->successful() && $response->json('success') === true;
    }
}

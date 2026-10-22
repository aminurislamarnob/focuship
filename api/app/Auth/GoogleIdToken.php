<?php

namespace App\Auth;

use Firebase\JWT\JWK;
use Firebase\JWT\JWT;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * Verifies the ID token Google's own sign-in button hands the page.
 *
 * Google signs the token; we check the signature against Google's published keys,
 * that it was issued for this app, that it has not expired, that the address is
 * verified, and that the nonce matches the one the page generated (so a token
 * captured elsewhere cannot be replayed here).
 */
class GoogleIdToken
{
    private const CERTS_URL = 'https://www.googleapis.com/oauth2/v3/certs';

    private const ISSUERS = ['accounts.google.com', 'https://accounts.google.com'];

    /** @return array{sub: string, email: string, name: string|null, picture: string|null}|null */
    public function verify(string $token, string $nonce): ?array
    {
        $clientId = (string) config('services.google.client_id');

        if ($clientId === '') {
            return null;
        }

        try {
            /** @var array<string, mixed> $claims */
            $claims = (array) JWT::decode($token, JWK::parseKeySet($this->keys()));
        } catch (Throwable) {
            return null;
        }

        $audience = $claims['aud'] ?? null;
        $issuer = $claims['iss'] ?? null;
        $verified = $claims['email_verified'] ?? false;
        $email = $claims['email'] ?? null;

        if ($audience !== $clientId || ! in_array($issuer, self::ISSUERS, true)) {
            return null;
        }

        if (! filled($email) || $verified !== true && $verified !== 'true') {
            return null;
        }

        // Google stores the SHA-256 of the nonce the page generated, never the nonce itself.
        if (! isset($claims['nonce']) || ! hash_equals((string) $claims['nonce'], hash('sha256', $nonce))) {
            return null;
        }

        return [
            'sub' => (string) $claims['sub'],
            'email' => (string) $email,
            'name' => isset($claims['name']) ? (string) $claims['name'] : null,
            'picture' => isset($claims['picture']) ? (string) $claims['picture'] : null,
        ];
    }

    /** Google's signing keys, cached for an hour as their cache headers suggest. */
    /** @return array<string, mixed> */
    private function keys(): array
    {
        /** @var array<string, mixed> $keys */
        $keys = Cache::remember(
            'google-oauth-certs',
            now()->addHour(),
            fn () => Http::timeout(10)->get(self::CERTS_URL)->json()
        );

        return $keys;
    }
}

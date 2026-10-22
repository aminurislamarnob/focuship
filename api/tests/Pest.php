<?php

use App\Mail\SignInCode;
use App\Models\User;
use Firebase\JWT\JWT;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Laravel\Socialite\Contracts\Provider as SocialiteProvider;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Tests\TestCase;

pest()->extend(TestCase::class)->in('Unit');

pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Feature');

/**
 * Headers a browser on the site sends to the API, so Sanctum treats the request as
 * stateful (cookie session) exactly as it does in production.
 *
 * @return array<string, string>
 */
function fromSite(): array
{
    return [
        'Origin' => 'http://localhost:3000',
        'Referer' => 'http://localhost:3000/',
        'Accept' => 'application/json',
    ];
}

function listener(array $attributes = []): User
{
    return User::factory()->create($attributes);
}

/** Cloudflare's Turnstile endpoint, answering the way it does for a real visitor. */
function passTurnstile(): void
{
    fakeTurnstile(true);
}

/** Turnstile rejecting the token, the way it answers a bot. */
function failTurnstile(): void
{
    fakeTurnstile(false);
}

/**
 * Cloudflare's siteverify endpoint. The verdict is read at call time, so a test can
 * overturn the default set in beforeEach.
 */
function fakeTurnstile(bool $success): void
{
    config(['services.turnstile.secret' => 'test-secret', 'testing.turnstile' => $success]);

    Http::fake(['challenges.cloudflare.com/*' => fn () => Http::response(
        config('testing.turnstile')
            ? ['success' => true]
            : ['success' => false, 'error-codes' => ['invalid-input-response']]
    )]);
}

/** Asks for a sign-in code and reads it out of the email, as the listener does. */
function requestCode(string $email): string
{
    test()->postJson('/auth/email/code', ['email' => $email, 'turnstile' => 'ok'], fromSite())->assertNoContent();

    $code = null;
    Mail::assertSent(SignInCode::class, function (SignInCode $mail) use (&$code) {
        $code = $mail->code;

        return true;
    });

    return (string) $code;
}

// Google sign-in -------------------------------------------------------------
// A throwaway RSA key stands in for Google's: tokens are signed with it and the
// certs endpoint publishes its public half, so verification runs for real.

function googleSigningKey(): array
{
    static $key;

    return $key ??= (function () {
        $resource = openssl_pkey_new(['private_key_bits' => 2048, 'private_key_type' => OPENSSL_KEYTYPE_RSA]);
        openssl_pkey_export($resource, $private);
        $details = openssl_pkey_get_details($resource);

        return ['private' => $private, 'n' => $details['rsa']['n'], 'e' => $details['rsa']['e']];
    })();
}

function fakeGoogleKeys(): void
{
    $key = googleSigningKey();
    $base64url = fn (string $bytes) => rtrim(strtr(base64_encode($bytes), '+/', '-_'), '=');

    Cache::forget('google-oauth-certs');
    Http::fake([
        'googleapis.com/oauth2/v3/certs' => Http::response([
            'keys' => [[
                'kty' => 'RSA',
                'alg' => 'RS256',
                'use' => 'sig',
                'kid' => 'focuship-test',
                'n' => $base64url($key['n']),
                'e' => $base64url($key['e']),
            ]],
        ]),
    ]);
}

/** An ID token shaped like Google's, signed by the test key unless told otherwise. */
function googleIdToken(array $claims = [], ?string $signWith = null): string
{
    $claims = array_merge([
        'iss' => 'https://accounts.google.com',
        'aud' => config('services.google.client_id'),
        'sub' => 'google-'.fake()->randomNumber(5),
        'email_verified' => true,
        'nonce' => hash('sha256', 'n-1'),
        'iat' => now()->subMinute()->timestamp,
        'exp' => now()->addHour()->timestamp,
    ], $claims);

    if ($signWith !== null) {
        // Someone else's key: correctly shaped, but not signed by Google.
        openssl_pkey_export(openssl_pkey_new(['private_key_bits' => 2048, 'private_key_type' => OPENSSL_KEYTYPE_RSA]), $other);

        return JWT::encode($claims, $other, 'RS256', 'focuship-test');
    }

    return JWT::encode($claims, googleSigningKey()['private'], 'RS256', 'focuship-test');
}

// Redirect sign-ins ----------------------------------------------------------

/** Stands in for the provider: both the hop out and the listener who comes back. */
function fakeSocialite(string $provider, array $attributes): void
{
    $user = (new SocialiteUser)->map([
        'id' => $attributes['id'] ?? 'x-1',
        'nickname' => $attributes['nickname'] ?? null,
        'name' => $attributes['name'] ?? null,
        'email' => $attributes['email'] ?? null,
        'avatar' => $attributes['avatar'] ?? null,
    ]);

    $driver = Mockery::mock(SocialiteProvider::class);
    $driver->shouldReceive('redirect')->andReturn(redirect()->away("https://{$provider}.com/login/oauth/authorize"));
    $driver->shouldReceive('user')->andReturn($user);

    Socialite::shouldReceive('driver')->with($provider)->andReturn($driver);
}

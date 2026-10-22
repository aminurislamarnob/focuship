<?php

use App\Mail\SignInCode;
use App\Models\User;
use Firebase\JWT\JWT;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Testing\TestResponse;
use Laravel\Passport\Client;
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

// The MCP ---------------------------------------------------------------------
// Tests drive it the way a real client does: JSON-RPC over HTTP with a Passport
// token, never by reaching into the server's tool classes.

/** An AI client that has registered itself, as the MCP spec lets any client do. */
function registerMcpClient(string $name = 'Claude'): Client
{
    $response = test()->postJson('/oauth/register', [
        'client_name' => $name,
        'redirect_uris' => ['https://claude.ai/api/mcp/auth_callback'],
        'grant_types' => ['authorization_code', 'refresh_token'],
    ])->assertCreated();

    return Client::findOrFail($response->json('client_id'));
}

function authorizeUrl(Client $client, string $verifier = 'focuship-test-code-verifier-long-enough-for-rfc-7636', string $state = 'test-state'): string
{
    return '/oauth/authorize?'.http_build_query([
        'client_id' => $client->getKey(),
        'redirect_uri' => MCP_REDIRECT_URI,
        'response_type' => 'code',
        'scope' => 'mcp:use',
        'state' => $state,
        'code_challenge' => rtrim(strtr(base64_encode(hash('sha256', $verifier, true)), '+/', '-_'), '='),
        'code_challenge_method' => 'S256',
    ]);
}

const MCP_REDIRECT_URI = 'https://claude.ai/api/mcp/auth_callback';

/**
 * The access token an AI client holds after the listener approved it: registration,
 * consent and the PKCE exchange, run for real. Cached per listener so a test that
 * makes many calls does the dance once.
 *
 * @return array{access_token: string, refresh_token: string, expires_in: int}
 */
function connectMcpClient(User $user, string $name = 'Claude'): array
{
    $verifier = 'focuship-test-code-verifier-long-enough-for-rfc-7636';
    $client = registerMcpClient($name);

    // The listener sees the consent screen, then presses Allow.
    test()->actingAs($user)->get(authorizeUrl($client, $verifier))->assertOk();

    $approved = test()->actingAs($user)->post('/oauth/authorize', [
        'client_id' => $client->getKey(),
        'auth_token' => session('authToken'),
        'state' => 'test-state',
    ]);

    parse_str((string) parse_url((string) $approved->headers->get('Location'), PHP_URL_QUERY), $query);

    $token = test()->postJson('/oauth/token', [
        'grant_type' => 'authorization_code',
        'client_id' => $client->getKey(),
        'redirect_uri' => MCP_REDIRECT_URI,
        'code_verifier' => $verifier,
        'code' => $query['code'] ?? '',
    ])->assertOk()->json();

    return $token;
}

/** @var array<int, string> */
$GLOBALS['mcpTokens'] = [];

function mcpToken(User $user): string
{
    return $GLOBALS['mcpTokens'][$user->id] ??= connectMcpClient($user)['access_token'];
}

/** The tool names a connected client is offered. */
function mcpToolNames(User $user): array
{
    $response = test()->mcp($user, 'tools/list');

    return collect(TestCase::class)->pipe(
        fn () => collect(json_decode(json_encode(mcpPayload($response)), true)['result']['tools'] ?? [])
            ->pluck('name')
            ->all()
    );
}

function mcpPayload(TestResponse $response): array
{
    $body = $response->getContent() ?: '';

    if (str_contains($body, 'data: ')) {
        $body = collect(explode("\n", $body))
            ->filter(fn (string $line) => str_starts_with($line, 'data: '))
            ->map(fn (string $line) => substr($line, 6))
            ->implode('');
    }

    return json_decode($body, true) ?: [];
}

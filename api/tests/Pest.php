<?php

use App\Mail\SignInCode;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
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

<?php

use App\Mail\SignInCode;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;

beforeEach(function () {
    Mail::fake();
    passTurnstile();
});

it('emails a six-digit code to a listener who wants to sign in', function () {
    $this->postJson('/auth/email/code', ['email' => 'Ada@Example.com', 'turnstile' => 'ok'], fromSite())
        ->assertNoContent();

    Mail::assertSent(SignInCode::class, function (SignInCode $mail) {
        return $mail->hasTo('ada@example.com') && preg_match('/^\d{6}$/', $mail->code) === 1;
    });
});

it('refuses to send without passing the security check', function () {
    failTurnstile();

    $this->postJson('/auth/email/code', ['email' => 'ada@example.com', 'turnstile' => 'nope'], fromSite())
        ->assertStatus(422)
        ->assertJsonValidationErrors('turnstile');

    Mail::assertNothingSent();
});

it('refuses an address that is not an email', function () {
    $this->postJson('/auth/email/code', ['email' => 'not-an-email', 'turnstile' => 'ok'], fromSite())
        ->assertStatus(422)
        ->assertJsonValidationErrors('email');
});

it('signs in and creates the account on the first correct code', function () {
    $code = requestCode('ada@example.com');

    $this->postJson('/auth/email/verify', ['email' => 'ada@example.com', 'code' => $code], fromSite())
        ->assertOk()
        ->assertJsonPath('user.email', 'ada@example.com');

    $this->assertAuthenticated();
    expect(User::where('email', 'ada@example.com')->exists())->toBeTrue();
});

it('signs an existing listener back into the same account', function () {
    $existing = listener(['email' => 'ada@example.com']);
    $code = requestCode('ada@example.com');

    $this->postJson('/auth/email/verify', ['email' => 'ada@example.com', 'code' => $code], fromSite())
        ->assertOk()
        ->assertJsonPath('user.id', (string) $existing->id);

    expect(User::count())->toBe(1);
});

it('rejects a wrong code', function () {
    requestCode('ada@example.com');

    $this->postJson('/auth/email/verify', ['email' => 'ada@example.com', 'code' => '000000'], fromSite())
        ->assertStatus(422)
        ->assertJsonValidationErrors('code');

    $this->assertGuest();
});

it('stops accepting a code after five wrong attempts', function () {
    $code = requestCode('ada@example.com');

    for ($attempt = 0; $attempt < 5; $attempt++) {
        $this->postJson('/auth/email/verify', ['email' => 'ada@example.com', 'code' => '000000'], fromSite())
            ->assertStatus(422);
    }

    // Even the right code is dead now: the listener must request a fresh one.
    $this->postJson('/auth/email/verify', ['email' => 'ada@example.com', 'code' => $code], fromSite())
        ->assertStatus(422);

    $this->assertGuest();
});

it('rejects a code that has expired', function () {
    $code = requestCode('ada@example.com');

    $this->travel(11)->minutes();

    $this->postJson('/auth/email/verify', ['email' => 'ada@example.com', 'code' => $code], fromSite())
        ->assertStatus(422);

    $this->assertGuest();
});

it('only accepts the newest code', function () {
    $first = requestCode('ada@example.com');
    $second = requestCode('ada@example.com');

    $this->postJson('/auth/email/verify', ['email' => 'ada@example.com', 'code' => $first], fromSite())
        ->assertStatus(422);

    $this->postJson('/auth/email/verify', ['email' => 'ada@example.com', 'code' => $second], fromSite())
        ->assertOk();
});

it('cannot replay a code that already signed someone in', function () {
    $code = requestCode('ada@example.com');

    $this->postJson('/auth/email/verify', ['email' => 'ada@example.com', 'code' => $code], fromSite())->assertOk();
    $this->postJson('/auth/sign-out', [], fromSite())->assertNoContent();

    $this->postJson('/auth/email/verify', ['email' => 'ada@example.com', 'code' => $code], fromSite())
        ->assertStatus(422);
});

it('asks a listener requesting too many codes to wait', function () {
    RateLimiter::clear('email-code:ada@example.com');

    for ($sent = 0; $sent < 3; $sent++) {
        $this->postJson('/auth/email/code', ['email' => 'ada@example.com', 'turnstile' => 'ok'], fromSite())
            ->assertNoContent();
    }

    $this->postJson('/auth/email/code', ['email' => 'ada@example.com', 'turnstile' => 'ok'], fromSite())
        ->assertStatus(429)
        ->assertHeader('Retry-After');
});

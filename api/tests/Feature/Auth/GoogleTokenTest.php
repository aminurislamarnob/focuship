<?php

use App\Models\User;

/**
 * Google's own sign-in button hands the page an ID token, which the API verifies.
 * The consent screen then names focuship.app rather than a third party.
 */
beforeEach(function () {
    config(['services.google.client_id' => 'focuship.apps.googleusercontent.com']);
    fakeGoogleKeys();
});

it('signs in a listener Google vouched for', function () {
    $token = googleIdToken(['email' => 'ada@example.com', 'name' => 'Ada Lovelace', 'picture' => 'https://img/ada.png']);

    $this->postJson('/auth/google/token', ['token' => $token, 'nonce' => 'n-1'], fromSite())
        ->assertOk()
        ->assertJsonPath('user.email', 'ada@example.com')
        ->assertJsonPath('user.name', 'Ada Lovelace')
        ->assertJsonPath('user.avatarUrl', 'https://img/ada.png');

    $this->assertAuthenticated();
});

it('refuses a token signed by someone other than Google', function () {
    $token = googleIdToken(['email' => 'ada@example.com'], signWith: 'an-impostor');

    $this->postJson('/auth/google/token', ['token' => $token, 'nonce' => 'n-1'], fromSite())
        ->assertStatus(422);

    $this->assertGuest();
});

it('refuses a token meant for a different app', function () {
    $token = googleIdToken(['email' => 'ada@example.com', 'aud' => 'someone-else.apps.googleusercontent.com']);

    $this->postJson('/auth/google/token', ['token' => $token, 'nonce' => 'n-1'], fromSite())
        ->assertStatus(422);

    $this->assertGuest();
});

it('refuses a token whose nonce is not the one the page asked for', function () {
    $token = googleIdToken(['email' => 'ada@example.com', 'nonce' => hash('sha256', 'a-different-nonce')]);

    $this->postJson('/auth/google/token', ['token' => $token, 'nonce' => 'n-1'], fromSite())
        ->assertStatus(422);

    $this->assertGuest();
});

it('refuses a token that has expired', function () {
    $token = googleIdToken(['email' => 'ada@example.com', 'exp' => now()->subHour()->timestamp]);

    $this->postJson('/auth/google/token', ['token' => $token, 'nonce' => 'n-1'], fromSite())
        ->assertStatus(422);

    $this->assertGuest();
});

it('refuses a listener whose Google address is unverified', function () {
    $token = googleIdToken(['email' => 'ada@example.com', 'email_verified' => false]);

    $this->postJson('/auth/google/token', ['token' => $token, 'nonce' => 'n-1'], fromSite())
        ->assertStatus(422);

    $this->assertGuest();
});

it('lands in the account the listener already has', function () {
    $ada = listener(['email' => 'ada@example.com', 'name' => 'Ada']);

    $this->postJson(
        '/auth/google/token',
        ['token' => googleIdToken(['email' => 'ada@example.com', 'name' => 'Someone Else']), 'nonce' => 'n-1'],
        fromSite()
    )->assertOk()->assertJsonPath('user.id', (string) $ada->id);

    expect(User::count())->toBe(1);
    expect($ada->fresh()->name)->toBe('Ada');
});

it('records that the account can sign in with Google', function () {
    $this->postJson('/auth/google/token', ['token' => googleIdToken(['email' => 'ada@example.com', 'sub' => 'g-42']), 'nonce' => 'n-1'], fromSite())
        ->assertOk();

    $this->assertDatabaseHas('social_identities', ['provider' => 'google', 'provider_user_id' => 'g-42']);
});

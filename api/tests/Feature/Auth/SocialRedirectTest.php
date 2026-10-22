<?php

use App\Models\User;

/**
 * The redirect sign-ins: GitHub, Facebook, and Google when its button cannot load.
 * Each ends back on the site with a cookie session.
 */
beforeEach(function () {
    config([
        'services.github.client_id' => 'gh-id',
        'services.github.client_secret' => 'gh-secret',
        'services.google.client_id' => 'google-id',
        'services.google.client_secret' => 'google-secret',
        'services.facebook.client_id' => 'fb-id',
        'services.facebook.client_secret' => 'fb-secret',
        'auth.facebook_enabled' => true,
    ]);
});

it('sends the listener to the provider', function (string $provider) {
    $this->get("/auth/{$provider}/redirect")
        ->assertRedirectContains($provider === 'facebook' ? 'facebook.com' : $provider.'.com');
})->with(['github', 'google', 'facebook']);

it('signs the listener in when they come back', function (string $provider) {
    fakeSocialite($provider, ['id' => 'x-1', 'email' => 'ada@example.com', 'name' => 'Ada', 'avatar' => 'https://img/ada.png']);

    $this->get("/auth/{$provider}/callback?code=ok&state=s")
        ->assertRedirect(config('app.frontend_url').'/account');

    $this->assertAuthenticated();
    expect(User::where('email', 'ada@example.com')->exists())->toBeTrue();
})->with(['github', 'google', 'facebook']);

it('comes back to where sign-in started', function () {
    fakeSocialite('github', ['id' => 'x-1', 'email' => 'ada@example.com']);

    $this->get('/auth/github/redirect?redirect='.urlencode(config('app.frontend_url').'/timer'));
    $this->get('/auth/github/callback?code=ok&state=s')
        ->assertRedirect(config('app.frontend_url').'/timer');
});

it('refuses to come back to another site', function () {
    fakeSocialite('github', ['id' => 'x-1', 'email' => 'ada@example.com']);

    $this->get('/auth/github/redirect?redirect='.urlencode('https://evil.example/steal'));
    $this->get('/auth/github/callback?code=ok&state=s')
        ->assertRedirect(config('app.frontend_url').'/account');
});

it('links a second provider to the same account by verified email', function () {
    $ada = listener(['email' => 'ada@example.com']);

    fakeSocialite('github', ['id' => 'gh-1', 'email' => 'ada@example.com']);
    $this->get('/auth/github/callback?code=ok&state=s');
    $this->post('/auth/sign-out', [], fromSite());

    fakeSocialite('facebook', ['id' => 'fb-1', 'email' => 'ada@example.com']);
    $this->get('/auth/facebook/callback?code=ok&state=s');

    expect(User::count())->toBe(1);
    $this->assertAuthenticatedAs($ada->fresh());
    $this->assertDatabaseCount('social_identities', 2);
});

it('tells the site when the provider gave no email', function () {
    fakeSocialite('github', ['id' => 'gh-1', 'email' => null]);

    $this->get('/auth/github/callback?code=ok&state=s')
        ->assertRedirectContains('error=no-email');

    $this->assertGuest();
});

it('hides Facebook until it is switched on', function () {
    config(['auth.facebook_enabled' => false]);

    $this->get('/auth/facebook/redirect')->assertNotFound();
});

it('refuses a provider it does not know', function () {
    $this->get('/auth/myspace/redirect')->assertNotFound();
});

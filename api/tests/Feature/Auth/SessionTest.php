<?php

it('tells a guest that nobody is signed in', function () {
    $this->getJson('/auth/me', fromSite())
        ->assertOk()
        ->assertExactJson(['user' => null]);
});

it('describes the signed-in listener', function () {
    $ada = listener(['email' => 'ada@example.com', 'name' => 'Ada']);

    $this->actingAs($ada)
        ->getJson('/auth/me', fromSite())
        ->assertOk()
        ->assertJsonPath('user.email', 'ada@example.com')
        ->assertJsonPath('user.name', 'Ada')
        ->assertJsonPath('user.id', (string) $ada->id);
});

it('signs the listener out', function () {
    $this->actingAs(listener())
        ->postJson('/auth/sign-out', [], fromSite())
        ->assertNoContent();

    $this->assertGuest();
});

it('hands the site a CSRF cookie', function () {
    $this->get('/sanctum/csrf-cookie', fromSite())
        ->assertNoContent()
        ->assertCookie('XSRF-TOKEN');
});

it('lets the site read the API with credentials', function () {
    $this->getJson('/auth/me', fromSite())
        ->assertOk()
        ->assertHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
        ->assertHeader('Access-Control-Allow-Credentials', 'true');
});

it('refuses an origin that is not the site', function () {
    // The header never echoes the caller's origin, so the browser blocks the response.
    $this->getJson('/auth/me', ['Origin' => 'https://evil.example', 'Accept' => 'application/json'])
        ->assertHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
});

<?php

/**
 * Every public route has a limit (ADR 0005). The JSON API and the MCP name theirs route
 * by route; the browser pages — sign-in, the provider hops, OAuth consent — share one.
 */
it('stops a flood of any browser page', function (string $uri) {
    config(['services.github.client_id' => 'gh-id', 'services.github.client_secret' => 'gh-secret']);

    for ($i = 0; $i < 120; $i++) {
        expect($this->get($uri)->getStatusCode())->not->toBe(429);
    }

    $this->get($uri)->assertStatus(429)->assertHeader('Retry-After');
})->with([
    'the sign-in page' => ['/sign-in'],
    'the hop out to a provider' => ['/auth/github/redirect'],
    'the return from a provider' => ['/auth/github/callback?code=x&state=y'],
    'the OAuth consent screen' => ['/oauth/authorize'],
    'the CSRF cookie' => ['/sanctum/csrf-cookie'],
]);

it('stops a flood of the MCP’s refusals too', function (string $method) {
    // GET and DELETE only ever answer 405, but they are public all the same.
    for ($i = 0; $i < 30; $i++) {
        expect($this->call($method, '/mcp')->getStatusCode())->toBe(405);
    }

    $this->call($method, '/mcp')->assertStatus(429)->assertHeader('Retry-After');
})->with(['GET', 'DELETE']);

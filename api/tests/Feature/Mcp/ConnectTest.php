<?php

/**
 * What an AI client meets at api.focuship.app/mcp before it has a token.
 *
 * MCP clients only start the sign-in dance when the server answers 401 and points
 * at its OAuth metadata, which is why the MCP is for signed-in listeners only
 * (ADR 0004).
 */
it('turns away a client with no token, and says where to sign in', function () {
    $this->postJson('/mcp', ['jsonrpc' => '2.0', 'id' => 1, 'method' => 'tools/list'])
        ->assertUnauthorized()
        ->assertHeader('WWW-Authenticate');
});

it('publishes where its OAuth server lives', function () {
    $this->getJson('/.well-known/oauth-protected-resource/mcp')
        ->assertOk()
        ->assertJsonPath('resource', config('app.url').'/mcp');
});

it('publishes what its OAuth server can do', function () {
    $this->getJson('/.well-known/oauth-authorization-server')
        ->assertOk()
        ->assertJsonPath('issuer', config('app.url'))
        ->assertJsonStructure(['authorization_endpoint', 'token_endpoint', 'registration_endpoint']);
});

it('lets a client register itself, as the MCP spec requires', function () {
    $this->postJson('/oauth/register', [
        'client_name' => 'Claude',
        'redirect_uris' => ['https://claude.ai/api/mcp/auth_callback'],
        'grant_types' => ['authorization_code', 'refresh_token'],
    ])
        ->assertCreated()
        ->assertJsonStructure(['client_id', 'redirect_uris', 'grant_types'])
        ->assertJsonPath('scope', 'mcp:use');
});

it('stops a flood of client registrations', function () {
    $register = fn () => $this->postJson('/oauth/register', [
        'client_name' => 'Flood',
        'redirect_uris' => ['https://example.test/callback'],
        'grant_types' => ['authorization_code'],
    ]);

    for ($i = 0; $i < 10; $i++) {
        $register()->assertCreated();
    }

    $register()->assertStatus(429)->assertHeader('Retry-After');
});

it('asks the listener to sign in before approving an AI app', function () {
    $client = registerMcpClient();

    $this->get(authorizeUrl($client))
        ->assertRedirect()
        ->assertRedirectContains('/login');
});

it('comes back to the consent screen once the listener has signed in', function () {
    $client = registerMcpClient();
    $authorize = authorizeUrl($client);

    $this->followingRedirects()
        ->get($authorize)
        ->assertOk()
        ->assertSee('Sign in to Focuship');
});

it('hands a token to a client the listener approved', function () {
    $token = connectMcpClient(listener());

    expect($token)->toHaveKeys(['access_token', 'refresh_token', 'expires_in']);
    expect($token['expires_in'])->toBeGreaterThan(3500)->toBeLessThanOrEqual(3600);
});

it('shows a signed-in listener what the AI app is asking for', function () {
    $client = registerMcpClient();

    $this->actingAs(listener())
        ->get(authorizeUrl($client))
        ->assertOk()
        ->assertSee('Claude')
        ->assertSee('Focuship', false);
});

<?php

use App\Models\User;
use Illuminate\Support\Str;
use Laravel\Passport\Client;
use Laravel\Passport\Token;

it('needs an account', function () {
    $this->getJson('/account/connected-apps', fromSite())->assertUnauthorized();
});

it('lists nothing before any assistant is connected', function () {
    $this->actingAs(listener())
        ->getJson('/account/connected-apps', fromSite())
        ->assertOk()
        ->assertExactJson(['apps' => []]);
});

it('names each AI app the listener approved', function () {
    $ada = listener();
    connectMcpClient($ada, 'Claude');

    $this->actingAs($ada)
        ->getJson('/account/connected-apps', fromSite())
        ->assertOk()
        ->assertJsonCount(1, 'apps')
        ->assertJsonPath('apps.0.name', 'Claude')
        ->assertJsonStructure(['apps' => [['id', 'name', 'connectedAt', 'lastUsedAt']]]);
});

it('shows one row per app, however many tokens it has refreshed', function () {
    $ada = listener();
    $client = connectedClient($ada, 'Claude');

    // Refreshing a token mints another one against the same client.
    foreach (range(1, 2) as $ignored) {
        Token::forceCreate([
            'id' => (string) Str::uuid(),
            'user_id' => $ada->id,
            'client_id' => $client->getKey(),
            'scopes' => ['mcp:use'],
            'revoked' => false,
            'expires_at' => now()->addHour(),
        ]);
    }

    $this->actingAs($ada)
        ->getJson('/account/connected-apps', fromSite())
        ->assertJsonCount(1, 'apps');
});

it('never shows another listener’s connected apps', function () {
    connectMcpClient(listener(), 'Someone else’s Claude');

    $this->actingAs(listener())
        ->getJson('/account/connected-apps', fromSite())
        ->assertJsonPath('apps', []);
});

it('cuts off an app the listener revokes', function () {
    $ada = listener();
    $token = connectMcpClient($ada, 'Claude');
    $client = Client::firstOrFail();

    $this->actingAs($ada)
        ->deleteJson("/account/connected-apps/{$client->getKey()}", [], fromSite())
        ->assertNoContent();

    // The assistant's token stops working at once.
    $this->withToken($token['access_token'])
        ->postJson('/mcp', ['jsonrpc' => '2.0', 'id' => 1, 'method' => 'tools/list'])
        ->assertUnauthorized();

    $this->actingAs($ada)->getJson('/account/connected-apps', fromSite())->assertJsonPath('apps', []);
});

it('leaves a revoked app no way to refresh its way back in', function () {
    $ada = listener();
    $token = connectMcpClient($ada, 'Claude');
    $client = Client::firstOrFail();

    $this->actingAs($ada)
        ->deleteJson("/account/connected-apps/{$client->getKey()}", [], fromSite())
        ->assertNoContent();

    $this->postJson('/oauth/token', [
        'grant_type' => 'refresh_token',
        'refresh_token' => $token['refresh_token'],
        'client_id' => $client->getKey(),
    ])->assertStatus(400);
});

it('still lists and cuts off an app that has been idle past its access token', function () {
    $ada = listener();
    $token = connectMcpClient($ada, 'Claude');
    $client = Client::firstOrFail();

    // The access token is an hour old; the refresh token behind it lives for a month.
    $this->travel(2)->hours();

    $this->actingAs($ada)
        ->getJson('/account/connected-apps', fromSite())
        ->assertJsonPath('apps.0.name', 'Claude');

    $this->actingAs($ada)
        ->deleteJson("/account/connected-apps/{$client->getKey()}", [], fromSite())
        ->assertNoContent();

    $this->postJson('/oauth/token', [
        'grant_type' => 'refresh_token',
        'refresh_token' => $token['refresh_token'],
        'client_id' => $client->getKey(),
    ])->assertStatus(400);
});

it('leaves a revoked app no unused sign-in code to trade in', function () {
    $ada = listener();
    connectMcpClient($ada, 'Claude');
    $client = Client::firstOrFail();
    $verifier = 'focuship-test-code-verifier-long-enough-for-rfc-7636';

    // An app the listener already approved is handed a fresh code without asking again.
    $location = (string) $this->actingAs($ada)->get(authorizeUrl($client, $verifier))->headers->get('Location');
    parse_str((string) parse_url($location, PHP_URL_QUERY), $query);
    expect($query)->toHaveKey('code');

    $this->actingAs($ada)
        ->deleteJson("/account/connected-apps/{$client->getKey()}", [], fromSite())
        ->assertNoContent();

    $this->postJson('/oauth/token', [
        'grant_type' => 'authorization_code',
        'client_id' => $client->getKey(),
        'redirect_uri' => MCP_REDIRECT_URI,
        'code_verifier' => $verifier,
        'code' => $query['code'],
    ])->assertStatus(400);
});

it('cannot revoke an app connected by someone else', function () {
    connectMcpClient(listener(), 'Theirs');
    $client = Client::firstOrFail();

    $this->actingAs(listener())
        ->deleteJson("/account/connected-apps/{$client->getKey()}", [], fromSite())
        ->assertNotFound();
});

it('keeps the assistant connected when the listener signs out of the site', function () {
    $ada = listener();
    $token = connectMcpClient($ada);

    $this->actingAs($ada)->postJson('/auth/sign-out', [], fromSite())->assertNoContent();

    $this->withToken($token['access_token'])
        ->withHeaders(['Accept' => 'application/json, text/event-stream'])
        ->postJson('/mcp', ['jsonrpc' => '2.0', 'id' => 1, 'method' => 'tools/list'])
        ->assertOk();
});

it('cuts off every assistant when the account is deleted', function () {
    $ada = listener();
    $token = connectMcpClient($ada);

    $this->actingAs($ada)->deleteJson('/account', [], fromSite())->assertNoContent();

    $this->withToken($token['access_token'])
        ->postJson('/mcp', ['jsonrpc' => '2.0', 'id' => 1, 'method' => 'tools/list'])
        ->assertUnauthorized();

    expect(Token::where('user_id', $ada->id)->count())->toBe(0);
});

/** The client row behind a connection, for tests that need it directly. */
function connectedClient(User $user, string $name): Client
{
    connectMcpClient($user, $name);

    return Client::where('name', $name)->firstOrFail();
}

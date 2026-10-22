<?php

/**
 * The tracer through the whole MCP: a connected AI client calling a tool as the
 * listener who approved it.
 */
it('lists its tools to a connected client', function () {
    $this->mcp(listener(), 'tools/list')
        ->assertOk()
        ->assertJsonPath('jsonrpc', '2.0');

    expect(mcpToolNames(listener()))->toContain('whoami');
});

it('tells the assistant which account it is working with', function () {
    $ada = listener(['email' => 'ada@example.com', 'name' => 'Ada Lovelace']);

    $result = $this->mcpTool($ada, 'whoami');

    expect($result)->toContain('ada@example.com')->toContain('Ada Lovelace');
});

it('answers as the listener who approved the client, not someone else', function () {
    listener(['email' => 'someone-else@example.com']);
    $ada = listener(['email' => 'ada@example.com']);

    expect($this->mcpTool($ada, 'whoami'))
        ->toContain('ada@example.com')
        ->not->toContain('someone-else@example.com');
});

it('refuses a token that is not one of ours', function () {
    $this->withToken('not-a-real-token')
        ->postJson('/mcp', ['jsonrpc' => '2.0', 'id' => 1, 'method' => 'tools/list'])
        ->assertUnauthorized();
});

it('refuses a body too large to be a real request', function () {
    $this->mcpRequest(listener(), [
        'jsonrpc' => '2.0',
        'id' => 1,
        'method' => 'tools/call',
        'params' => ['name' => 'whoami', 'arguments' => ['padding' => str_repeat('x', 70_000)]],
    ])->assertStatus(413);
});

it('asks a chatty client to slow down', function () {
    $ada = listener();

    foreach (range(1, 120) as $ignored) {
        $this->mcp($ada, 'tools/list')->assertOk();
    }

    $this->mcp($ada, 'tools/list')->assertStatus(429)->assertHeader('Retry-After');
});

<?php

namespace Tests;

use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Testing\TestResponse;

abstract class TestCase extends BaseTestCase
{
    /**
     * Calls the MCP the way a connected AI client does: JSON-RPC over HTTP, carrying
     * the listener's access token. Nothing here reaches inside the server.
     *
     * @param  array<string, mixed>  $params
     */
    protected function mcp(User $user, string $method, array $params = [], int $id = 1): TestResponse
    {
        return $this->mcpRequest($user, array_filter([
            'jsonrpc' => '2.0',
            'id' => $id,
            'method' => $method,
            'params' => $params === [] ? null : $params,
        ], fn ($value) => $value !== null));
    }

    /** @param array<string, mixed> $body */
    protected function mcpRequest(User $user, array $body): TestResponse
    {
        return $this->withToken(mcpToken($user))
            ->withHeaders(['Accept' => 'application/json, text/event-stream'])
            ->postJson('/mcp', $body);
    }

    /**
     * Calls one tool and returns the text the assistant would read.
     *
     * @param  array<string, mixed>  $arguments
     */
    protected function mcpTool(User $user, string $tool, array $arguments = []): string
    {
        $response = $this->mcp($user, 'tools/call', ['name' => $tool, 'arguments' => $arguments]);

        $response->assertOk();

        return self::textOf($response);
    }

    /** @return array<string, mixed> */
    protected function mcpResult(User $user, string $tool, array $arguments = []): array
    {
        $response = $this->mcp($user, 'tools/call', ['name' => $tool, 'arguments' => $arguments]);
        $response->assertOk();

        return self::payload($response)['result'] ?? [];
    }

    protected function mcpError(User $user, string $tool, array $arguments = []): string
    {
        return self::textOf($this->mcp($user, 'tools/call', ['name' => $tool, 'arguments' => $arguments]));
    }

    /** Every content block of a tool result, joined: what the assistant sees. */
    protected static function textOf(TestResponse $response): string
    {
        $result = self::payload($response)['result'] ?? [];

        return collect($result['content'] ?? [])
            ->pluck('text')
            ->implode("\n");
    }

    /** MCP replies may arrive as JSON or as a one-event SSE stream. */
    /** @return array<string, mixed> */
    protected static function payload(TestResponse $response): array
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
}

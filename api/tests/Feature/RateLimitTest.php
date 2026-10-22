<?php

use Illuminate\Routing\Route;
use Illuminate\Support\Facades\Route as Routes;

/**
 * Every public route has a limit (ADR 0005). The JSON API and the MCP name theirs route
 * by route; the browser pages — sign-in, the provider hops, OAuth consent — share one.
 */
it('puts a throttle on every registered route', function () {
    // Deliberate exemptions (`METHOD /uri`). Empty: a new route without throttle fails.
    $withoutThrottle = [];

    $groups = app('router')->getMiddlewareGroups();

    $expand = function (Route $route) use ($groups): array {
        $names = [];
        $stack = $route->gatherMiddleware();

        while ($stack !== []) {
            $middleware = array_shift($stack);

            if (! is_string($middleware)) {
                continue;
            }

            $group = explode(':', $middleware, 2)[0];

            if (isset($groups[$group])) {
                array_unshift($stack, ...$groups[$group]);

                continue;
            }

            $names[] = $middleware;
        }

        return $names;
    };

    $throttled = function (Route $route) use ($expand): bool {
        foreach ($expand($route) as $middleware) {
            if ($middleware === 'throttle' || str_starts_with($middleware, 'throttle:')) {
                return true;
            }
        }

        return false;
    };

    $bare = [];

    foreach (Routes::getRoutes() as $route) {
        $methods = collect($route->methods())->reject(fn (string $method) => $method === 'HEAD')->sort()->implode('|');
        $uri = '/'.ltrim($route->uri(), '/');
        $id = "{$methods} {$uri}";

        if (in_array($id, $withoutThrottle, true) || $throttled($route)) {
            continue;
        }

        $bare[] = $id;
    }

    expect($bare)->toBe([]);
});

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

/**
 * Guests are limited per address, so the address must be one a caller cannot choose.
 * The origin is also reachable around Cloudflare (ADR 0005): from any peer outside
 * Cloudflare's ranges, the forwarding headers are the caller's own words.
 */
it('keys a caller outside Cloudflare on its own address, whatever headers it sends', function () {
    $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.9']);

    for ($i = 0; $i < 30; $i++) {
        $this->get('/mcp', ['CF-Connecting-IP' => "198.51.100.{$i}", 'X-Forwarded-For' => "192.0.2.{$i}"])->assertStatus(405);
    }

    $this->get('/mcp', ['CF-Connecting-IP' => '198.51.100.200', 'X-Forwarded-For' => '192.0.2.200'])
        ->assertStatus(429);
});

it('keys each visitor behind a Cloudflare edge on the visitor’s address', function () {
    $this->withServerVariables(['REMOTE_ADDR' => '173.245.48.1']);

    for ($i = 0; $i < 30; $i++) {
        $this->get('/mcp', ['X-Forwarded-For' => '198.51.100.1'])->assertStatus(405);
    }

    $this->get('/mcp', ['X-Forwarded-For' => '198.51.100.1'])->assertStatus(429);
    $this->get('/mcp', ['X-Forwarded-For' => '198.51.100.2'])->assertStatus(405);
});

it('believes a forwarded HTTPS only from a Cloudflare edge', function (string $peer, string $scheme) {
    $this->withServerVariables(['REMOTE_ADDR' => $peer])
        ->getJson('/.well-known/oauth-protected-resource', ['X-Forwarded-Proto' => 'https'])
        ->assertOk()
        ->assertJsonPath('resource', fn (string $resource) => str_starts_with($resource, "{$scheme}://"));
})->with([
    'a Cloudflare edge' => ['173.245.48.1', 'https'],
    'anyone else' => ['203.0.113.9', 'http'],
]);

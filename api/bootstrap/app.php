<?php

use App\Http\Middleware\LimitBodySize;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\HandleCors;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        apiPrefix: '',
        commands: __DIR__.'/../routes/console.php',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->prepend(HandleCors::class);
        // Forwarding headers (visitor address, HTTPS) count only from a Cloudflare edge: the
        // origin is reachable around Cloudflare too, and guests are rate-limited per address.
        // Ranges from https://www.cloudflare.com/ips (checked 2026-10-22).
        $middleware->trustProxies(at: [
            '173.245.48.0/20', '103.21.244.0/22', '103.22.200.0/22', '103.31.4.0/22',
            '141.101.64.0/18', '108.162.192.0/18', '190.93.240.0/20', '188.114.96.0/20',
            '197.234.240.0/22', '198.41.128.0/17', '162.158.0.0/15', '104.16.0.0/13',
            '104.24.0.0/14', '172.64.0.0/13', '131.0.72.0/22',
            '2400:cb00::/32', '2606:4700::/32', '2803:f800::/32', '2405:b500::/32',
            '2405:8100::/32', '2a06:98c0::/29', '2c0f:f248::/32',
        ]);
        $middleware->statefulApi();
        $middleware->alias(['mcp.body-size' => LimitBodySize::class]);
        // Every browser page — ours, Passport's consent screens, Sanctum's CSRF cookie —
        // shares one limit, so a page added later cannot ship unthrottled.
        $middleware->web(append: ['throttle:web']);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => ! $request->is('oauth/authorize', 'auth/*/callback', 'auth/*/redirect') || $request->expectsJson(),
        );
    })->create();

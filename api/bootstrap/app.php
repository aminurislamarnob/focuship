<?php

use App\Http\Middleware\LimitBodySize;
use App\Http\Middleware\UseCloudflareClientIp;
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
        // Behind Cloudflare: request()->ip() is the visitor (CF-Connecting-IP); trust the proxy for HTTPS detection.
        $middleware->prepend(UseCloudflareClientIp::class);
        $middleware->prepend(HandleCors::class);
        $middleware->trustProxies(at: '*');
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

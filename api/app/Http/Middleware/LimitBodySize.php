<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * A ceiling on request bodies. MCP calls are small; anything this large is a
 * mistake or an attempt to tie up a shared host (ADR 0005).
 */
class LimitBodySize
{
    public const MAX_BYTES = 65_536;

    public function handle(Request $request, Closure $next): Response
    {
        $length = (int) ($request->server('CONTENT_LENGTH') ?: strlen((string) $request->getContent()));

        abort_if($length > self::MAX_BYTES, 413, 'That request is too large.');

        return $next($request);
    }
}

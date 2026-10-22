<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * api.focuship.app sits behind Cloudflare's proxy, so the TCP peer is a Cloudflare edge.
 * Cloudflare puts the visitor's address in CF-Connecting-IP; rate limits key on it.
 */
class UseCloudflareClientIp
{
    public function handle(Request $request, Closure $next): Response
    {
        $ip = $request->headers->get('CF-Connecting-IP');

        if ($ip !== null && filter_var($ip, FILTER_VALIDATE_IP) !== false) {
            $request->server->set('REMOTE_ADDR', $ip);
            $request->headers->remove('X-Forwarded-For');
        }

        return $next($request);
    }
}

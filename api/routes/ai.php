<?php

use App\Mcp\Servers\FocushipServer;
use Illuminate\Support\Facades\Route;
use Laravel\Mcp\Facades\Mcp;

/*
|--------------------------------------------------------------------------
| The Focuship MCP server
|--------------------------------------------------------------------------
|
| One server, for signed-in listeners only (ADR 0004). Dynamic client
| registration is public by design (MCP spec / RFC 7591), so it is the
| tightest-throttled route on the API.
|
*/

Route::middleware('throttle:oauth-register')->group(function () {
    Mcp::oauthRoutes();
});

// The group reaches the GET and DELETE that only ever answer 405, which the package
// registers alongside the server. Auth still runs before the throttle (middleware
// priority), so a connected client is limited per listener, not per IP.
Route::middleware('throttle:mcp')->group(function () {
    Mcp::web('/mcp', FocushipServer::class)
        ->middleware(['auth:api', 'mcp.body-size']);
});

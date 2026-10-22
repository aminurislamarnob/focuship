# 0004: The MCP server is for signed-in listeners only, via Passport OAuth

Status: accepted (2026-10-22)

## Decision

- One MCP server at `api.focuship.app/mcp`, built with `laravel/mcp`, protected by Passport (`auth:api`). `Mcp::oauthRoutes()` provides OAuth 2.1 discovery and dynamic client registration. There is no guest MCP.
- The MCP designs and manages; it never controls playback in a listener's tab. `build-mix` returns a share link that opens the mix ready to play.
- Tools: catalog (`list-categories`, `search-sounds`, `list-presets`, `get-preset`, `build-mix`) and account (`whoami`, presets, favorites, settings). Account deletion is not exposed.
- Access tokens last 1 hour, refresh tokens 30 days. Listeners see and revoke connected apps on their account page. Signing out of the site does not revoke them.
- Plain JSON responses only (no streaming tools), for shared hosting and the Cloudflare proxy.

## Why not a guest endpoint

MCP clients only start OAuth when the server answers 401 at connect time, so "optional sign-in" on one endpoint means nobody ever signs in. A second public endpoint was dropped to keep the surface small.

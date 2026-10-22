<?php

namespace App\Mcp\Servers;

use App\Mcp\Tools\Whoami;
use Laravel\Mcp\Server;
use Laravel\Mcp\Server\Attributes\Instructions;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Version;
use Laravel\Mcp\Server\Prompt;
use Laravel\Mcp\Server\Tool;

/**
 * Focuship's MCP server: the mix designer and librarian an AI assistant connects to
 * (ADR 0004).
 *
 * It designs and manages; it cannot play anything. `build-mix` hands back a
 * focuship.app link that opens the mix ready to play, which is the hand-off.
 */
#[Name('Focuship')]
#[Version('1.0.0')]
#[Instructions(<<<'TEXT'
Focuship is an ambient sound mixer and focus timer. A mix is a set of sounds, each at
its own volume from 0 to 1.

You can browse the catalogue, design mixes, and manage the listener's saved presets,
favorites and timer settings.

You cannot start or stop playback: the listener's browser does that. When you design a
mix, call build-mix and give the listener the link it returns — opening it loads the
mix ready to play.

Prefer the listener's own presets and favorites when they ask for "my" mixes. Search the
catalogue before guessing a sound id; ids that do not exist are rejected.
TEXT)]
class FocushipServer extends Server
{
    /** @var array<int, class-string<Tool>> */
    protected array $tools = [
        Whoami::class,
    ];

    /** @var array<int, class-string<Server\Resource>> */
    protected array $resources = [];

    /** @var array<int, class-string<Prompt>> */
    protected array $prompts = [];
}

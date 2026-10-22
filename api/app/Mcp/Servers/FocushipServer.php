<?php

namespace App\Mcp\Servers;

use App\Mcp\Prompts\DesignAMix;
use App\Mcp\Resources\CatalogResource;
use App\Mcp\Resources\GuidesResource;
use App\Mcp\Tools\AddFavorite;
use App\Mcp\Tools\BuildMix;
use App\Mcp\Tools\DeletePreset;
use App\Mcp\Tools\GetPreset;
use App\Mcp\Tools\GetSettings;
use App\Mcp\Tools\ListCategories;
use App\Mcp\Tools\ListFavorites;
use App\Mcp\Tools\ListMyPresets;
use App\Mcp\Tools\ListPresets;
use App\Mcp\Tools\RemoveFavorite;
use App\Mcp\Tools\RenamePreset;
use App\Mcp\Tools\SavePreset;
use App\Mcp\Tools\SearchSounds;
use App\Mcp\Tools\SetPresetPublic;
use App\Mcp\Tools\UpdateSettings;
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

        // The catalogue, and turning a mood into a mix.
        ListCategories::class,
        SearchSounds::class,
        ListPresets::class,
        GetPreset::class,
        BuildMix::class,

        // The listener's own library.
        ListMyPresets::class,
        SavePreset::class,
        RenamePreset::class,
        SetPresetPublic::class,
        DeletePreset::class,
        ListFavorites::class,
        AddFavorite::class,
        RemoveFavorite::class,
        GetSettings::class,
        UpdateSettings::class,
    ];

    /** @var array<int, class-string<Server\Resource>> */
    protected array $resources = [
        CatalogResource::class,
        GuidesResource::class,
    ];

    /** @var array<int, class-string<Prompt>> */
    protected array $prompts = [
        DesignAMix::class,
    ];
}

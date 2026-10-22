<?php

namespace App\Mcp\Resources;

use App\Catalog\Catalog;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\MimeType;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Title;
use Laravel\Mcp\Server\Resource;

#[Name('catalog')]
#[Title('Focuship sound catalogue')]
#[Description('Every Focuship category, sound and built-in preset as JSON. Read it once to reason about the whole catalogue without searching repeatedly.')]
#[MimeType('application/json')]
class CatalogResource extends Resource
{
    public function uri(): string
    {
        return 'focuship://catalog';
    }

    public function handle(Request $request): Response
    {
        return Response::text((string) json_encode([
            'categories' => Catalog::categories(),
            'sounds' => Catalog::sounds(),
            'presets' => Catalog::presets(),
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    }
}

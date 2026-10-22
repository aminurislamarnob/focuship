<?php

namespace App\Mcp\Tools;

use App\Catalog\MixLink;
use App\Mcp\Describe;
use App\Mcp\LibraryTool;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\JsonSchema\Types\Type;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tools\Annotations\IsIdempotent;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Description("The listener's own saved presets, newest first. Use these when they ask for \"my\" mixes.")]
#[IsReadOnly]
#[IsIdempotent]
class ListMyPresets extends LibraryTool
{
    public function handle(Request $request): ResponseFactory
    {
        $presets = $this->library($request)->presets();

        if ($presets->isEmpty()) {
            return Response::make(Response::text(
                'No saved presets yet. Design a mix with build-mix, then save it with save-preset.'
            ))->withStructuredContent(['presets' => []]);
        }

        $lines = $presets->map(fn ($preset) => sprintf(
            "- %s (%s)%s\n  %s",
            $preset->label,
            $preset->id,
            $preset->is_public ? ' · shared: '.MixLink::shareLink($preset->id) : '',
            Describe::layers($preset->layers),
        ))->implode("\n");

        return Response::make(Response::text("{$presets->count()} saved presets:\n{$lines}"))
            ->withStructuredContent(['presets' => $presets->map->toCloudPreset()->values()->all()]);
    }

    /** @return array<string, Type> */
    public function schema(JsonSchema $schema): array
    {
        return [];
    }
}

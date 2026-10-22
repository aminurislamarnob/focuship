<?php

namespace App\Mcp\Tools;

use App\Catalog\Catalog;
use App\Mcp\Describe;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\JsonSchema\Types\Type;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsIdempotent;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Description("Focuship's built-in presets and the sounds in each. Good starting points to recommend or adapt. For the listener's own saved presets use list-my-presets.")]
#[IsReadOnly]
#[IsIdempotent]
class ListPresets extends Tool
{
    public function handle(Request $request): ResponseFactory
    {
        $presets = Catalog::presets();

        $lines = $presets->map(fn (array $preset) => sprintf(
            "- %s — %s: %s\n  %s",
            $preset['id'],
            $preset['label'],
            $preset['blurb'],
            Describe::layers($preset['layers']),
        ))->implode("\n");

        return Response::make(Response::text("Focuship's built-in presets:\n{$lines}"))
            ->withStructuredContent(['presets' => $presets->all()]);
    }

    /** @return array<string, Type> */
    public function schema(JsonSchema $schema): array
    {
        return [];
    }
}

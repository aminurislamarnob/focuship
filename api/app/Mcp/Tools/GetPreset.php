<?php

namespace App\Mcp\Tools;

use App\Account\Library;
use App\Catalog\Catalog;
use App\Catalog\MixLink;
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

#[Description('One preset by id: a built-in preset, one of the listener\'s own, or a preset someone shared publicly (the id in a ?p= link).')]
#[IsReadOnly]
#[IsIdempotent]
class GetPreset extends Tool
{
    public function handle(Request $request): ResponseFactory|Response
    {
        $id = (string) $request->get('id');
        $user = $request->user();

        $preset = Catalog::preset($id);

        if ($preset === null) {
            $owned = $user?->library()->preset($id) ?? Library::sharedPreset($id);

            $preset = $owned === null ? null : [
                'id' => $owned->id,
                'label' => $owned->label,
                'blurb' => 'A saved preset',
                'layers' => $owned->layers,
            ];
        }

        if ($preset === null) {
            return Response::error(
                "No preset with the id {$id}. Built-in ones come from list-presets; the listener's own from list-my-presets."
            );
        }

        $text = sprintf(
            "%s (%s)\n%s\n%s\nOpens at: %s",
            $preset['label'],
            $preset['id'],
            $preset['blurb'] ?? '',
            Describe::layers($preset['layers']),
            MixLink::url($preset['layers']),
        );

        return Response::make(Response::text($text))->withStructuredContent($preset);
    }

    /** @return array<string, Type> */
    public function schema(JsonSchema $schema): array
    {
        return [
            'id' => $schema->string()
                ->description('A built-in preset id like "deep-work", or a preset UUID.')
                ->required(),
        ];
    }
}

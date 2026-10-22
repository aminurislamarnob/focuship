<?php

namespace App\Mcp\Tools;

use App\Catalog\Catalog;
use App\Catalog\MixLink;
use App\Http\Controllers\Account\PresetController;
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

#[Description(<<<'TEXT'
Turns a set of sounds and volumes into a link that opens the mix in Focuship, ready to
play. This is how you hand a mix to the listener: you cannot start playback yourself.
Search the catalogue first — sound ids that do not exist are rejected.
TEXT)]
#[IsReadOnly]
#[IsIdempotent]
class BuildMix extends Tool
{
    public function handle(Request $request): ResponseFactory|Response
    {
        /** @var array<string, mixed> $layers */
        $layers = (array) $request->get('layers', []);

        if ($layers === []) {
            return Response::error('A mix needs at least one sound. Use search-sounds to find some.');
        }

        if (count($layers) > PresetController::MAX_LAYERS) {
            return Response::error(sprintf(
                'That is %d sounds at once. Focuship mixes hold up to %d — pick the ones that matter.',
                count($layers),
                PresetController::MAX_LAYERS,
            ));
        }

        $unknown = array_values(array_filter(
            array_keys($layers),
            fn ($id) => ! Catalog::hasSound((string) $id)
        ));

        if ($unknown !== []) {
            return Response::error(
                'Focuship has no sound called '.implode(', ', array_map(strval(...), $unknown))
                .'. Use search-sounds to find the right ids.'
            );
        }

        $volumes = [];

        foreach ($layers as $id => $volume) {
            if (! is_numeric($volume) || (float) $volume < 0 || (float) $volume > 1) {
                return Response::error("The volume for {$id} must be a number between 0 and 1.");
            }

            $volumes[(string) $id] = (float) $volume;
        }

        $url = MixLink::url($volumes);

        $text = sprintf(
            "%s\n\nOpen this link to play it: %s",
            ucfirst(Describe::layers($volumes)),
            $url,
        );

        return Response::make(Response::text($text))
            ->withStructuredContent(['url' => $url, 'layers' => $volumes]);
    }

    /** @return array<string, Type> */
    public function schema(JsonSchema $schema): array
    {
        return [
            'layers' => $schema->object()
                ->description(
                    'The mix: sound id to volume, each volume between 0 (silent) and 1 (full), '
                    .'e.g. {"rain-on-window": 0.6, "keyboard": 0.25}. Up to '
                    .PresetController::MAX_LAYERS.' sounds.'
                )
                ->required(),
        ];
    }
}

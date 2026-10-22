<?php

namespace App\Mcp\Tools;

use App\Account\Library;
use App\Account\UnknownSounds;
use App\Catalog\MixLink;
use App\Mcp\Describe;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\JsonSchema\Types\Type;
use Illuminate\Validation\ValidationException;
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
        $layers = (array) $request->get('layers', []);

        try {
            $volumes = Library::checkLayers($layers);
        } catch (UnknownSounds $e) {
            return Response::error($e->getMessage().' Use search-sounds to find the right ids.');
        } catch (ValidationException $e) {
            return Response::error($e->getMessage());
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
                    .Library::MAX_LAYERS.' sounds.'
                )
                ->required(),
        ];
    }
}

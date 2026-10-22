<?php

namespace App\Mcp\Tools;

use App\Catalog\Catalog;
use App\Http\Controllers\Account\PresetController;
use App\Mcp\Describe;
use App\Mcp\LibraryTool;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\JsonSchema\Types\Type;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Attributes\Description;

#[Description('Saves a mix to the listener\'s presets, so it appears in Focuship on every device they sign in to.')]
class SavePreset extends LibraryTool
{
    public function handle(Request $request): ResponseFactory|Response
    {
        $label = trim((string) $request->get('label'));
        /** @var array<string, float|int> $layers */
        $layers = (array) $request->get('layers', []);

        if (Str::length($label) < 2 || Str::length($label) > 60) {
            return Response::error('A preset name needs to be between 2 and 60 characters.');
        }

        if ($layers === [] || count($layers) > PresetController::MAX_LAYERS) {
            return Response::error('A preset needs between 1 and '.PresetController::MAX_LAYERS.' sounds.');
        }

        $unknown = array_values(array_filter(array_keys($layers), fn ($id) => ! Catalog::hasSound((string) $id)));

        if ($unknown !== []) {
            return Response::error('Focuship has no sound called '.implode(', ', array_map(strval(...), $unknown)).'.');
        }

        try {
            $preset = $this->library($request)->savePreset((string) Str::uuid(), $label, $layers);
        } catch (ValidationException $e) {
            return Response::error($e->getMessage());
        }

        return Response::make(Response::text(sprintf(
            'Saved "%s" (%s): %s',
            $preset->label,
            $preset->id,
            Describe::layers($preset->layers),
        )))->withStructuredContent($preset->toCloudPreset());
    }

    /** @return array<string, Type> */
    public function schema(JsonSchema $schema): array
    {
        return [
            'label' => $schema->string()->description('What to call it, 2 to 60 characters.')->required(),
            'layers' => $schema->object()
                ->description('The mix: sound id to volume between 0 and 1.')
                ->required(),
        ];
    }
}

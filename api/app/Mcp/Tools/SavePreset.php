<?php

namespace App\Mcp\Tools;

use App\Account\Library;
use App\Account\UnknownSounds;
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
        $layers = (array) $request->get('layers', []);

        try {
            $preset = $this->library($request)->savePreset(
                (string) Str::uuid(),
                (string) $request->get('label'),
                $layers,
            );
        } catch (UnknownSounds $e) {
            return Response::error($e->getMessage().' Use search-sounds to find the right ids.');
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
            'label' => $schema->string()
                ->description('What to call it, up to '.Library::MAX_LABEL.' characters.')
                ->required(),
            'layers' => $schema->object()
                ->description('The mix: sound id to volume between 0 and 1.')
                ->required(),
        ];
    }
}

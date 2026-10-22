<?php

namespace App\Mcp\Tools;

use App\Mcp\LibraryTool;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\JsonSchema\Types\Type;
use Illuminate\Support\Str;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tools\Annotations\IsIdempotent;

#[Description("Renames one of the listener's saved presets.")]
#[IsIdempotent]
class RenamePreset extends LibraryTool
{
    public function handle(Request $request): ResponseFactory|Response
    {
        $id = (string) $request->get('id');
        $label = trim((string) $request->get('label'));

        if (Str::length($label) < 2 || Str::length($label) > 60) {
            return Response::error('A preset name needs to be between 2 and 60 characters.');
        }

        $preset = $this->ownPreset($request, $id);

        if ($preset === null) {
            return Response::error(self::noSuchPreset($id));
        }

        $preset = $this->library($request)->renamePreset($preset, $label);

        return Response::make(Response::text("Renamed to \"{$preset->label}\"."))
            ->withStructuredContent($preset->toCloudPreset());
    }

    /** @return array<string, Type> */
    public function schema(JsonSchema $schema): array
    {
        return [
            'id' => $schema->string()->description('The preset UUID from list-my-presets.')->required(),
            'label' => $schema->string()->description('The new name, 2 to 60 characters.')->required(),
        ];
    }
}

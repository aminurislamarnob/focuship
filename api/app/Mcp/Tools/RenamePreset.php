<?php

namespace App\Mcp\Tools;

use App\Account\Library;
use App\Mcp\LibraryTool;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\JsonSchema\Types\Type;
use Illuminate\Validation\ValidationException;
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
        $preset = $this->ownPreset($request, $id);

        if ($preset === null) {
            return Response::error(self::noSuchPreset($id));
        }

        try {
            $preset = $this->library($request)->renamePreset($preset, (string) $request->get('label'));
        } catch (ValidationException $e) {
            return Response::error($e->getMessage());
        }

        return Response::make(Response::text("Renamed to \"{$preset->label}\"."))
            ->withStructuredContent($preset->toCloudPreset());
    }

    /** @return array<string, Type> */
    public function schema(JsonSchema $schema): array
    {
        return [
            'id' => $schema->string()->description('The preset UUID from list-my-presets.')->required(),
            'label' => $schema->string()
                ->description('The new name, up to '.Library::MAX_LABEL.' characters.')
                ->required(),
        ];
    }
}

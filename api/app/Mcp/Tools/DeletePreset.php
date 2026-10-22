<?php

namespace App\Mcp\Tools;

use App\Mcp\LibraryTool;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\JsonSchema\Types\Type;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tools\Annotations\IsDestructive;

#[Description('Deletes one of the listener\'s saved presets for good. Check with them first — this cannot be undone.')]
#[IsDestructive]
class DeletePreset extends LibraryTool
{
    public function handle(Request $request): ResponseFactory|Response
    {
        $id = (string) $request->get('id');
        $preset = $this->ownPreset($request, $id);

        if ($preset === null) {
            return Response::error(self::noSuchPreset($id));
        }

        $label = $preset->label;
        $this->library($request)->deletePreset($preset);

        return Response::make(Response::text("Deleted \"{$label}\"."))
            ->withStructuredContent(['deleted' => $id]);
    }

    /** @return array<string, Type> */
    public function schema(JsonSchema $schema): array
    {
        return [
            'id' => $schema->string()->description('The preset UUID from list-my-presets.')->required(),
        ];
    }
}

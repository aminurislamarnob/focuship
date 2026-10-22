<?php

namespace App\Mcp\Tools;

use App\Catalog\MixLink;
use App\Mcp\LibraryTool;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\JsonSchema\Types\Type;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tools\Annotations\IsIdempotent;

#[Description('Shares one of the listener\'s presets by link, or stops sharing it. Sharing returns the link to pass on.')]
#[IsIdempotent]
class SetPresetPublic extends LibraryTool
{
    public function handle(Request $request): ResponseFactory|Response
    {
        $id = (string) $request->get('id');
        $isPublic = (bool) $request->get('isPublic');

        $preset = $this->ownPreset($request, $id);

        if ($preset === null) {
            return Response::error(self::noSuchPreset($id));
        }

        $preset = $this->library($request)->setPresetPublic($preset, $isPublic);

        $text = $isPublic
            ? "\"{$preset->label}\" is now shared. Anyone with this link can open it: ".MixLink::shareLink($preset->id)
            : "\"{$preset->label}\" is private again. Links to it no longer open.";

        return Response::make(Response::text($text))->withStructuredContent(
            $preset->toCloudPreset() + ($isPublic ? ['url' => MixLink::shareLink($preset->id)] : [])
        );
    }

    /** @return array<string, Type> */
    public function schema(JsonSchema $schema): array
    {
        return [
            'id' => $schema->string()->description('The preset UUID from list-my-presets.')->required(),
            'isPublic' => $schema->boolean()->description('True to share it by link, false to stop.')->required(),
        ];
    }
}

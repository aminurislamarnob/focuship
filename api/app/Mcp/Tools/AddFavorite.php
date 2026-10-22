<?php

namespace App\Mcp\Tools;

use App\Mcp\LibraryTool;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\JsonSchema\Types\Type;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tools\Annotations\IsIdempotent;

#[Description('Stars a preset for the listener: a built-in one, or one of their own.')]
#[IsIdempotent]
class AddFavorite extends LibraryTool
{
    public function handle(Request $request): ResponseFactory|Response
    {
        $ref = (string) $request->get('ref');
        $library = $this->library($request);

        if (! $library->canFavorite($ref)) {
            return Response::error("There is no preset with the id {$ref}, so it cannot be favorited.");
        }

        $library->addFavorite($ref);

        return Response::make(Response::text("Favorited {$ref}."))
            ->withStructuredContent(['favorites' => $library->favorites()]);
    }

    /** @return array<string, Type> */
    public function schema(JsonSchema $schema): array
    {
        return [
            'ref' => $schema->string()
                ->description('A built-in preset id like "deep-work", or one of the listener\'s preset UUIDs.')
                ->required(),
        ];
    }
}

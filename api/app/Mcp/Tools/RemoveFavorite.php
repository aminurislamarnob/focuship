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

#[Description('Unstars a preset for the listener.')]
#[IsIdempotent]
class RemoveFavorite extends LibraryTool
{
    public function handle(Request $request): ResponseFactory
    {
        $ref = (string) $request->get('ref');
        $library = $this->library($request);

        $library->removeFavorite($ref);

        return Response::make(Response::text("Removed {$ref} from favorites."))
            ->withStructuredContent(['favorites' => $library->favorites()]);
    }

    /** @return array<string, Type> */
    public function schema(JsonSchema $schema): array
    {
        return [
            'ref' => $schema->string()->description('The preset id to unstar.')->required(),
        ];
    }
}

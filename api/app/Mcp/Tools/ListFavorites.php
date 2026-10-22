<?php

namespace App\Mcp\Tools;

use App\Catalog\Catalog;
use App\Mcp\LibraryTool;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\JsonSchema\Types\Type;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tools\Annotations\IsIdempotent;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Description('The presets the listener starred. A good read of what they actually like before recommending anything.')]
#[IsReadOnly]
#[IsIdempotent]
class ListFavorites extends LibraryTool
{
    public function handle(Request $request): ResponseFactory
    {
        $library = $this->library($request);
        $refs = $library->favorites();

        if ($refs === []) {
            return Response::make(Response::text('This listener has no favorites yet.'))
                ->withStructuredContent(['favorites' => []]);
        }

        $lines = collect($refs)->map(function (string $ref) use ($library) {
            $builtIn = Catalog::preset($ref);
            $own = $library->preset($ref);

            // A favorite should never outlive the preset it points at, but say so if it has.
            $label = match (true) {
                $builtIn !== null => $builtIn['label'],
                $own !== null => $own->label,
                default => 'a deleted preset',
            };

            return "- {$label} ({$ref})";
        })->implode("\n");

        return Response::make(Response::text("Favorites:\n{$lines}"))
            ->withStructuredContent(['favorites' => $refs]);
    }

    /** @return array<string, Type> */
    public function schema(JsonSchema $schema): array
    {
        return [];
    }
}

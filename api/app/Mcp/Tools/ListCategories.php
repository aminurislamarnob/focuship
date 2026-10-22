<?php

namespace App\Mcp\Tools;

use App\Catalog\Catalog;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\JsonSchema\Types\Type;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsIdempotent;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Description('The sound categories Focuship groups its catalogue into. Start here when the listener asks what is available.')]
#[IsReadOnly]
#[IsIdempotent]
class ListCategories extends Tool
{
    public function handle(Request $request): ResponseFactory
    {
        $categories = Catalog::categories()
            ->map(fn (array $category) => [
                'id' => $category['id'],
                'label' => $category['label'],
                'sounds' => Catalog::sounds()->where('category', $category['id'])->count(),
            ])
            ->values();

        $lines = $categories->map(
            fn (array $category) => "- {$category['id']} — {$category['label']} ({$category['sounds']} sounds)"
        )->implode("\n");

        return Response::make(Response::text("Focuship's sound categories:\n{$lines}"))
            ->withStructuredContent(['categories' => $categories->all()]);
    }

    /** @return array<string, Type> */
    public function schema(JsonSchema $schema): array
    {
        return [];
    }
}

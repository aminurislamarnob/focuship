<?php

namespace App\Mcp\Tools;

use App\Catalog\Catalog;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\JsonSchema\Types\Type;
use Illuminate\Support\Str;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsIdempotent;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Description('Finds sounds by words, category or kind. Use it to turn a mood like "rainy cafe" into real sound ids before building a mix — ids you guess will be rejected.')]
#[IsReadOnly]
#[IsIdempotent]
class SearchSounds extends Tool
{
    public function handle(Request $request): ResponseFactory
    {
        $query = trim((string) $request->get('query', ''));
        $category = $request->get('category');
        $kind = $request->get('kind');

        $matches = Catalog::sounds()
            ->when($query !== '', fn ($sounds) => $sounds->filter(
                fn (array $sound) => Str::contains(
                    Str::lower($sound['label'].' '.$sound['id'].' '.($sound['note'] ?? '')),
                    Str::lower($query)
                )
            ))
            ->when(filled($category), fn ($sounds) => $sounds->where('category', $category))
            ->when(filled($kind), fn ($sounds) => $sounds->where('kind', $kind))
            ->values();

        if ($matches->isEmpty()) {
            return Response::make(Response::text(
                'No sounds match that. Try a broader word, or call list-categories to see what Focuship has.'
            ))->withStructuredContent(['sounds' => []]);
        }

        $lines = $matches->map(fn (array $sound) => sprintf(
            '- %s — %s (%s, %s)%s',
            $sound['id'],
            $sound['label'],
            $sound['category'],
            $sound['kind'],
            isset($sound['note']) ? ' · '.$sound['note'] : '',
        ))->implode("\n");

        return Response::make(Response::text("{$matches->count()} sounds:\n{$lines}"))
            ->withStructuredContent(['sounds' => $matches->all()]);
    }

    /** @return array<string, Type> */
    public function schema(JsonSchema $schema): array
    {
        return [
            'query' => $schema->string()
                ->description('Words to look for in a sound\'s name, id or note, e.g. "rain" or "cafe".'),

            'category' => $schema->string()
                ->enum(Catalog::categories()->pluck('id')->all())
                ->description('Only sounds in this category.'),

            'kind' => $schema->string()
                ->enum(['file', 'noise', 'binaural', 'drone'])
                ->description('Only sounds of this kind: file (a recording), noise, binaural (needs headphones) or drone.'),
        ];
    }
}

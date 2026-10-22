<?php

namespace App\Catalog;

use Illuminate\Support\Collection;
use RuntimeException;

/**
 * The sound catalogue, generated from the site's TypeScript source (ADR 0002).
 *
 * `npm run export:catalog` writes resources/catalog.json; CI fails when it is stale.
 * Nothing here may be edited by hand.
 */
class Catalog
{
    /** @var array{categories: list<array<string, mixed>>, sounds: list<array<string, mixed>>, presets: list<array<string, mixed>>, guides: list<array<string, mixed>>}|null */
    private static ?array $data = null;

    /** @return array{categories: list<array<string, mixed>>, sounds: list<array<string, mixed>>, presets: list<array<string, mixed>>, guides: list<array<string, mixed>>} */
    private static function data(): array
    {
        if (self::$data === null) {
            $path = resource_path('catalog.json');
            $raw = @file_get_contents($path);

            if ($raw === false) {
                throw new RuntimeException("The catalogue is missing at {$path}. Run \"npm run export:catalog\".");
            }

            /** @var array{categories: list<array<string, mixed>>, sounds: list<array<string, mixed>>, presets: list<array<string, mixed>>, guides: list<array<string, mixed>>} $decoded */
            $decoded = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
            self::$data = $decoded;
        }

        return self::$data;
    }

    /** @return Collection<int, array<string, mixed>> */
    public static function categories(): Collection
    {
        return collect(self::data()['categories']);
    }

    /** @return Collection<int, array<string, mixed>> */
    public static function sounds(): Collection
    {
        return collect(self::data()['sounds']);
    }

    /** @return Collection<int, array<string, mixed>> */
    public static function presets(): Collection
    {
        return collect(self::data()['presets']);
    }

    /** @return Collection<int, array<string, mixed>> */
    public static function guides(): Collection
    {
        return collect(self::data()['guides']);
    }

    public static function hasSound(string $id): bool
    {
        return self::sounds()->contains(fn (array $sound) => $sound['id'] === $id);
    }

    /** @return array<string, mixed>|null */
    public static function sound(string $id): ?array
    {
        return self::sounds()->firstWhere('id', $id);
    }

    /** @return array<string, mixed>|null */
    public static function preset(string $id): ?array
    {
        return self::presets()->firstWhere('id', $id);
    }

    /** @return array<string, mixed>|null */
    public static function guide(string $slug): ?array
    {
        return self::guides()->firstWhere('slug', $slug);
    }

    public static function label(string $soundId): string
    {
        $sound = self::sound($soundId);

        return is_array($sound) ? (string) $sound['label'] : $soundId;
    }

    /** Only for tests that swap the catalogue file. */
    public static function flush(): void
    {
        self::$data = null;
    }
}

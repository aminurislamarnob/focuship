<?php

namespace App\Catalog;

/**
 * The `?mix=` share-link format, mirroring the site's encodeMix/decodeMix (ADR 0002).
 *
 * Ids, ":" and "," are all valid in a query, so links stay readable and unencoded:
 * https://focuship.app/?mix=rain-on-window:60,keyboard:30
 *
 * tests/fixtures/mix-links.json pins the cases both implementations must agree on.
 */
class MixLink
{
    /** A layer whose share link carried no volume opens at half. */
    public const DEFAULT_VOLUME = 0.5;

    /** @param array<string, float|int> $layers */
    public static function encode(array $layers): string
    {
        $parts = [];

        foreach ($layers as $id => $volume) {
            $parts[] = $id.':'.(int) round($volume * 100);
        }

        return implode(',', $parts);
    }

    /** @return array<string, float> */
    public static function decode(string $query): array
    {
        $layers = [];

        foreach (explode(',', $query) as $part) {
            [$id, $raw] = array_pad(explode(':', $part, 2), 2, null);

            if ($id === null || $id === '' || ! Catalog::hasSound($id)) {
                continue;
            }

            $layers[$id] = ($raw === null || $raw === '' || ! is_numeric($raw))
                ? self::DEFAULT_VOLUME
                : self::clamp(((float) $raw) / 100);
        }

        return $layers;
    }

    /**
     * A link that opens this mix. A built-in preset whose mix is untouched shares its own
     * page (/mix/rainy-desk), which previews with its name; anything else spells the mix out.
     *
     * @param  array<string, float|int>  $layers
     */
    public static function url(array $layers): string
    {
        $site = rtrim((string) config('app.frontend_url'), '/');

        $preset = Catalog::presets()->first(
            fn (array $preset) => isset($preset['page']) && self::sameMix($preset['layers'], $layers)
        );

        if (is_array($preset)) {
            return $site.$preset['page'];
        }

        return $site.'/?mix='.self::encode($layers);
    }

    /** Whole percentages in 0..1, the only volumes a share link can carry. */
    public static function clamp(float $volume): float
    {
        return round(max(0.0, min(1.0, $volume)), 2);
    }

    /**
     * Same sounds at the same volumes, to the percent a share link keeps.
     *
     * @param  array<string, float|int>  $a
     * @param  array<string, float|int>  $b
     */
    private static function sameMix(array $a, array $b): bool
    {
        if (count($a) !== count($b) || $a === []) {
            return false;
        }

        foreach ($a as $id => $volume) {
            if (! array_key_exists($id, $b) || round($volume * 100) !== round($b[$id] * 100)) {
                return false;
            }
        }

        return true;
    }
}

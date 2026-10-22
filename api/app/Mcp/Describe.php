<?php

namespace App\Mcp;

use App\Catalog\Catalog;

/** Turning mixes into the sentences an assistant reads back to the listener. */
class Describe
{
    /** @param array<string, float|int> $layers */
    public static function layers(array $layers): string
    {
        if ($layers === []) {
            return 'nothing playing';
        }

        $parts = [];

        foreach ($layers as $id => $volume) {
            $parts[] = sprintf('%s (%s) at %d%%', Catalog::label((string) $id), $id, (int) round($volume * 100));
        }

        return implode(', ', $parts);
    }
}

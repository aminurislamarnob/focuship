<?php

namespace App\Account;

/**
 * The timer preferences the app keeps, and their defaults.
 *
 * Named and defaulted to match the site's own timer so a change made through the MCP
 * means the same thing when the app reads it back.
 */
class TimerSettings
{
    /** @var array<string, int|bool> */
    public const DEFAULTS = [
        'focus' => 25,
        'short' => 5,
        'long' => 15,
        'longEvery' => 4,
        'autoStart' => false,
        'notify' => false,
    ];

    /** Minutes a session may last: long enough to matter, short enough to be a session. */
    public const MIN_MINUTES = 1;

    public const MAX_MINUTES = 180;

    public const MAX_ROUNDS = 12;

    /**
     * @param  array<string, mixed>  $stored
     * @return array<string, int|bool>
     */
    public static function withDefaults(array $stored): array
    {
        /** @var array<string, int|bool> $merged */
        $merged = array_merge(self::DEFAULTS, array_intersect_key($stored, self::DEFAULTS));

        return $merged;
    }
}

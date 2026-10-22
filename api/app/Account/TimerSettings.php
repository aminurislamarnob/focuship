<?php

namespace App\Account;

use Illuminate\Validation\ValidationException;

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

    /** Where the master volume starts, matching the app's own default. */
    public const DEFAULT_VOLUME = 0.8;

    /** Minutes a session may last: long enough to matter, short enough to be a session. */
    public const MIN_MINUTES = 1;

    public const MAX_MINUTES = 180;

    public const MAX_ROUNDS = 12;

    /**
     * A timer the app can actually run, whichever surface it came from.
     *
     * @param  array<string, mixed>  $timer
     *
     * @throws ValidationException
     */
    public static function check(array $timer): void
    {
        foreach (['focus', 'short', 'long'] as $field) {
            if (array_key_exists($field, $timer) && ! self::isWholeNumber($timer[$field], self::MIN_MINUTES, self::MAX_MINUTES)) {
                throw ValidationException::withMessages(['timer' => sprintf(
                    'The %s length must be between %d and %d minutes.',
                    $field,
                    self::MIN_MINUTES,
                    self::MAX_MINUTES,
                )]);
            }
        }

        if (array_key_exists('longEvery', $timer) && ! self::isWholeNumber($timer['longEvery'], 1, self::MAX_ROUNDS)) {
            throw ValidationException::withMessages([
                'timer' => 'Long breaks must come every 1 to '.self::MAX_ROUNDS.' rounds.',
            ]);
        }

        foreach (['autoStart', 'notify'] as $flag) {
            if (array_key_exists($flag, $timer) && ! is_bool($timer[$flag])) {
                throw ValidationException::withMessages(['timer' => "{$flag} must be true or false."]);
            }
        }
    }

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

    private static function isWholeNumber(mixed $value, int $min, int $max): bool
    {
        return is_int($value) && $value >= $min && $value <= $max;
    }
}

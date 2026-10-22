<?php

namespace App\Account;

use Illuminate\Validation\ValidationException;

/**
 * A mix naming sounds Focuship does not have. Its own type so a surface can say how to
 * find the right ids, which no other mix error calls for.
 */
class UnknownSounds extends ValidationException
{
    /** @param list<array-key> $ids */
    public static function named(array $ids): self
    {
        /** @var self $e */
        $e = self::withMessages([
            'layers' => 'Focuship has no sound called '.implode(', ', array_map(strval(...), $ids)).'.',
        ]);

        return $e;
    }
}

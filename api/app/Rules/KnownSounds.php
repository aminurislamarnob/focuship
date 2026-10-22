<?php

namespace App\Rules;

use App\Catalog\Catalog;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Every layer must name a sound Focuship can actually play, so a preset saved
 * through the API or the MCP always opens.
 */
class KnownSounds implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_array($value)) {
            return;
        }

        $unknown = array_values(array_filter(
            array_keys($value),
            fn ($id) => ! Catalog::hasSound((string) $id)
        ));

        if ($unknown !== []) {
            $fail('Focuship has no sound called '.implode(', ', array_map(strval(...), $unknown)).'.');
        }
    }
}

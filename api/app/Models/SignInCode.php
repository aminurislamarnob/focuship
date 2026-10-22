<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * An emailed 6-digit sign-in code. Only the hash is stored.
 *
 * @property string $email
 * @property string $code_hash
 * @property int $attempts
 * @property Carbon|null $consumed_at
 * @property Carbon $expires_at
 */
#[Fillable(['email', 'code_hash', 'expires_at'])]
class SignInCode extends Model
{
    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'consumed_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * The synced slice of a listener's settings: timer preferences and master volume.
 * `updated_at` is the clock that decides which device wins (last write wins).
 *
 * @property int $user_id
 * @property array<string, mixed> $timer
 * @property float $volume
 * @property Carbon $updated_at
 */
#[Fillable(['user_id', 'timer', 'volume', 'updated_at'])]
class UserSettings extends Model
{
    protected $table = 'user_settings';

    protected $primaryKey = 'user_id';

    public $incrementing = false;

    public const CREATED_AT = null;

    /** Milliseconds matter: `updated_at` is the clock that decides which device wins. */
    protected $dateFormat = 'Y-m-d H:i:s.v';

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['timer' => 'array', 'volume' => 'float', 'updated_at' => 'datetime'];
    }
}

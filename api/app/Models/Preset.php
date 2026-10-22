<?php

namespace App\Models;

use Database\Factories\PresetFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A mix the listener saved. The id is a UUID because a shared preset's id is its link.
 *
 * @property string $id
 * @property int $user_id
 * @property string $label
 * @property array<string, float> $layers
 * @property bool $is_public
 */
#[Fillable(['id', 'label', 'layers', 'is_public'])]
class Preset extends Model
{
    /** @use HasFactory<PresetFactory> */
    use HasFactory, HasUuids;

    /** How many a listener may keep. */
    public const LIMIT = 50;

    public $incrementing = false;

    protected $keyType = 'string';

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['layers' => 'array', 'is_public' => 'boolean'];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @param Builder<Preset> $query */
    public function scopePublic(Builder $query): void
    {
        $query->where('is_public', true);
    }

    /** The shape the site and the MCP speak in. */
    /** @return array{id: string, label: string, layers: array<string, float>, isPublic: bool} */
    public function toCloudPreset(): array
    {
        return [
            'id' => $this->id,
            'label' => $this->label,
            'layers' => $this->layers,
            'isPublic' => $this->is_public,
        ];
    }
}

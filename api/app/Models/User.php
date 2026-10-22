<?php

namespace App\Models;

use App\Account\Library;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/**
 * A Focuship listener. Accounts are passwordless (ADR 0001).
 *
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string|null $avatar_url
 */
#[Fillable(['name', 'email', 'avatar_url', 'email_verified_at'])]
#[Hidden(['remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
        ];
    }

    /** @return HasMany<Preset, $this> */
    public function presets(): HasMany
    {
        return $this->hasMany(Preset::class);
    }

    /** @return HasMany<Favorite, $this> */
    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }

    /** @return HasOne<UserSettings, $this> */
    public function settings(): HasOne
    {
        return $this->hasOne(UserSettings::class);
    }

    /** @return HasMany<SocialIdentity, $this> */
    public function identities(): HasMany
    {
        return $this->hasMany(SocialIdentity::class);
    }

    public function library(): Library
    {
        return new Library($this);
    }

    /** How the site and the MCP describe the signed-in listener. */
    /** @return array{id: string, email: string, name: string, avatarUrl: string|null} */
    public function toCloudUser(): array
    {
        return [
            'id' => (string) $this->id,
            'email' => $this->email,
            'name' => $this->name,
            'avatarUrl' => $this->avatar_url,
        ];
    }
}

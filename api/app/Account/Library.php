<?php

namespace App\Account;

use App\Catalog\Catalog;
use App\Models\Favorite;
use App\Models\Preset;
use App\Models\User;
use App\Models\UserSettings;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

/**
 * One listener's library: their saved presets, favorites and synced settings.
 *
 * Both surfaces go through here — the site's account API and the MCP's tools — so a
 * rule like the fifty-preset cap is written once and cannot differ between them.
 */
class Library
{
    public function __construct(private readonly User $user) {}

    // Presets -----------------------------------------------------------------

    /** @return Collection<int, Preset> */
    public function presets(): Collection
    {
        return $this->user->presets()->latest('created_at')->latest('id')->get();
    }

    public function preset(string $id): ?Preset
    {
        return $this->user->presets()->whereKey($id)->first();
    }

    /**
     * @param  array<string, float|int>  $layers
     *
     * @throws ValidationException when the listener is already at the cap
     */
    public function savePreset(string $id, string $label, array $layers): Preset
    {
        if ($this->user->presets()->count() >= Preset::LIMIT) {
            throw ValidationException::withMessages([
                'label' => "You've reached ".Preset::LIMIT.' saved presets. Delete one to save another.',
            ]);
        }

        return $this->user->presets()->create([
            'id' => $id,
            'label' => trim($label),
            'layers' => self::cleanLayers($layers),
            'is_public' => false,
        ]);
    }

    public function renamePreset(Preset $preset, string $label): Preset
    {
        $preset->update(['label' => trim($label)]);

        return $preset;
    }

    public function setPresetPublic(Preset $preset, bool $isPublic): Preset
    {
        $preset->update(['is_public' => $isPublic]);

        return $preset;
    }

    public function deletePreset(Preset $preset): void
    {
        // A favorite pointing at a preset that no longer exists would be a dead star.
        $this->removeFavorite($preset->id);

        $preset->delete();
    }

    /** A preset by share link: only ones their owner made public. */
    public static function sharedPreset(string $id): ?Preset
    {
        if (! self::looksLikeUuid($id)) {
            return null;
        }

        return Preset::query()->public()->whereKey($id)->first();
    }

    // Favorites ---------------------------------------------------------------

    /** @return list<string> */
    public function favorites(): array
    {
        return $this->user->favorites()
            ->orderBy('id')
            ->pluck('preset_ref')
            ->map(strval(...))
            ->all();
    }

    public function addFavorite(string $ref): void
    {
        // Favoriting twice is the same as favoriting once.
        Favorite::firstOrCreate(['user_id' => $this->user->id, 'preset_ref' => $ref]);
    }

    public function removeFavorite(string $ref): void
    {
        $this->user->favorites()->where('preset_ref', $ref)->delete();
    }

    /** A favorite must point at a built-in preset or one of the listener's own. */
    public function canFavorite(string $ref): bool
    {
        return Catalog::preset($ref) !== null || $this->preset($ref) !== null;
    }

    // Settings ----------------------------------------------------------------

    /** @return array{timer: array<string, mixed>, volume: float, updatedAt: int}|null */
    public function settings(): ?array
    {
        // Queried, never read off the model: a cached relation can be stale by now.
        $settings = $this->user->settings()->first();

        if ($settings === null) {
            return null;
        }

        return [
            'timer' => $settings->timer,
            'volume' => $settings->volume,
            'updatedAt' => $settings->updated_at->getTimestampMs(),
        ];
    }

    /**
     * Last write wins: a device that was offline must not undo a newer change.
     *
     * @param  array<string, mixed>  $timer
     */
    public function saveSettings(array $timer, float $volume, int $updatedAt): void
    {
        $existing = $this->user->settings()->first();

        if ($existing !== null && $existing->updated_at->getTimestampMs() > $updatedAt) {
            return;
        }

        UserSettings::updateOrCreate(
            ['user_id' => $this->user->id],
            ['timer' => $timer, 'volume' => $volume, 'updated_at' => Carbon::createFromTimestampMs($updatedAt)],
        );

        $this->user->unsetRelation('settings');
    }

    // ---------------------------------------------------------------------------

    /**
     * Volumes the app can actually play: known sounds, each between silence and full.
     *
     * @param  array<string, float|int>  $layers
     * @return array<string, float>
     */
    public static function cleanLayers(array $layers): array
    {
        $clean = [];

        foreach ($layers as $id => $volume) {
            if (Catalog::hasSound((string) $id)) {
                $clean[(string) $id] = round(max(0.0, min(1.0, (float) $volume)), 3);
            }
        }

        return $clean;
    }

    private static function looksLikeUuid(string $id): bool
    {
        return preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $id) === 1;
    }
}

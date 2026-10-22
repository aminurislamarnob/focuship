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
    /** A mix nobody could hear all of at once is a mistake, not a preset. */
    public const MAX_LAYERS = 20;

    public const MIN_LABEL = 1;

    public const MAX_LABEL = 60;

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
     * @param  array<array-key, mixed>  $layers
     *
     * @throws ValidationException when the label, the mix or the cap says no
     */
    public function savePreset(string $id, string $label, array $layers): Preset
    {
        $label = self::checkLabel($label);
        $layers = self::checkLayers($layers);

        if ($this->user->presets()->count() >= Preset::LIMIT) {
            throw ValidationException::withMessages([
                'label' => "You've reached ".Preset::LIMIT.' saved presets. Delete one to save another.',
            ]);
        }

        return $this->user->presets()->create([
            'id' => $id,
            'label' => $label,
            'layers' => $layers,
            'is_public' => false,
        ]);
    }

    /** @throws ValidationException when the label is one nobody could read */
    public function renamePreset(Preset $preset, string $label): Preset
    {
        $preset->update(['label' => self::checkLabel($label)]);

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
     *
     * @throws ValidationException when the timer or volume is one the app cannot use
     */
    public function saveSettings(array $timer, float $volume, int $updatedAt): void
    {
        TimerSettings::check($timer);

        if ($volume < 0 || $volume > 1) {
            throw ValidationException::withMessages([
                'volume' => 'Volume must be a number between 0 (silent) and 1 (full).',
            ]);
        }

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
     * A name the listener will recognise in their library.
     *
     * @throws ValidationException
     */
    public static function checkLabel(string $label): string
    {
        $label = trim($label);
        $length = mb_strlen($label);

        if ($length < self::MIN_LABEL || $length > self::MAX_LABEL) {
            throw ValidationException::withMessages([
                'label' => 'A preset name needs to be between '.self::MIN_LABEL.' and '.self::MAX_LABEL.' characters.',
            ]);
        }

        return $label;
    }

    /**
     * A mix Focuship can actually play. Unknown sounds are refused by name — guessing
     * one would hand the listener a preset that opens to silence — and so are volumes
     * that are not numbers, for the same reason. Numbers out of range are clamped,
     * because an over-eager 1.4 still means "as loud as it goes".
     *
     * @param  array<array-key, mixed>  $layers
     * @return array<string, float>
     *
     * @throws UnknownSounds when the mix names a sound Focuship does not have
     * @throws ValidationException when the mix is empty, too big or not in volumes
     */
    public static function checkLayers(array $layers): array
    {
        if ($layers === [] || count($layers) > self::MAX_LAYERS) {
            throw ValidationException::withMessages([
                'layers' => 'A mix needs between 1 and '.self::MAX_LAYERS.' sounds.',
            ]);
        }

        $unknown = array_values(array_filter(
            array_keys($layers),
            fn ($id) => ! Catalog::hasSound((string) $id)
        ));

        if ($unknown !== []) {
            throw UnknownSounds::named($unknown);
        }

        $clean = [];

        foreach ($layers as $id => $volume) {
            if (! is_numeric($volume)) {
                throw ValidationException::withMessages([
                    'layers' => "The volume for {$id} must be a number between 0 and 1.",
                ]);
            }

            $clean[(string) $id] = round(max(0.0, min(1.0, (float) $volume)), 3);
        }

        return $clean;
    }

    private static function looksLikeUuid(string $id): bool
    {
        return preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $id) === 1;
    }
}

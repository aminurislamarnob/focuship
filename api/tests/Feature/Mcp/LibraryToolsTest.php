<?php

use App\Models\Preset;

/** Managing the listener's own library through a connected assistant. */
it('offers the library tools', function () {
    expect(mcpToolNames(listener()))->toContain(
        'list-my-presets', 'save-preset', 'rename-preset', 'set-preset-public', 'delete-preset',
        'list-favorites', 'add-favorite', 'remove-favorite', 'get-settings', 'update-settings',
    );
});

it('never offers to delete the account', function () {
    expect(mcpToolNames(listener()))->not->toContain('delete-account');
});

it('warns the assistant that deleting a preset cannot be undone', function () {
    $tool = mcpTool(listener(), 'delete-preset');

    expect($tool['annotations']['destructiveHint'] ?? false)->toBeTrue();
});

it('tells the assistant which tools only read', function (string $name) {
    expect(mcpTool(listener(), $name)['annotations']['readOnlyHint'] ?? false)->toBeTrue();
})->with(['whoami', 'list-categories', 'search-sounds', 'list-presets', 'get-preset', 'build-mix', 'list-my-presets', 'list-favorites', 'get-settings']);

// Presets ---------------------------------------------------------------------

it('lists the listener’s saved presets', function () {
    $ada = listener();
    Preset::factory()->for($ada)->create(['label' => 'Thunder desk']);

    expect($this->mcpTool($ada, 'list-my-presets'))->toContain('Thunder desk');
});

it('saves a mix the assistant designed', function () {
    $ada = listener();

    $result = $this->mcpTool($ada, 'save-preset', [
        'label' => 'Rainy café',
        'layers' => ['cafe' => 0.5, 'light-rain' => 0.3],
    ]);

    expect($result)->toContain('Rainy café');
    expect($ada->library()->presets()->pluck('label'))->toContain('Rainy café');
});

it('tells the assistant when the library is full', function () {
    $ada = listener();
    Preset::factory()->for($ada)->count(50)->create();

    expect($this->mcpError($ada, 'save-preset', ['label' => 'One more', 'layers' => ['cafe' => 0.5]]))
        ->toContain('50 saved presets');
});

it('refuses to save a sound that does not exist, and says how to find the right one', function () {
    $ada = listener();

    expect($this->mcpError($ada, 'save-preset', ['label' => 'Moon', 'layers' => ['rain-on-moon' => 0.5]]))
        ->toContain('rain-on-moon')
        ->toContain('search-sounds');
    expect($ada->library()->presets())->toBeEmpty();
});

it('refuses to save a volume that is not a number, rather than a silent preset', function () {
    $ada = listener();

    expect($this->mcpError($ada, 'save-preset', ['label' => 'Loud café', 'layers' => ['cafe' => 'loud']]))
        ->toContain('between 0 and 1');
    expect($ada->library()->presets())->toBeEmpty();
});

it('renames a preset', function () {
    $preset = Preset::factory()->for($ada = listener())->create(['label' => 'Old']);

    $this->mcpTool($ada, 'rename-preset', ['id' => $preset->id, 'label' => 'New']);

    expect($preset->fresh()->label)->toBe('New');
});

it('shares a preset and hands back the link', function () {
    $preset = Preset::factory()->for($ada = listener())->create(['is_public' => false]);

    $result = $this->mcpTool($ada, 'set-preset-public', ['id' => $preset->id, 'isPublic' => true]);

    expect($result)->toContain(config('app.frontend_url').'/?p='.$preset->id);
    expect($preset->fresh()->is_public)->toBeTrue();
});

it('stops sharing a preset', function () {
    $preset = Preset::factory()->for($ada = listener())->create(['is_public' => true]);

    $this->mcpTool($ada, 'set-preset-public', ['id' => $preset->id, 'isPublic' => false]);

    expect($preset->fresh()->is_public)->toBeFalse();
});

it('deletes a preset', function () {
    $preset = Preset::factory()->for($ada = listener())->create();

    $this->mcpTool($ada, 'delete-preset', ['id' => $preset->id]);

    expect(Preset::find($preset->id))->toBeNull();
});

it('cannot touch another listener’s preset', function (string $tool, array $extra) {
    $theirs = Preset::factory()->for(listener())->create(['label' => 'Theirs']);

    expect($this->mcpError(listener(), $tool, ['id' => $theirs->id] + $extra))->toContain('No preset');

    expect($theirs->fresh())->not->toBeNull();
    expect($theirs->fresh()->label)->toBe('Theirs');
})->with([
    ['rename-preset', ['label' => 'Mine now']],
    ['set-preset-public', ['isPublic' => true]],
    ['delete-preset', []],
]);

// Favorites -------------------------------------------------------------------

it('favorites a preset and lists it back', function () {
    $ada = listener();

    $this->mcpTool($ada, 'add-favorite', ['ref' => 'deep-work']);

    expect($this->mcpTool($ada, 'list-favorites'))->toContain('Deep work');
    expect($ada->library()->favorites())->toBe(['deep-work']);
});

it('refuses to favorite something that is not a preset', function () {
    expect($this->mcpError(listener(), 'add-favorite', ['ref' => 'no-such-thing']))->toContain('no preset');
});

it('unfavorites', function () {
    $ada = listener();
    $ada->library()->addFavorite('deep-work');

    $this->mcpTool($ada, 'remove-favorite', ['ref' => 'deep-work']);

    expect($ada->library()->favorites())->toBe([]);
});

it('says plainly when nothing is favorited', function () {
    expect($this->mcpTool(listener(), 'list-favorites'))->toContain('no favorites');
});

// Settings --------------------------------------------------------------------

it('reports the listener’s timer and volume', function () {
    $ada = listener();
    $ada->library()->saveSettings(
        ['focus' => 50, 'short' => 10, 'long' => 20, 'longEvery' => 3],
        0.7,
        now()->getTimestampMs()
    );

    expect($this->mcpTool($ada, 'get-settings'))->toContain('50')->toContain('0.7');
});

it('reports the app’s defaults before anything has been synced', function () {
    expect($this->mcpTool(listener(), 'get-settings'))->toContain('25');
});

it('changes the timer, and the app sees it', function () {
    $ada = listener();

    $this->mcpTool($ada, 'update-settings', ['focus' => 50, 'short' => 10]);

    $settings = $ada->fresh()->library()->settings();
    expect($settings['timer']['focus'])->toBe(50);
    expect($settings['timer']['short'])->toBe(10);
    // Untouched preferences keep their value rather than snapping back to a default.
    expect($settings['timer']['longEvery'])->toBe(4);
});

it('changes the volume', function () {
    $ada = listener();

    $this->mcpTool($ada, 'update-settings', ['volume' => 0.25]);

    expect($ada->fresh()->library()->settings()['volume'])->toBe(0.25);
});

it('refuses a timer nobody could work with', function (array $arguments) {
    expect($this->mcpError(listener(), 'update-settings', $arguments))->not->toBe('');
})->with([
    'no focus time' => [['focus' => 0]],
    'a whole day of focus' => [['focus' => 1000]],
    'volume past the top' => [['volume' => 3]],
    'nothing at all' => [[]],
]);

it('never shows one listener another’s library', function () {
    $other = listener();
    Preset::factory()->for($other)->create(['label' => 'Not yours']);
    $other->library()->addFavorite('deep-work');

    $ada = listener();

    expect($this->mcpTool($ada, 'list-my-presets'))->not->toContain('Not yours');
    expect($this->mcpTool($ada, 'list-favorites'))->toContain('no favorites');
});

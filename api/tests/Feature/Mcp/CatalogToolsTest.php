<?php

use App\Catalog\Catalog;
use App\Models\Preset;

/** Browsing the catalogue and designing a mix, through a connected assistant. */
it('offers the catalogue tools', function () {
    expect(mcpToolNames(listener()))->toContain(
        'list-categories', 'search-sounds', 'list-presets', 'get-preset', 'build-mix',
    );
});

it('lists the sound categories', function () {
    expect($this->mcpTool(listener(), 'list-categories'))
        ->toContain('Rain')
        ->toContain('Noise & tones');
});

it('finds sounds by what the listener called them', function () {
    expect($this->mcpTool(listener(), 'search-sounds', ['query' => 'rain']))
        ->toContain('rain-on-window')
        ->not->toContain('keyboard');
});

it('finds sounds by category', function () {
    expect($this->mcpTool(listener(), 'search-sounds', ['category' => 'generated']))
        ->toContain('brown-noise')
        ->not->toContain('cafe');
});

it('finds sounds by kind, so "no binaural beats" can be honoured', function () {
    $binaural = $this->mcpTool(listener(), 'search-sounds', ['kind' => 'binaural']);

    expect($binaural)->toContain('alpha')->not->toContain('rain-on-window');
});

it('says so plainly when nothing matches', function () {
    expect($this->mcpTool(listener(), 'search-sounds', ['query' => 'bagpipes']))
        ->toContain('No sounds match');
});

it('lists the built-in presets and what is in them', function () {
    expect($this->mcpTool(listener(), 'list-presets'))
        ->toContain('deep-work')
        ->toContain('brown-noise');
});

it('looks up a built-in preset', function () {
    expect($this->mcpTool(listener(), 'get-preset', ['id' => 'rainy-desk']))
        ->toContain('Rainy desk')
        ->toContain('rain-on-window');
});

it('opens a preset someone shared publicly', function () {
    $preset = Preset::factory()->for(listener())->create(['is_public' => true, 'label' => 'Storm watch']);

    expect($this->mcpTool(listener(), 'get-preset', ['id' => $preset->id]))->toContain('Storm watch');
});

it('will not open someone else’s private preset', function () {
    $preset = Preset::factory()->for(listener())->create(['is_public' => false, 'label' => 'Private']);

    expect($this->mcpError(listener(), 'get-preset', ['id' => $preset->id]))
        ->toContain('No preset')
        ->not->toContain('Private');
});

it('builds a mix and hands back a link that opens it', function () {
    $result = $this->mcpTool(listener(), 'build-mix', [
        'layers' => ['rain-on-window' => 0.6, 'keyboard' => 0.25],
    ]);

    expect($result)
        ->toContain(config('app.frontend_url').'/?mix=rain-on-window:60,keyboard:25')
        ->toContain('On the window')
        ->toContain('Keyboard');
});

it('shares a built-in preset by its own page when the mix is untouched', function () {
    $result = $this->mcpTool(listener(), 'build-mix', [
        'layers' => ['cafe' => 0.6, 'light-rain' => 0.3],
    ]);

    expect($result)->toContain(config('app.frontend_url').'/mix/corner-cafe');
});

it('refuses a sound that does not exist, and says which', function () {
    expect($this->mcpError(listener(), 'build-mix', ['layers' => ['rain-on-moon' => 0.5]]))
        ->toContain('rain-on-moon');
});

it('clamps a volume an over-eager assistant set too high, rather than refusing', function () {
    // 1.4 still means "as loud as it goes": the listener gets a mix, not an error.
    expect($this->mcpTool(listener(), 'build-mix', ['layers' => ['cafe' => 1.4]]))
        ->toContain('/?mix=cafe:100')
        ->toContain('at 100%');
});

it('clamps a negative volume to silence', function () {
    expect($this->mcpTool(listener(), 'build-mix', ['layers' => ['cafe' => -2]]))
        ->toContain('/?mix=cafe:0');
});

it('refuses a mix with nothing in it', function () {
    expect($this->mcpError(listener(), 'build-mix', ['layers' => []]))->not->toBe('');
});

it('refuses a mix nobody could hear all of at once', function () {
    $tooMany = Catalog::sounds()->take(21)
        ->mapWithKeys(fn (array $sound) => [$sound['id'] => 0.5])
        ->all();

    expect($this->mcpError(listener(), 'build-mix', ['layers' => $tooMany]))->toContain('1 and 20 sounds');
});

it('publishes the catalogue and the guides to read', function () {
    $response = $this->mcp(listener(), 'resources/list')->assertOk();

    $uris = collect(mcpPayload($response)['result']['resources'] ?? [])->pluck('uri');

    expect($uris)->toContain('focuship://catalog')->toContain('focuship://guides');
});

it('offers a prompt for designing a mix', function () {
    $response = $this->mcp(listener(), 'prompts/list')->assertOk();

    expect(collect(mcpPayload($response)['result']['prompts'] ?? [])->pluck('name'))
        ->toContain('design-a-mix');
});

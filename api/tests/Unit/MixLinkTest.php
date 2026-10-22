<?php

use App\Catalog\MixLink;

/**
 * The share-link format is shared with the site (ADR 0002): both sides must reproduce
 * tests/fixtures/mix-links.json exactly, or links the MCP builds open the wrong mix.
 */
function mixLinkFixtures(string $group): array
{
    $json = json_decode((string) file_get_contents(dirname(__DIR__, 3).'/tests/fixtures/mix-links.json'), true);

    return collect($json[$group])->mapWithKeys(fn (array $case) => [
        $case['name'] => [$case],
    ])->all();
}

dataset('encode cases', mixLinkFixtures('encode'));
dataset('decode cases', mixLinkFixtures('decode'));

it('encodes a mix the way the site does', function (array $case) {
    expect(MixLink::encode($case['layers']))->toBe($case['query']);
})->with('encode cases');

it('decodes a mix the way the site does', function (array $case) {
    // JSON has no float/int distinction for 0 and 1; the volumes themselves are what matter.
    $expected = array_map(floatval(...), $case['decoded']);

    expect(MixLink::decode($case['query']))->toBe($expected);
})->with('decode cases');

it('builds a share URL on the site origin', function () {
    config(['app.frontend_url' => 'https://focuship.app']);

    expect(MixLink::url(['rain-on-window' => 0.6, 'keyboard' => 0.25]))
        ->toBe('https://focuship.app/?mix=rain-on-window:60,keyboard:25');
});

it('shares a built-in preset by its own page when the mix is untouched', function () {
    config(['app.frontend_url' => 'https://focuship.app']);

    expect(MixLink::url(['rain-on-window' => 0.6, 'keyboard' => 0.25, 'pink-noise' => 0.2]))
        ->toBe('https://focuship.app/mix/rainy-desk');
});

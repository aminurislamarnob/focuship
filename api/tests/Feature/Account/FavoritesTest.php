<?php

use App\Models\Preset;

it('needs an account', function () {
    $this->getJson('/account/favorites', fromSite())->assertUnauthorized();
});

it('starts with nothing favorited', function () {
    $this->actingAs(listener())
        ->getJson('/account/favorites', fromSite())
        ->assertOk()
        ->assertExactJson(['favorites' => []]);
});

it('favorites a built-in preset', function () {
    $this->actingAs($ada = listener())
        ->postJson('/account/favorites', ['ref' => 'deep-work'], fromSite())
        ->assertNoContent();

    $this->actingAs($ada)
        ->getJson('/account/favorites', fromSite())
        ->assertJsonPath('favorites', ['deep-work']);
});

it('favorites one of the listener’s own presets', function () {
    $preset = Preset::factory()->for($ada = listener())->create();

    $this->actingAs($ada)
        ->postJson('/account/favorites', ['ref' => $preset->id], fromSite())
        ->assertNoContent();

    $this->actingAs($ada)->getJson('/account/favorites', fromSite())->assertJsonPath('favorites', [$preset->id]);
});

it('refuses to favorite something that is not a preset', function () {
    $this->actingAs(listener())
        ->postJson('/account/favorites', ['ref' => 'no-such-preset'], fromSite())
        ->assertStatus(422)
        ->assertJsonValidationErrors('ref');
});

it('favoriting twice is the same as favoriting once', function () {
    $ada = listener();

    $this->actingAs($ada)->postJson('/account/favorites', ['ref' => 'deep-work'], fromSite())->assertNoContent();
    $this->actingAs($ada)->postJson('/account/favorites', ['ref' => 'deep-work'], fromSite())->assertNoContent();

    $this->actingAs($ada)->getJson('/account/favorites', fromSite())->assertJsonPath('favorites', ['deep-work']);
});

it('unfavorites', function () {
    $ada = listener();
    $this->actingAs($ada)->postJson('/account/favorites', ['ref' => 'deep-work'], fromSite());

    $this->actingAs($ada)
        ->deleteJson('/account/favorites/deep-work', [], fromSite())
        ->assertNoContent();

    $this->actingAs($ada)->getJson('/account/favorites', fromSite())->assertJsonPath('favorites', []);
});

it('unfavoriting something that was never a favorite is fine', function () {
    $this->actingAs(listener())
        ->deleteJson('/account/favorites/deep-work', [], fromSite())
        ->assertNoContent();
});

it('never shows another listener’s favorites', function () {
    $other = listener();
    $this->actingAs($other)->postJson('/account/favorites', ['ref' => 'deep-work'], fromSite());

    $this->actingAs(listener())
        ->getJson('/account/favorites', fromSite())
        ->assertJsonPath('favorites', []);
});

it('forgets the favorite when the preset it points at is deleted', function () {
    $preset = Preset::factory()->for($ada = listener())->create();
    $this->actingAs($ada)->postJson('/account/favorites', ['ref' => $preset->id], fromSite());

    $this->actingAs($ada)->deleteJson("/account/presets/{$preset->id}", [], fromSite())->assertNoContent();

    $this->actingAs($ada)->getJson('/account/favorites', fromSite())->assertJsonPath('favorites', []);
});

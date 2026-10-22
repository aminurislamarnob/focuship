<?php

use App\Models\Preset;
use App\Models\SocialIdentity;
use App\Models\User;

it('needs an account', function () {
    $this->deleteJson('/account', [], fromSite())->assertUnauthorized();
});

it('deletes the listener and everything they saved', function () {
    $ada = listener(['email' => 'ada@example.com']);
    Preset::factory()->for($ada)->count(3)->create();
    SocialIdentity::create(['user_id' => $ada->id, 'provider' => 'github', 'provider_user_id' => 'gh-1']);
    $this->actingAs($ada)->postJson('/account/favorites', ['ref' => 'deep-work'], fromSite());
    $this->actingAs($ada)->putJson('/account/settings', [
        'timer' => ['focus' => 25], 'volume' => 0.5, 'updatedAt' => now()->getTimestampMs(),
    ], fromSite());

    $this->actingAs($ada)->deleteJson('/account', [], fromSite())->assertNoContent();

    expect(User::find($ada->id))->toBeNull();
    $this->assertDatabaseCount('presets', 0);
    $this->assertDatabaseCount('favorites', 0);
    $this->assertDatabaseCount('user_settings', 0);
    $this->assertDatabaseCount('social_identities', 0);
});

it('leaves the listener signed out', function () {
    $this->actingAs(listener())->deleteJson('/account', [], fromSite())->assertNoContent();

    $this->assertGuest();
});

it('leaves everyone else untouched', function () {
    $other = listener();
    Preset::factory()->for($other)->create();

    $this->actingAs(listener())->deleteJson('/account', [], fromSite())->assertNoContent();

    expect(User::find($other->id))->not->toBeNull();
    $this->assertDatabaseCount('presets', 1);
});

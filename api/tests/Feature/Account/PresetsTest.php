<?php

use App\Models\Preset;
use Illuminate\Support\Str;

it('needs an account', function () {
    $this->getJson('/account/presets', fromSite())->assertUnauthorized();
});

it('lists the listener’s presets, newest first', function () {
    $ada = listener();
    Preset::factory()->for($ada)->create(['label' => 'Older', 'created_at' => now()->subDay()]);
    Preset::factory()->for($ada)->create(['label' => 'Newer']);

    $this->actingAs($ada)
        ->getJson('/account/presets', fromSite())
        ->assertOk()
        ->assertJsonPath('presets.0.label', 'Newer')
        ->assertJsonPath('presets.1.label', 'Older');
});

it('never shows another listener’s presets', function () {
    Preset::factory()->for(listener())->create(['label' => 'Not yours']);

    $this->actingAs(listener())
        ->getJson('/account/presets', fromSite())
        ->assertOk()
        ->assertJsonCount(0, 'presets');
});

it('saves a mix as a preset', function () {
    $id = (string) Str::uuid();

    $this->actingAs($ada = listener())
        ->postJson('/account/presets', [
            'id' => $id,
            'label' => 'Rainy desk',
            'layers' => ['rain-on-window' => 0.6, 'keyboard' => 0.25],
        ], fromSite())
        ->assertCreated()
        ->assertJsonPath('preset.id', $id)
        ->assertJsonPath('preset.isPublic', false);

    $this->assertDatabaseHas('presets', ['id' => $id, 'user_id' => $ada->id, 'label' => 'Rainy desk']);
});

it('refuses a preset built from sounds that do not exist', function () {
    $this->actingAs(listener())
        ->postJson('/account/presets', [
            'id' => (string) Str::uuid(),
            'label' => 'Nonsense',
            'layers' => ['not-a-sound' => 0.5],
        ], fromSite())
        ->assertStatus(422)
        ->assertJsonValidationErrors('layers');
});

it('refuses a preset with no sounds in it', function () {
    $this->actingAs(listener())
        ->postJson('/account/presets', ['id' => (string) Str::uuid(), 'label' => 'Empty', 'layers' => []], fromSite())
        ->assertStatus(422)
        ->assertJsonValidationErrors('layers');
});

it('refuses a label nobody could read', function (string $label) {
    $this->actingAs(listener())
        ->postJson('/account/presets', [
            'id' => (string) Str::uuid(),
            'label' => $label,
            'layers' => ['cafe' => 0.5],
        ], fromSite())
        ->assertStatus(422)
        ->assertJsonValidationErrors('label');
})->with(['', '   ', 'x']);

it('stops at fifty saved presets and says why', function () {
    $ada = listener();
    Preset::factory()->for($ada)->count(50)->create();

    $this->actingAs($ada)
        ->postJson('/account/presets', [
            'id' => (string) Str::uuid(),
            'label' => 'One too many',
            'layers' => ['cafe' => 0.5],
        ], fromSite())
        ->assertStatus(422)
        ->assertJsonValidationErrors('label')
        ->assertJsonFragment(['label' => ["You've reached 50 saved presets. Delete one to save another."]]);

    expect(Preset::count())->toBe(50);
});

it('renames a preset', function () {
    $preset = Preset::factory()->for($ada = listener())->create(['label' => 'Old name']);

    $this->actingAs($ada)
        ->patchJson("/account/presets/{$preset->id}", ['label' => 'New name'], fromSite())
        ->assertOk()
        ->assertJsonPath('preset.label', 'New name');
});

it('shares a preset and stops sharing it again', function () {
    $preset = Preset::factory()->for($ada = listener())->create(['is_public' => false]);

    $this->actingAs($ada)
        ->patchJson("/account/presets/{$preset->id}", ['isPublic' => true], fromSite())
        ->assertOk()
        ->assertJsonPath('preset.isPublic', true);

    $this->actingAs($ada)
        ->patchJson("/account/presets/{$preset->id}", ['isPublic' => false], fromSite())
        ->assertJsonPath('preset.isPublic', false);
});

it('deletes a preset', function () {
    $preset = Preset::factory()->for($ada = listener())->create();

    $this->actingAs($ada)
        ->deleteJson("/account/presets/{$preset->id}", [], fromSite())
        ->assertNoContent();

    $this->assertDatabaseMissing('presets', ['id' => $preset->id]);
});

it('cannot touch a preset belonging to someone else', function (string $method) {
    $preset = Preset::factory()->for(listener())->create(['label' => 'Theirs']);

    $this->actingAs(listener())
        ->json($method, "/account/presets/{$preset->id}", ['label' => 'Mine now'], fromSite())
        ->assertNotFound();

    expect($preset->fresh()->label)->toBe('Theirs');
})->with(['PATCH', 'DELETE']);

it('opens a shared preset for anyone with the link', function () {
    $preset = Preset::factory()->for(listener())->create(['is_public' => true, 'label' => 'Storm watch']);

    $this->getJson("/presets/{$preset->id}")
        ->assertOk()
        ->assertJsonPath('preset.label', 'Storm watch')
        ->assertJsonPath('preset.layers', $preset->fresh()->layers);
});

it('keeps a private preset private, link or no link', function () {
    $preset = Preset::factory()->for(listener())->create(['is_public' => false]);

    $this->getJson("/presets/{$preset->id}")->assertNotFound();
});

it('treats a mangled share link as gone, not broken', function () {
    $this->getJson('/presets/not-a-uuid')->assertNotFound();
});

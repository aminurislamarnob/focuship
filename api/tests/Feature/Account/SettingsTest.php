<?php

$timer = ['focus' => 25, 'short' => 5, 'long' => 15, 'longEvery' => 4, 'autoStart' => false, 'notify' => false];

it('needs an account', function () {
    $this->getJson('/account/settings', fromSite())->assertUnauthorized();
});

it('has nothing to sync until the listener changes something', function () {
    $this->actingAs(listener())
        ->getJson('/account/settings', fromSite())
        ->assertOk()
        ->assertExactJson(['settings' => null]);
});

it('syncs the timer and volume to the listener’s other devices', function () use ($timer) {
    $ada = listener();
    $at = now()->getTimestampMs();

    $this->actingAs($ada)
        ->putJson('/account/settings', ['timer' => $timer, 'volume' => 0.8, 'updatedAt' => $at], fromSite())
        ->assertNoContent();

    $this->actingAs($ada)
        ->getJson('/account/settings', fromSite())
        ->assertOk()
        ->assertJsonPath('settings.timer', $timer)
        ->assertJsonPath('settings.volume', 0.8)
        ->assertJsonPath('settings.updatedAt', $at);
});

it('keeps the newest change when two devices disagree', function () use ($timer) {
    $ada = listener();
    $early = now()->subMinute()->getTimestampMs();
    $late = now()->getTimestampMs();

    $this->actingAs($ada)->putJson('/account/settings', [
        'timer' => [...$timer, 'focus' => 50], 'volume' => 0.5, 'updatedAt' => $late,
    ], fromSite())->assertNoContent();

    // A device that was offline pushes an older change; it must not win.
    $this->actingAs($ada)->putJson('/account/settings', [
        'timer' => $timer, 'volume' => 0.1, 'updatedAt' => $early,
    ], fromSite())->assertNoContent();

    $this->actingAs($ada)
        ->getJson('/account/settings', fromSite())
        ->assertJsonPath('settings.timer.focus', 50)
        ->assertJsonPath('settings.volume', 0.5)
        ->assertJsonPath('settings.updatedAt', $late);
});

it('refuses settings it cannot make sense of', function (array $body) {
    $this->actingAs(listener())
        ->putJson('/account/settings', $body, fromSite())
        ->assertStatus(422);
})->with([
    'no timer' => [['volume' => 0.5, 'updatedAt' => 1]],
    'volume past the top' => [['timer' => [], 'volume' => 2, 'updatedAt' => 1]],
    'volume below silence' => [['timer' => [], 'volume' => -1, 'updatedAt' => 1]],
    'no clock' => [['timer' => [], 'volume' => 0.5]],
]);

// The same bounds the MCP's update-settings tool holds an assistant to.
it('refuses a timer the app could never run', function (array $timer) {
    $this->actingAs(listener())
        ->putJson('/account/settings', ['timer' => $timer, 'volume' => 0.5, 'updatedAt' => now()->getTimestampMs()], fromSite())
        ->assertStatus(422)
        ->assertJsonValidationErrors('timer');
})->with([
    'a week-long focus session' => [['focus' => 10_000]],
    'a zero-minute break' => [['short' => 0]],
    'minutes that are not a number' => [['long' => 'forever']],
    'no rounds before a long break' => [['longEvery' => 0]],
    'more rounds than the timer shows' => [['longEvery' => 13]],
    'a switch that is neither on nor off' => [['autoStart' => 'maybe']],
]);

it('never shows another listener’s settings', function () use ($timer) {
    $other = listener();
    $this->actingAs($other)->putJson('/account/settings', [
        'timer' => $timer, 'volume' => 0.9, 'updatedAt' => now()->getTimestampMs(),
    ], fromSite());

    $this->actingAs(listener())
        ->getJson('/account/settings', fromSite())
        ->assertExactJson(['settings' => null]);
});

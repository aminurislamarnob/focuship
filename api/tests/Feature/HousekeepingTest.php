<?php

use App\Models\SignInCode;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Support\Str;
use Laravel\Passport\Client;
use Laravel\Passport\Token;

/**
 * What the scheduler sweeps up. Dynamic client registration is public by design
 * (MCP spec / RFC 7591), so abandoned registrations must not pile up (ADR 0005).
 */
it('forgets a registration nobody ever approved', function () {
    $abandoned = Client::forceCreate([
        'id' => (string) Str::uuid(),
        'name' => 'Abandoned',
        'redirect_uris' => ['https://example.test/cb'],
        'grant_types' => ['authorization_code'],
        'revoked' => false,
        'created_at' => now()->subDays(2),
        'updated_at' => now()->subDays(2),
    ]);

    $this->artisan('focuship:prune')->assertSuccessful();

    expect(Client::find($abandoned->getKey()))->toBeNull();
});

it('keeps a registration that is only hours old', function () {
    connectMcpClient(listener());
    $fresh = Client::forceCreate([
        'id' => (string) Str::uuid(),
        'name' => 'Still deciding',
        'redirect_uris' => ['https://example.test/cb'],
        'grant_types' => ['authorization_code'],
        'revoked' => false,
        'created_at' => now()->subHours(3),
        'updated_at' => now()->subHours(3),
    ]);

    $this->artisan('focuship:prune')->assertSuccessful();

    expect(Client::find($fresh->getKey()))->not->toBeNull();
});

it('keeps a registration a listener actually connected', function () {
    $ada = listener();
    connectMcpClient($ada, 'Claude');
    Client::query()->update(['created_at' => now()->subWeek()]);

    $this->artisan('focuship:prune')->assertSuccessful();

    expect(Client::where('name', 'Claude')->exists())->toBeTrue();
});

it('clears out tokens that expired long ago', function () {
    $ada = listener();
    connectMcpClient($ada);
    Token::query()->update(['expires_at' => now()->subMonths(2), 'revoked' => true]);

    $this->artisan('focuship:prune')->assertSuccessful();

    expect(Token::count())->toBe(0);
});

it('leaves a live connection alone', function () {
    $ada = listener();
    connectMcpClient($ada);

    $this->artisan('focuship:prune')->assertSuccessful();

    expect(Token::where('user_id', $ada->id)->count())->toBeGreaterThan(0);
});

it('clears out sign-in codes that can no longer be used', function () {
    SignInCode::create([
        'email' => 'ada@example.com',
        'code_hash' => 'x',
        'expires_at' => now()->subDays(3),
    ]);

    $this->artisan('focuship:prune')->assertSuccessful();

    expect(SignInCode::count())->toBe(0);
});

it('leaves a code that was only just sent', function () {
    SignInCode::create([
        'email' => 'ada@example.com',
        'code_hash' => 'x',
        'expires_at' => now()->addMinutes(9),
    ]);

    $this->artisan('focuship:prune')->assertSuccessful();

    expect(SignInCode::count())->toBe(1);
});

it('is scheduled to run on its own', function () {
    $scheduled = collect(app(Schedule::class)->events())
        ->map(fn ($event) => $event->command ?? '')
        ->filter(fn (string $command) => str_contains($command, 'focuship:prune'));

    expect($scheduled)->not->toBeEmpty();
});

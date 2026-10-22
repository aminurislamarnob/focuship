<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

pest()->extend(TestCase::class)->in('Unit');

pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Feature');

/**
 * Headers a browser on the site sends to the API (Sanctum treats the request as stateful).
 *
 * @return array<string, string>
 */
function fromSite(): array
{
    return ['Origin' => 'http://localhost:3000', 'Referer' => 'http://localhost:3000/', 'Accept' => 'application/json'];
}

function listener(array $attributes = []): User
{
    return User::factory()->create($attributes);
}

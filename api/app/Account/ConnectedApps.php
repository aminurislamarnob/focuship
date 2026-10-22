<?php

namespace App\Account;

use App\Models\User;
use Illuminate\Support\Collection;
use Laravel\Passport\Client;
use Laravel\Passport\Token;

/**
 * The AI assistants a listener has let into their account.
 *
 * One entry per client, however many tokens it has refreshed through: the listener
 * thinks in apps, not tokens.
 */
class ConnectedApps
{
    public function __construct(private readonly User $user) {}

    /** @return list<array{id: string, name: string, connectedAt: string|null, lastUsedAt: string|null}> */
    public function all(): array
    {
        /** @var list<array{id: string, name: string, connectedAt: string|null, lastUsedAt: string|null}> $apps */
        $apps = $this->liveTokens()
            ->groupBy('client_id')
            ->map(function (Collection $tokens, string $clientId) {
                $client = Client::find($clientId);
                $connected = $tokens->min('created_at');
                $used = $tokens->max('updated_at');

                return [
                    'id' => $clientId,
                    'name' => $client === null ? 'An AI assistant' : (string) $client->name,
                    'connectedAt' => $connected?->toIso8601String(),
                    'lastUsedAt' => $used?->toIso8601String(),
                ];
            })
            ->sortByDesc('lastUsedAt')
            ->values()
            ->all();

        return $apps;
    }

    /** Cuts the app off at once. False when this listener never connected it. */
    public function revoke(string $clientId): bool
    {
        $tokens = $this->liveTokens()->where('client_id', $clientId);

        if ($tokens->isEmpty()) {
            return false;
        }

        Token::where('user_id', $this->user->getKey())
            ->where('client_id', $clientId)
            ->update(['revoked' => true]);

        return true;
    }

    /** Every token still worth anything: not revoked, not expired. */
    /** @return Collection<int, Token> */
    private function liveTokens(): Collection
    {
        return Token::where('user_id', $this->user->getKey())
            ->where('revoked', false)
            ->where(fn ($query) => $query->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->get();
    }
}

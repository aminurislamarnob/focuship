<?php

namespace App\Account;

use App\Models\User;
use Illuminate\Support\Collection;
use Laravel\Passport\AuthCode;
use Laravel\Passport\Client;
use Laravel\Passport\RefreshToken;
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

        $appTokens = Token::where('user_id', $this->user->getKey())->where('client_id', $clientId);

        // The refresh tokens and any unused sign-in code too, or the app would simply
        // trade one of them for a new access token.
        RefreshToken::whereIn('access_token_id', $appTokens->clone()->select('id'))->update(['revoked' => true]);
        AuthCode::where('user_id', $this->user->getKey())->where('client_id', $clientId)->update(['revoked' => true]);
        $appTokens->update(['revoked' => true]);

        return true;
    }

    /** Every app loses access for good: the account is going. */
    public function forgetAll(): void
    {
        $tokens = Token::where('user_id', $this->user->getKey());

        RefreshToken::whereIn('access_token_id', $tokens->clone()->select('id'))->delete();
        $tokens->delete();
        AuthCode::where('user_id', $this->user->getKey())->delete();
    }

    /**
     * Every token still worth anything: not revoked, and either unexpired or backed by a
     * refresh token that can mint the next one. An assistant idle past its hour-long
     * access token is still connected for as long as that refresh token lives.
     *
     * @return Collection<int, Token>
     */
    private function liveTokens(): Collection
    {
        return Token::where('user_id', $this->user->getKey())
            ->where('revoked', false)
            ->where(fn ($query) => $query
                ->whereNull('expires_at')
                ->orWhere('expires_at', '>', now())
                ->orWhereHas('refreshToken', fn ($refresh) => $refresh
                    ->where('revoked', false)
                    ->where('expires_at', '>', now())))
            ->get();
    }
}

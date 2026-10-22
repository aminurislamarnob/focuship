<?php

namespace App\Console\Commands;

use App\Auth\EmailCodes;
use Illuminate\Console\Command;
use Laravel\Passport\Client;
use Laravel\Passport\RefreshToken;
use Laravel\Passport\Token;

/**
 * Housekeeping, run every minute by the scheduler (ADR 0005).
 *
 * Dynamic client registration is public by design, so registrations nobody ever
 * approved are the one thing that could grow without bound.
 */
class Prune extends Command
{
    protected $signature = 'focuship:prune';

    protected $description = 'Clear out abandoned AI app registrations, dead tokens and spent sign-in codes';

    /** How long a client has to finish the consent flow before it is forgotten. */
    private const ABANDONED_AFTER_HOURS = 24;

    /** How long an expired token is kept before the row goes too. */
    private const EXPIRED_TOKENS_KEPT_DAYS = 30;

    public function handle(EmailCodes $codes): int
    {
        // Revoked tokens are dead the moment the listener said so; expired ones linger
        // briefly in case they ask what happened. The same goes for refresh tokens.
        RefreshToken::where('revoked', true)
            ->orWhere('expires_at', '<', now()->subDays(self::EXPIRED_TOKENS_KEPT_DAYS))
            ->delete();

        $tokens = Token::where('revoked', true)
            ->orWhere('expires_at', '<', now()->subDays(self::EXPIRED_TOKENS_KEPT_DAYS))
            ->delete();

        $clients = Client::where('created_at', '<', now()->subHours(self::ABANDONED_AFTER_HOURS))
            ->whereDoesntHave('tokens')
            ->whereDoesntHave('authCodes')
            ->delete();

        $signInCodes = $codes->prune();

        $this->info("Pruned {$clients} abandoned app registrations, {$tokens} dead tokens, {$signInCodes} sign-in codes.");

        return self::SUCCESS;
    }
}

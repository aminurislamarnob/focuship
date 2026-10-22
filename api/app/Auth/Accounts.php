<?php

namespace App\Auth;

use App\Models\SocialIdentity;
use App\Models\User;
use Illuminate\Support\Str;

/**
 * Finding or creating the listener behind a sign-in.
 *
 * Every provider ends here, and a verified email address is the identity: signing in
 * with Google and later with GitHub on the same address lands in the same account
 * (ADR 0001).
 */
class Accounts
{
    public static function normalizeEmail(string $email): string
    {
        return Str::lower(trim($email));
    }

    /**
     * The listener behind a provider sign-in, and a note that this provider now
     * reaches that account.
     */
    public function forProvider(
        string $provider,
        string $providerUserId,
        string $email,
        ?string $name = null,
        ?string $avatarUrl = null,
    ): User {
        $user = $this->forEmail($email, $name, $avatarUrl);

        SocialIdentity::updateOrCreate(
            ['provider' => $provider, 'provider_user_id' => $providerUserId],
            ['user_id' => $user->id],
        );

        return $user;
    }

    public function forEmail(string $email, ?string $name = null, ?string $avatarUrl = null): User
    {
        $email = self::normalizeEmail($email);

        $user = User::firstOrNew(['email' => $email]);

        if (! $user->exists) {
            $user->name = $name ?: Str::before($email, '@');
            $user->email_verified_at = now();
        }

        // Fill in anything the account is still missing, but never overwrite what is there:
        // a listener who set a name in one provider keeps it when signing in with another.
        if (blank($user->avatar_url) && filled($avatarUrl)) {
            $user->avatar_url = $avatarUrl;
        }

        $user->save();

        return $user;
    }
}

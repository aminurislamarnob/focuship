<?php

namespace App\Auth;

use App\Mail\SignInCode as SignInCodeMail;
use App\Models\SignInCode;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

/**
 * The emailed 6-digit sign-in code: issuing, mailing and checking it.
 *
 * Only a hash is stored, a code lives for ten minutes, dies after five wrong guesses,
 * and can be used once. Issuing a new code retires the ones before it.
 */
class EmailCodes
{
    public const EXPIRES_MINUTES = 10;

    public const MAX_ATTEMPTS = 5;

    public function send(string $email): void
    {
        $email = Accounts::normalizeEmail($email);
        $code = Str::padLeft((string) random_int(0, 999999), 6, '0');

        // A fresh code retires the earlier ones, so only the newest can be used.
        SignInCode::where('email', $email)->whereNull('consumed_at')->update(['consumed_at' => now()]);

        SignInCode::create([
            'email' => $email,
            'code_hash' => Hash::make($code),
            'expires_at' => now()->addMinutes(self::EXPIRES_MINUTES),
        ]);

        Mail::to($email)->send(new SignInCodeMail($code, self::EXPIRES_MINUTES));
    }

    /** True when the code was the live one for this address; it is then spent. */
    public function consume(string $email, string $code): bool
    {
        $email = Accounts::normalizeEmail($email);
        $code = preg_replace('/\s+/', '', $code) ?? '';

        $issued = SignInCode::where('email', $email)
            ->whereNull('consumed_at')
            ->where('expires_at', '>', now())
            ->where('attempts', '<', self::MAX_ATTEMPTS)
            ->latest('id')
            ->first();

        if ($issued === null) {
            return false;
        }

        if (! Hash::check($code, $issued->code_hash)) {
            $issued->increment('attempts');

            return false;
        }

        $issued->forceFill(['consumed_at' => now()])->save();

        return true;
    }

    /** Housekeeping for the scheduler: codes that can no longer be used. */
    public function prune(): int
    {
        return SignInCode::where('expires_at', '<', now()->subDay())
            ->orWhere('consumed_at', '<', now()->subDay())
            ->delete();
    }
}

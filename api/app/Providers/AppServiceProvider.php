<?php

namespace App\Providers;

use App\Auth\Accounts;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Laravel\Passport\Passport;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        $this->rateLimits();
        $this->oauth();
    }

    /**
     * How long an AI assistant's connection lasts (ADR 0004): short access tokens so a
     * leaked one dies quickly, rotating refresh tokens so an unused connection lapses
     * about a month after the listener last used it.
     */
    private function oauth(): void
    {
        Passport::tokensExpireIn(now()->addHour());
        Passport::refreshTokensExpireIn(now()->addDays(30));
        Passport::personalAccessTokensExpireIn(now()->addDays(30));

        Passport::authorizationView(
            fn (array $parameters) => response()->view('vendor.mcp.authorize', $parameters)
        );
    }

    /**
     * What stops the public routes being abused (ADR 0005). Cloudflare takes the floods;
     * these keep a determined visitor from mailing codes to strangers or filling the
     * database with OAuth clients. Limits are keyed on the real client IP.
     */
    private function rateLimits(): void
    {
        RateLimiter::for('email-code', fn (Request $request) => [
            Limit::perMinutes(15, 3)->by('email-code:'.Accounts::normalizeEmail((string) $request->input('email'))),
            Limit::perHour(10)->by('email-code-ip:'.$request->ip()),
        ]);

        RateLimiter::for('email-verify', fn (Request $request) => [
            Limit::perMinutes(15, 10)->by('email-verify:'.Accounts::normalizeEmail((string) $request->input('email'))),
            Limit::perHour(30)->by('email-verify-ip:'.$request->ip()),
        ]);

        // A Google ID token carries no address to key on, so this is per caller.
        RateLimiter::for('google-token', fn (Request $request) => Limit::perMinute(20)->by('google-token:'.$request->ip()));

        // Dynamic client registration is public by design (MCP spec / RFC 7591) and each
        // call writes a row, so it is the tightest limit on the API.
        RateLimiter::for('oauth-register', fn (Request $request) => [
            Limit::perMinute(10)->by('oauth-register:'.$request->ip()),
            Limit::perDay(100)->by('oauth-register-day:'.$request->ip()),
        ]);

        RateLimiter::for('mcp', fn (Request $request) => $request->user()
            ? Limit::perMinute(120)->by('mcp:'.$request->user()->getAuthIdentifier())
            : Limit::perMinute(30)->by('mcp-ip:'.$request->ip()));

        RateLimiter::for('web', fn (Request $request) => $request->user()
            ? Limit::perMinute(120)->by('web:'.$request->user()->getAuthIdentifier())
            : Limit::perMinute(120)->by('web-ip:'.$request->ip()));

        RateLimiter::for('api', fn (Request $request) => $request->user()
            ? Limit::perMinute(120)->by('api:'.$request->user()->getAuthIdentifier())
            : Limit::perMinute(120)->by('api-ip:'.$request->ip()));
    }
}

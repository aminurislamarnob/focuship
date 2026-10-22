<?php

namespace App\Http\Controllers\Auth;

use App\Auth\Accounts;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Symfony\Component\HttpFoundation\RedirectResponse as SymfonyRedirect;
use Throwable;

/**
 * The redirect sign-ins: GitHub, Facebook, and Google when its button cannot load.
 * The listener leaves the site, approves at the provider, and comes back here with
 * a cookie session before being sent on to where they started.
 */
class SocialController extends Controller
{
    private const PROVIDERS = ['google', 'github', 'facebook'];

    /** Where the listener goes after signing in, remembered across the round trip. */
    private const RETURN_KEY = 'auth.return_to';

    public function redirect(Request $request, string $provider): SymfonyRedirect
    {
        $this->ensureAvailable($provider);

        Session::put(self::RETURN_KEY, $this->safeReturn($request->query('redirect')));

        return Socialite::driver($provider)->redirect();
    }

    public function callback(string $provider, Accounts $accounts): RedirectResponse
    {
        $this->ensureAvailable($provider);

        $returnTo = (string) Session::pull(self::RETURN_KEY, $this->site().'/account');

        try {
            $providerUser = Socialite::driver($provider)->user();
        } catch (Throwable) {
            return redirect()->away($this->withError($returnTo, 'failed'));
        }

        $email = $providerUser->getEmail();

        if (blank($email)) {
            // GitHub accounts can hide their address, and Facebook may withhold it.
            return redirect()->away($this->withError($returnTo, 'no-email'));
        }

        $user = $accounts->forProvider(
            $provider,
            (string) $providerUser->getId(),
            $email,
            $providerUser->getName() ?: $providerUser->getNickname(),
            $providerUser->getAvatar(),
        );

        Session::regenerate();
        auth()->login($user, remember: true);

        return redirect()->away($returnTo);
    }

    private function ensureAvailable(string $provider): void
    {
        abort_unless(in_array($provider, self::PROVIDERS, true), 404);
        abort_if($provider === 'facebook' && ! config('auth.facebook_enabled'), 404);
    }

    /** Only ever back to the site: an open redirect here would be a phishing hole. */
    private function safeReturn(mixed $url): string
    {
        $site = $this->site();

        return is_string($url) && Str::startsWith($url, $site.'/') ? $url : $site.'/account';
    }

    private function withError(string $url, string $error): string
    {
        return $url.(str_contains($url, '?') ? '&' : '?').'error='.$error;
    }

    private function site(): string
    {
        return rtrim((string) config('app.frontend_url'), '/');
    }
}

<?php

namespace App\Http\Controllers\Auth;

use App\Auth\Accounts;
use App\Auth\EmailCodes;
use App\Auth\Turnstile;
use App\Http\Controllers\Controller;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Signing in on the API's own origin.
 *
 * The site has its own sign-in; this page exists for the consent flow (ADR 0004):
 * an AI assistant sends a listener straight to /oauth/authorize, and if they have no
 * session yet they have to be able to make one without leaving the flow.
 */
class SignInPageController extends Controller
{
    private const NEXT_KEY = 'auth.sign_in_next';

    public function show(Request $request): View|RedirectResponse
    {
        $next = $this->safeNext($request->query('next'));

        if ($request->user() !== null) {
            return redirect()->to($next);
        }

        Session::put(self::NEXT_KEY, $next);

        return view('auth.sign-in', [
            'next' => $next,
            'facebookEnabled' => (bool) config('auth.facebook_enabled'),
            'turnstileSiteKey' => (string) config('services.turnstile.site_key'),
            'email' => old('email'),
        ]);
    }

    /** Emails the code, then shows the same page with the code box open. */
    public function sendCode(Request $request, Turnstile $turnstile, EmailCodes $codes): RedirectResponse
    {
        $fields = $request->validate([
            'email' => ['required', 'email:rfc', 'max:254'],
            'turnstile' => ['nullable', 'string'],
        ]);

        if (! $turnstile->passes($fields['turnstile'] ?? null, $request->ip())) {
            throw ValidationException::withMessages(['email' => 'The security check didn’t pass. Try again.']);
        }

        $codes->send($fields['email']);

        return back()->with('codeSentTo', Accounts::normalizeEmail($fields['email']))->withInput();
    }

    public function verifyCode(Request $request, EmailCodes $codes, Accounts $accounts): RedirectResponse
    {
        $fields = $request->validate([
            'email' => ['required', 'email:rfc', 'max:254'],
            'code' => ['required', 'string'],
        ]);

        if (! $codes->consume($fields['email'], $fields['code'])) {
            throw ValidationException::withMessages(['code' => 'That code is wrong or has expired. Ask for a new one.'])
                ->redirectTo(route('sign-in'));
        }

        $next = (string) Session::pull(self::NEXT_KEY, $this->site().'/account');

        Session::regenerate();
        auth()->login($accounts->forEmail($fields['email']), remember: true);

        return redirect()->to($next);
    }

    /** Only ever onward to Focuship: the site, or this API's own OAuth flow. */
    private function safeNext(mixed $url): string
    {
        $api = rtrim((string) config('app.url'), '/');

        if (is_string($url) && (Str::startsWith($url, $this->site().'/') || Str::startsWith($url, $api.'/'))) {
            return $url;
        }

        return $this->site().'/account';
    }

    private function site(): string
    {
        return rtrim((string) config('app.frontend_url'), '/');
    }
}

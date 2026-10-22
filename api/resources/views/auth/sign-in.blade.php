{{--
    Signing in on the API's own origin, for the MCP consent flow (ADR 0004).
    The site has its own sign-in; this one exists so a listener an assistant sent
    straight to /oauth/authorize can make a session without leaving the flow.
--}}
@php($sentTo = session('codeSentTo'))
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex">
    <title>Sign in to Focuship</title>
    @if ($turnstileSiteKey !== '')
        <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
    @endif
    <style>
        :root {
            --ground: #0a0a0a; --surface: #121212; --raised: #1c1c1c; --hairline: #262626;
            --fg: #e8e6e3; --muted: #a5a29c; --faint: #8c8983; --accent: #d9d6d0; --ember: #f08a4b;
        }
        * { box-sizing: border-box; }
        body {
            margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px;
            background: var(--ground); color: var(--fg);
            font: 16px/1.55 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
        }
        .card {
            width: 100%; max-width: 400px; background: var(--surface);
            border: 1px solid var(--hairline); border-radius: 24px; padding: 28px;
        }
        .mark { display: flex; align-items: center; gap: 10px; font-weight: 600; }
        .mark .ring {
            width: 22px; height: 22px; border: 2px solid var(--faint); border-top-color: transparent;
            border-radius: 999px; display: grid; place-items: center;
        }
        .mark .ember { width: 7px; height: 7px; border-radius: 999px; background: var(--ember); }
        h1 { font-size: 1.3rem; margin: 22px 0 6px; letter-spacing: -0.015em; }
        p { margin: 0 0 18px; color: var(--muted); font-size: 0.95rem; }
        a.provider, button {
            display: flex; align-items: center; justify-content: center; gap: 10px;
            width: 100%; min-height: 46px; border-radius: 999px; border: 1px solid var(--hairline);
            background: var(--raised); color: var(--fg); font: inherit; font-weight: 550;
            font-size: 0.95rem; text-decoration: none; cursor: pointer; margin-bottom: 10px;
        }
        a.provider:hover, button:hover { filter: brightness(1.25); }
        button.primary { background: var(--accent); border-color: var(--accent); color: #15130f; }
        .or { display: flex; align-items: center; gap: 12px; color: var(--faint); font-size: 0.8rem; margin: 18px 0; }
        .or::before, .or::after { content: ""; flex: 1; height: 1px; background: var(--hairline); }
        label { display: block; font-size: 0.85rem; color: var(--faint); margin-bottom: 6px; }
        input {
            width: 100%; min-height: 46px; padding: 0 14px; margin-bottom: 12px;
            background: var(--ground); color: var(--fg);
            border: 1px solid var(--hairline); border-radius: 14px; font: inherit;
        }
        input:focus { outline: 2px solid var(--faint); outline-offset: 1px; }
        .error { color: var(--ember); font-size: 0.85rem; margin: 0 0 12px; }
        .note { margin: 18px 0 0; font-size: 0.82rem; color: var(--faint); }
        .cf-turnstile { margin-bottom: 12px; }
    </style>
</head>
<body>
    <main class="card">
        <div class="mark"><span class="ring"><span class="ember"></span></span> Focuship</div>

        <h1>Sign in to Focuship</h1>
        <p>Your presets, favorites and timer settings follow you across devices.</p>

        @foreach (['google' => 'Continue with Google', 'github' => 'Continue with GitHub'] + ($facebookEnabled ? ['facebook' => 'Continue with Facebook'] : []) as $provider => $label)
            <a class="provider" href="{{ url("/auth/{$provider}/redirect") }}?redirect={{ urlencode($next) }}">{{ $label }}</a>
        @endforeach

        <div class="or">or</div>

        @error('code')<p class="error">{{ $message }}</p>@enderror
        @error('email')<p class="error">{{ $message }}</p>@enderror

        @if ($sentTo)
            <form method="POST" action="{{ route('sign-in.verify') }}">
                @csrf
                <input type="hidden" name="email" value="{{ $sentTo }}">
                <label for="code">Enter the 6-digit code sent to {{ $sentTo }}</label>
                <input id="code" name="code" inputmode="numeric" autocomplete="one-time-code"
                       pattern="[0-9]{6}" maxlength="6" required autofocus>
                <button type="submit" class="primary">Sign in</button>
            </form>
            <form method="POST" action="{{ route('sign-in.code') }}">
                @csrf
                <input type="hidden" name="email" value="{{ $sentTo }}">
                @if ($turnstileSiteKey !== '')
                    <div class="cf-turnstile" data-sitekey="{{ $turnstileSiteKey }}" data-response-field-name="turnstile"></div>
                @endif
                <button type="submit">Send another code</button>
            </form>
        @else
            <form method="POST" action="{{ route('sign-in.code') }}">
                @csrf
                <label for="email">Email a sign-in code</label>
                <input id="email" name="email" type="email" autocomplete="email" required value="{{ $email }}">
                @if ($turnstileSiteKey !== '')
                    <div class="cf-turnstile" data-sitekey="{{ $turnstileSiteKey }}" data-response-field-name="turnstile"></div>
                @endif
                <button type="submit" class="primary">Email me a code</button>
            </form>
        @endif

        <p class="note">No password, ever. Codes expire in {{ \App\Auth\EmailCodes::EXPIRES_MINUTES }} minutes.</p>
    </main>
</body>
</html>

{{--
    The consent screen an AI assistant sends the listener to (ADR 0004). It runs on
    the same web session as the site, so a signed-in listener only has to press Allow.

    Self-contained: the API ships no build step, and this is the one page it renders.
    Colours follow the Focuship visual language.
--}}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex">
    <title>Connect {{ $client->name }} to Focuship</title>
    <style>
        :root {
            --ground: #0a0a0a;
            --surface: #121212;
            --raised: #1c1c1c;
            --hairline: #262626;
            --fg: #e8e6e3;
            --muted: #a5a29c;
            --faint: #8c8983;
            --accent: #d9d6d0;
            --ember: #f08a4b;
        }

        * { box-sizing: border-box; }

        body {
            margin: 0;
            min-height: 100vh;
            display: grid;
            place-items: center;
            padding: 24px;
            background: var(--ground);
            color: var(--fg);
            font: 16px/1.55 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
        }

        .card {
            width: 100%;
            max-width: 420px;
            background: var(--surface);
            border: 1px solid var(--hairline);
            border-radius: 24px;
            padding: 28px;
        }

        .mark {
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 600;
            letter-spacing: -0.01em;
        }

        .mark .ring {
            width: 22px;
            height: 22px;
            border: 2px solid var(--faint);
            border-top-color: transparent;
            border-radius: 999px;
            display: grid;
            place-items: center;
        }

        .mark .ember {
            width: 7px;
            height: 7px;
            border-radius: 999px;
            background: var(--ember);
        }

        h1 {
            font-size: 1.3rem;
            line-height: 1.3;
            margin: 22px 0 8px;
            letter-spacing: -0.015em;
        }

        p { margin: 0 0 14px; color: var(--muted); font-size: 0.95rem; }

        .site { color: var(--faint); font-size: 0.85rem; word-break: break-all; }

        ul { margin: 0; padding: 0 0 0 20px; color: var(--muted); font-size: 0.95rem; }
        li { margin-bottom: 6px; }

        .panel {
            background: var(--raised);
            border: 1px solid var(--hairline);
            border-radius: 18px;
            padding: 16px 18px;
            margin: 18px 0;
        }

        .panel h2 {
            font-size: 0.78rem;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: var(--faint);
            margin: 0 0 10px;
            font-weight: 600;
        }

        .who {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 0.9rem;
            color: var(--muted);
            margin-bottom: 18px;
        }

        .who img { width: 28px; height: 28px; border-radius: 999px; }

        .actions { display: flex; gap: 10px; margin-top: 22px; }
        .actions form { flex: 1; margin: 0; }

        button {
            width: 100%;
            min-height: 46px;
            border-radius: 999px;
            border: 1px solid var(--hairline);
            background: transparent;
            color: var(--fg);
            font: inherit;
            font-weight: 550;
            font-size: 0.95rem;
            cursor: pointer;
        }

        button:hover { background: var(--raised); }

        button.primary {
            background: var(--accent);
            border-color: var(--accent);
            color: #15130f;
        }

        button.primary:hover { filter: brightness(1.06); }

        .note { margin: 18px 0 0; font-size: 0.82rem; color: var(--faint); }
        a { color: var(--muted); }
    </style>
</head>
<body>
    <main class="card">
        <div class="mark"><span class="ring"><span class="ember"></span></span> Focuship</div>

        <h1>Let {{ $client->name }} use your Focuship library?</h1>

        @if ($client->client_uri ?? null)
            <p class="site">{{ $client->client_uri }}</p>
        @endif

        <div class="who">
            @if (auth()->user()?->avatar_url)
                <img src="{{ auth()->user()->avatar_url }}" alt="">
            @endif
            <span>Signed in as {{ auth()->user()?->email }}</span>
        </div>

        <div class="panel">
            <h2>It will be able to</h2>
            <ul>
                <li>Browse Focuship’s sounds and presets, and build mixes for you</li>
                <li>Read, save, rename, share and delete your presets</li>
                <li>Read and change your favorites, timer lengths and volume</li>
            </ul>
        </div>

        <div class="panel">
            <h2>It will never be able to</h2>
            <ul>
                <li>Delete your Focuship account</li>
                <li>Play or stop sound on your devices</li>
            </ul>
        </div>

        <div class="actions">
            <form method="POST" action="{{ route('passport.authorizations.deny') }}">
                @csrf
                @method('DELETE')
                <input type="hidden" name="state" value="{{ $request->state ?? '' }}">
                <input type="hidden" name="client_id" value="{{ $client->id }}">
                <input type="hidden" name="auth_token" value="{{ $authToken }}">
                <button type="submit">Cancel</button>
            </form>

            <form method="POST" action="{{ route('passport.authorizations.approve') }}">
                @csrf
                <input type="hidden" name="state" value="{{ $request->state ?? '' }}">
                <input type="hidden" name="client_id" value="{{ $client->id }}">
                <input type="hidden" name="auth_token" value="{{ $authToken }}">
                <button type="submit" class="primary">Allow</button>
            </form>
        </div>

        <p class="note">
            You can disconnect {{ $client->name }} at any time from
            <a href="{{ rtrim(config('app.frontend_url'), '/') }}/account">your Focuship account</a>.
        </p>
    </main>
</body>
</html>

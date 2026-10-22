<?php

namespace App\Mcp\Tools;

use App\Account\TimerSettings;
use App\Mcp\LibraryTool;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\JsonSchema\Types\Type;
use Illuminate\Validation\ValidationException;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tools\Annotations\IsIdempotent;

#[Description(<<<'TEXT'
Changes the listener's focus timer or volume. Only the values you pass change; the rest
stay as they were. The app picks these up on its next sync.
TEXT)]
#[IsIdempotent]
class UpdateSettings extends LibraryTool
{
    public function handle(Request $request): ResponseFactory|Response
    {
        $library = $this->library($request);
        $current = $library->settings();
        $timer = TimerSettings::withDefaults($current['timer'] ?? []);
        $volume = $current['volume'] ?? TimerSettings::DEFAULT_VOLUME;

        // Passed on as sent, never cast: Library refuses 25.5 minutes or a volume of
        // "loud" where a cast would quietly save 25 or silence.
        $asked = array_filter(
            $request->only(['focus', 'short', 'long', 'longEvery', 'autoStart', 'notify', 'volume']),
            fn ($value) => $value !== null,
        );

        if ($asked === []) {
            return Response::error(
                'Nothing to change. Pass at least one of focus, short, long, longEvery, autoStart, notify or volume.'
            );
        }

        $timer = array_merge($timer, array_diff_key($asked, ['volume' => true]));
        $volume = $asked['volume'] ?? $volume;

        try {
            // The bounds live in Library, shared with the site's own settings sync.
            $library->saveSettings($timer, $volume, now()->getTimestampMs());
        } catch (ValidationException $e) {
            return Response::error($e->getMessage());
        }

        $volume = (float) $volume;

        return Response::make(Response::text('Updated: '.implode(', ', self::describe($asked, $volume)).'.'))
            ->withStructuredContent(['timer' => $timer, 'volume' => $volume]);
    }

    /**
     * What changed, in words, once Library has accepted it.
     *
     * @param  array<string, mixed>  $asked
     * @return list<string>
     */
    private static function describe(array $asked, float $volume): array
    {
        $changed = [];

        foreach (['focus', 'short', 'long'] as $field) {
            if (isset($asked[$field])) {
                $changed[] = "{$field} {$asked[$field]} min";
            }
        }

        if (isset($asked['longEvery'])) {
            $changed[] = "a long break every {$asked['longEvery']} rounds";
        }

        foreach (['autoStart', 'notify'] as $flag) {
            if (isset($asked[$flag])) {
                $changed[] = $flag.' '.($asked[$flag] ? 'on' : 'off');
            }
        }

        if (isset($asked['volume'])) {
            $changed[] = "volume {$volume}";
        }

        return $changed;
    }

    /** @return array<string, Type> */
    public function schema(JsonSchema $schema): array
    {
        $minutes = fn (string $what) => $schema->integer()
            ->min(TimerSettings::MIN_MINUTES)
            ->max(TimerSettings::MAX_MINUTES)
            ->description("Minutes for {$what}.");

        return [
            'focus' => $minutes('a focus session'),
            'short' => $minutes('a short break'),
            'long' => $minutes('a long break'),
            'longEvery' => $schema->integer()->min(1)->max(TimerSettings::MAX_ROUNDS)
                ->description('How many focus sessions between long breaks.'),
            'autoStart' => $schema->boolean()->description('Start the next session automatically.'),
            'notify' => $schema->boolean()->description('Send a notification when a session ends.'),
            'volume' => $schema->number()->min(0)->max(1)->description('Master volume, 0 to 1.'),
        ];
    }
}

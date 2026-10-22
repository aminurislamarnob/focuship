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

        $changed = [];

        foreach (['focus', 'short', 'long'] as $field) {
            if ($request->get($field) === null) {
                continue;
            }

            $minutes = (int) $request->get($field);
            $timer[$field] = $minutes;
            $changed[] = "{$field} {$minutes} min";
        }

        if ($request->get('longEvery') !== null) {
            $rounds = (int) $request->get('longEvery');
            $timer['longEvery'] = $rounds;
            $changed[] = "a long break every {$rounds} rounds";
        }

        foreach (['autoStart', 'notify'] as $flag) {
            if ($request->get($flag) !== null) {
                $timer[$flag] = (bool) $request->get($flag);
                $changed[] = $flag.' '.($timer[$flag] ? 'on' : 'off');
            }
        }

        if ($request->get('volume') !== null) {
            $volume = (float) $request->get('volume');
            $changed[] = "volume {$volume}";
        }

        if ($changed === []) {
            return Response::error(
                'Nothing to change. Pass at least one of focus, short, long, longEvery, autoStart, notify or volume.'
            );
        }

        try {
            // The bounds live in Library, shared with the site's own settings sync.
            $library->saveSettings($timer, $volume, now()->getTimestampMs());
        } catch (ValidationException $e) {
            return Response::error($e->getMessage());
        }

        return Response::make(Response::text('Updated: '.implode(', ', $changed).'.'))
            ->withStructuredContent(['timer' => $timer, 'volume' => $volume]);
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

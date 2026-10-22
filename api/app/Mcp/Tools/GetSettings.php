<?php

namespace App\Mcp\Tools;

use App\Account\TimerSettings;
use App\Mcp\LibraryTool;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\JsonSchema\Types\Type;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tools\Annotations\IsIdempotent;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Description("The listener's focus timer lengths and master volume. Read these before suggesting changes.")]
#[IsReadOnly]
#[IsIdempotent]
class GetSettings extends LibraryTool
{
    public function handle(Request $request): ResponseFactory
    {
        $settings = $this->library($request)->settings();
        $timer = TimerSettings::withDefaults($settings['timer'] ?? []);
        $volume = $settings['volume'] ?? TimerSettings::DEFAULT_VOLUME;

        $text = sprintf(
            "Focus %d min · short break %d min · long break %d min, every %d rounds.\n".
            'Auto-start next session: %s. Notifications: %s. Volume: %s.%s',
            $timer['focus'],
            $timer['short'],
            $timer['long'],
            $timer['longEvery'],
            $timer['autoStart'] ? 'on' : 'off',
            $timer['notify'] ? 'on' : 'off',
            $volume,
            $settings === null ? ' (Focuship’s defaults: nothing has been changed yet.)' : '',
        );

        return Response::make(Response::text($text))
            ->withStructuredContent(['timer' => $timer, 'volume' => $volume]);
    }

    /** @return array<string, Type> */
    public function schema(JsonSchema $schema): array
    {
        return [];
    }
}

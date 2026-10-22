<?php

namespace App\Mcp\Prompts;

use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Prompt;
use Laravel\Mcp\Server\Prompts\Argument;

#[Name('design-a-mix')]
#[Description('Designs a Focuship mix for a mood, a task and a length of session, and hands back a link that opens it.')]
class DesignAMix extends Prompt
{
    /** @return array<int, Argument> */
    public function arguments(): array
    {
        return [
            new Argument(
                name: 'mood',
                description: 'The feeling to aim for, e.g. "rainy cafe", "calm and spacious", "stormy".',
                required: true,
            ),
            new Argument(
                name: 'task',
                description: 'What the listener is about to do, e.g. "writing", "debugging", "reading".',
                required: false,
            ),
            new Argument(
                name: 'minutes',
                description: 'How long the session should run, in minutes.',
                required: false,
            ),
        ];
    }

    /** @return array<int, Response> */
    public function handle(Request $request): array
    {
        $mood = (string) $request->get('mood');
        $task = (string) $request->get('task', 'focused work');
        $minutes = $request->get('minutes');

        $steps = <<<'TEXT'
        Design a Focuship mix. Work in this order:

        1. Call search-sounds for the parts of the mood, and list-presets if a built-in
           preset is already close. Never guess a sound id.
        2. Pick three or four sounds that sit together: one bed (noise, rain or a room),
           one or two details, and at most one accent. Keep the bed loudest.
        3. Call build-mix with those ids and volumes between 0 and 1, and give the
           listener the link it returns — you cannot start playback yourself.
        4. Say in one line why this mix suits the task, then offer to save it with
           save-preset.
        TEXT;

        $ask = "I want a mix that feels like: {$mood}. I'm about to do: {$task}.";

        if (filled($minutes)) {
            $ask .= " The session is {$minutes} minutes, so set the timer with update-settings too.";
        }

        return [
            Response::text($steps)->asAssistant(),
            Response::text($ask),
        ];
    }
}

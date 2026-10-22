<?php

namespace App\Mcp;

use App\Account\Library;
use App\Models\Preset;
use App\Models\User;
use Laravel\Mcp\Request;
use Laravel\Mcp\Server\Tool;

/**
 * A tool that works on the signed-in listener's library.
 *
 * The same `Library` backs the site's account API, so a rule like the fifty-preset
 * cap holds whichever surface the change came from.
 */
abstract class LibraryTool extends Tool
{
    protected function library(Request $request): Library
    {
        /** @var User $user */
        $user = $request->user();

        return $user->library();
    }

    /** Their own preset, or null — another listener's preset is not theirs to know about. */
    protected function ownPreset(Request $request, string $id): ?Preset
    {
        return $this->library($request)->preset($id);
    }

    protected static function noSuchPreset(string $id): string
    {
        return "No preset of yours has the id {$id}. Call list-my-presets to see what is saved.";
    }
}

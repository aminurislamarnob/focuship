<?php

namespace App\Mcp\Resources;

use App\Catalog\Catalog;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\MimeType;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Title;
use Laravel\Mcp\Server\Resource;

#[Name('guides')]
#[Title('Focuship focus guides')]
#[Description('Focuship\'s own evergreen guides on noise colours, the Pomodoro technique, binaural beats and sound for deep work. Ground advice in these so it matches how the app is meant to be used.')]
#[MimeType('application/json')]
class GuidesResource extends Resource
{
    public function uri(): string
    {
        return 'focuship://guides';
    }

    public function handle(Request $request): Response
    {
        return Response::text((string) json_encode(
            Catalog::guides()->values(),
            JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES
        ));
    }
}

<?php

namespace App\Mcp\Tools;

use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\JsonSchema\Types\Type;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsIdempotent;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Description('Which Focuship account this assistant is working with. Use it to confirm whose presets and settings you are about to change.')]
#[IsReadOnly]
#[IsIdempotent]
class Whoami extends Tool
{
    public function handle(Request $request): ResponseFactory
    {
        /** @var User $user */
        $user = $request->user();

        return Response::make(
            Response::text("Signed in to Focuship as {$user->name} ({$user->email}).")
        )->withStructuredContent($user->toCloudUser());
    }

    /** @return array<string, Type> */
    public function schema(JsonSchema $schema): array
    {
        return [];
    }
}

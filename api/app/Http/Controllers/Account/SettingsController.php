<?php

namespace App\Http\Controllers\Account;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/** The synced slice of settings: timer preferences and master volume. */
class SettingsController extends AccountController
{
    public function show(Request $request): JsonResponse
    {
        return response()->json(['settings' => $this->library($request)->settings()]);
    }

    public function update(Request $request): Response
    {
        // Shape only: what counts as a usable timer or volume lives in Library, so the
        // MCP cannot drift from this.
        $fields = $request->validate([
            'timer' => ['required', 'array'],
            'volume' => ['required', 'numeric'],
            'updatedAt' => ['required', 'integer', 'min:0'],
        ]);

        $this->library($request)->saveSettings($fields['timer'], $fields['volume'], (int) $fields['updatedAt']);

        return response()->noContent();
    }
}

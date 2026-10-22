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
        $fields = $request->validate([
            'timer' => ['required', 'array'],
            'volume' => ['required', 'numeric', 'between:0,1'],
            'updatedAt' => ['required', 'integer', 'min:0'],
        ]);

        $this->library($request)->saveSettings($fields['timer'], (float) $fields['volume'], (int) $fields['updatedAt']);

        return response()->noContent();
    }
}

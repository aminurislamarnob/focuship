<?php

namespace App\Http\Controllers\Account;

use App\Account\Library;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/** The synced slice of settings: timer preferences and master volume. */
class SettingsController extends Controller
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

    private function library(Request $request): Library
    {
        /** @var User $user */
        $user = $request->user();

        return $user->library();
    }
}

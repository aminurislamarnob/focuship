<?php

namespace App\Http\Controllers\Account;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;

/** Presets the listener starred: built-in ones and their own. */
class FavoriteController extends AccountController
{
    public function index(Request $request): JsonResponse
    {
        return response()->json(['favorites' => $this->library($request)->favorites()]);
    }

    public function store(Request $request): Response
    {
        $fields = $request->validate(['ref' => ['required', 'string', 'max:64']]);
        $library = $this->library($request);

        if (! $library->canFavorite($fields['ref'])) {
            throw ValidationException::withMessages(['ref' => 'There is no preset with that id.']);
        }

        $library->addFavorite($fields['ref']);

        return response()->noContent();
    }

    public function destroy(Request $request, string $ref): Response
    {
        $this->library($request)->removeFavorite($ref);

        return response()->noContent();
    }
}

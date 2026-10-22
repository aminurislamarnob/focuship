<?php

namespace App\Http\Controllers\Account;

use App\Account\ConnectedApps;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * The AI assistants a listener has connected to their Focuship account, and
 * cutting one off (ADR 0004).
 */
class ConnectedAppController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json(['apps' => $this->apps($request)->all()]);
    }

    public function destroy(Request $request, string $client): Response
    {
        abort_unless($this->apps($request)->revoke($client), 404);

        return response()->noContent();
    }

    private function apps(Request $request): ConnectedApps
    {
        /** @var User $user */
        $user = $request->user();

        return new ConnectedApps($user);
    }
}

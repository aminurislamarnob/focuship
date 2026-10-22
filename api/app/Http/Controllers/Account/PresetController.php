<?php

namespace App\Http\Controllers\Account;

use App\Account\Library;
use App\Http\Controllers\Controller;
use App\Models\Preset;
use App\Models\User;
use App\Rules\KnownSounds;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

/**
 * The listener's saved presets, and the public read behind a `?p=` share link.
 */
class PresetController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json([
            'presets' => $this->library($request)->presets()->map->toCloudPreset()->values(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $fields = $request->validate([
            'id' => ['required', 'uuid', Rule::unique('presets', 'id')],
            'label' => ['required', 'string', 'min:2', 'max:60'],
            'layers' => ['required', 'array', 'min:1', 'max:'.self::MAX_LAYERS, new KnownSounds],
            'layers.*' => ['required', 'numeric', 'between:0,1'],
        ]);

        $preset = $this->library($request)->savePreset($fields['id'], $fields['label'], $fields['layers']);

        return response()->json(['preset' => $preset->toCloudPreset()], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $preset = $this->find($request, $id);

        $fields = $request->validate([
            'label' => ['sometimes', 'string', 'min:2', 'max:60'],
            'isPublic' => ['sometimes', 'boolean'],
        ]);

        $library = $this->library($request);

        if (array_key_exists('label', $fields)) {
            $preset = $library->renamePreset($preset, $fields['label']);
        }

        if (array_key_exists('isPublic', $fields)) {
            $preset = $library->setPresetPublic($preset, $fields['isPublic']);
        }

        return response()->json(['preset' => $preset->toCloudPreset()]);
    }

    public function destroy(Request $request, string $id): Response
    {
        $this->library($request)->deletePreset($this->find($request, $id));

        return response()->noContent();
    }

    /** A shared preset, for anyone holding the link. */
    public function shared(string $id): JsonResponse
    {
        $preset = Library::sharedPreset($id);

        abort_if($preset === null, 404, 'That shared preset is no longer available.');

        return response()->json([
            'preset' => ['id' => $preset->id, 'label' => $preset->label, 'layers' => $preset->layers],
        ]);
    }

    /** A mix nobody could hear all of at once is a mistake, not a preset. */
    public const MAX_LAYERS = 20;

    private function find(Request $request, string $id): Preset
    {
        $preset = $this->library($request)->preset($id);

        // Someone else's preset is not theirs to know about, let alone change.
        abort_if($preset === null, 404);

        return $preset;
    }

    private function library(Request $request): Library
    {
        /** @var User $user */
        $user = $request->user();

        return $user->library();
    }
}

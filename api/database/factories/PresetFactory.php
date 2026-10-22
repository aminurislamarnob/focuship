<?php

namespace Database\Factories;

use App\Models\Preset;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Preset>
 */
class PresetFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'label' => fake()->unique()->words(2, true),
            'layers' => ['rain-on-window' => 0.6, 'keyboard' => 0.25],
            'is_public' => false,
        ];
    }
}

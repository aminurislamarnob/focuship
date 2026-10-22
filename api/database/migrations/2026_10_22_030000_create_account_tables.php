<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * What an account holds: saved presets, favorites and the synced slice of settings.
     */
    public function up(): void
    {
        // Preset ids are UUIDs because they are public: a shared preset's id is its link.
        Schema::create('presets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('label', 60);
            // Text, not json: MySQL reorders json keys, and a share link should list
            // the sounds in the order the listener layered them.
            $table->text('layers');
            $table->boolean('is_public')->default(false);
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
        });

        // A favorite points at a built-in preset id or one of the listener's own presets.
        Schema::create('favorites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('preset_ref', 64);
            $table->timestamps();

            $table->unique(['user_id', 'preset_ref']);
        });

        // One row per listener; `updated_at` is the clock that decides which device wins.
        Schema::create('user_settings', function (Blueprint $table) {
            $table->foreignId('user_id')->primary()->constrained()->cascadeOnDelete();
            $table->text('timer');
            $table->float('volume');
            $table->timestamp('updated_at', 3);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_settings');
        Schema::dropIfExists('favorites');
        Schema::dropIfExists('presets');
    }
};

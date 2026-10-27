<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Emailed 6-digit sign-in codes. Stored hashed, short-lived, and dead after a
     * handful of wrong guesses; the scheduler prunes expired rows.
     */
    public function up(): void
    {
        Schema::create('sign_in_codes', function (Blueprint $table) {
            $table->id();
            $table->string('email')->index();
            $table->string('code_hash');
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->timestamp('consumed_at')->nullable();
            // An explicit default: MariaDB without explicit_defaults_for_timestamp
            // rejects a NOT NULL timestamp that has none. A code saved without an
            // expiry is already dead.
            $table->timestamp('expires_at')->useCurrent()->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sign_in_codes');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // Name
            $table->string('first_name');
            $table->string('last_name');

            // Contact info
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('company')->nullable();

            // Address
            $table->string('street')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();       // Province/State
            $table->string('zip')->nullable();
            $table->string('country')->nullable();

            // Extra
            $table->text('notes')->nullable();
            $table->string('tags')->nullable();        // Comma-separated tags
            $table->string('avatar')->nullable();      // Path to uploaded image

            $table->timestamps();
            $table->softDeletes();

            // Indexes for search/sort performance
            $table->index(['user_id', 'last_name', 'first_name']);
            $table->index(['user_id', 'company']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contacts');
    }
};
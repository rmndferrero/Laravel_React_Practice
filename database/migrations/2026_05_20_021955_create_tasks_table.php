<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();

            // Ownership — user_id required, team_id nullable for future team scoping
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('team_id')->nullable()->index(); // no FK yet, add when teams exist

            // Optional link to a contact
            $table->foreignId('contact_id')
                  ->nullable()
                  ->constrained()
                  ->nullOnDelete(); // if contact deleted, task stays but loses the link

            // Core fields
            $table->string('name', 100);
            $table->text('description')->nullable();

            // String-based status — avoids enum ALTER pain
            // Expected values: pending | in_progress | completed | cancelled | other
            $table->string('status', 30)->default('pending');
            $table->string('status_custom', 20)->nullable(); // filled only when status = 'other'

            // String-based priority
            // Expected values: low | medium | high | urgent
            $table->string('priority', 20)->default('medium');

            $table->timestamp('due_at')->nullable(); // deadline with time

            $table->string('tags')->nullable(); // comma-separated, max 30 chars per tag

            $table->timestamps();
            $table->softDeletes();

            // Indexes for common query patterns
            $table->index(['user_id', 'status']);
            $table->index(['user_id', 'priority']);
            $table->index(['user_id', 'due_at']);
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
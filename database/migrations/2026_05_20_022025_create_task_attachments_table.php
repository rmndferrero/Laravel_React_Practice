<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('task_attachments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('task_id')->constrained()->cascadeOnDelete();

            // Who uploaded — useful for team context later
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->string('original_name');       // filename as uploaded by user
            $table->string('stored_path');         // path on disk: files_uploaded/uuid.ext
            $table->string('mime_type', 100);
            $table->unsignedBigInteger('size_bytes');
            $table->string('disk', 20)->default('public'); // 's3' later for prod

            $table->timestamps();

            $table->index('task_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('task_attachments');
    }
};
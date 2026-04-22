<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('name');
            $table->string('file_name');
            $table->string('disk', 50)->default('public');
            $table->string('mime_type', 100)->nullable();
            $table->unsignedBigInteger('size');
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->string('alt_text')->nullable();
            $table->string('title')->nullable();
            $table->string('folder', 100)->default('/');
            $table->timestamp('created_at')->useCurrent();
            
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->index('user_id');
            $table->index(['mime_type', 'folder']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};

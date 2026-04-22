<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->bigIncrements('id');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('name');
            $table->string('file_name');
            $table->string('disk', 50)->default('public');
            $table->string('mime_type', 100)->nullable();
            $table->unsignedBigInteger('size')->nullable();
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->string('alt_text')->nullable();
            $table->string('title')->nullable();
            $table->string('folder', 100)->default('/');
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('user_id', 'fk_media_user')->references('id')->on('users')->onDelete('set null');
            $table->index('user_id', 'idx_user_id');
            $table->index(['mime_type', 'folder'], 'idx_mime_type_folder');
            $table->index('created_at', 'idx_created_at');
        });
    }

    public function down(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('media');
        Schema::enableForeignKeyConstraints();
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pages', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->bigIncrements('id');
            $table->string('title');
            $table->string('slug')->unique();
            $table->longText('content');
            $table->string('featured_image')->nullable();
            $table->string('layout', 50)->default('default');
            $table->string('meta_title')->nullable();
            $table->string('meta_description', 160)->nullable();
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->integer('position')->default(0);
            $table->softDeletes();
            $table->timestamps();

            $table->index(['status', 'position', 'deleted_at'], 'idx_status_position');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pages');
    }
};

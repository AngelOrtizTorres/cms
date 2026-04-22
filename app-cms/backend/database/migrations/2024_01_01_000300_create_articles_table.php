<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('section_id');
            $table->unsignedBigInteger('user_id');
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('excerpt')->nullable();
            $table->longText('content');
            $table->string('featured_image')->nullable();
            $table->json('gallery_images')->nullable();
            $table->boolean('featured')->default(false);
            $table->enum('status', ['draft', 'scheduled', 'published', 'archived'])->default('draft');
            $table->string('meta_title')->nullable();
            $table->string('meta_description', 160)->nullable();
            $table->timestamp('published_at')->nullable();
            $table->softDeletes();
            $table->timestamps();
            
            $table->foreign('section_id')->references('id')->on('sections')->onDelete('restrict');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('restrict');
            
            $table->index(['status', 'published_at', 'deleted_at']);
            $table->index(['section_id', 'status', 'published_at']);
            $table->index(['featured', 'status']);
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};

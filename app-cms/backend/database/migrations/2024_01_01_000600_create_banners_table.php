<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('banners', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->enum('type', ['image', 'code'])->default('image');
            $table->string('image_url')->nullable();
            $table->string('link_url')->nullable();
            $table->text('code_content')->nullable();
            $table->enum('position', ['header', 'sidebar', 'between_articles', 'footer']);
            $table->integer('display_order')->default(0);
            $table->boolean('active')->default(true);
            $table->softDeletes();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->unsignedInteger('clicks')->default(0);
            $table->unsignedInteger('impressions')->default(0);
            $table->timestamps();

            $table->index(['position', 'active', 'display_order', 'deleted_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('banners');
    }
};

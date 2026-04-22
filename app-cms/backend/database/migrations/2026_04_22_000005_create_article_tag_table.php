<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('article_tag', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->unsignedBigInteger('article_id');
            $table->unsignedBigInteger('tag_id');
            $table->timestamp('created_at')->useCurrent();
            $table->primary(['article_id', 'tag_id']);

            $table->foreign('article_id', 'fk_article_tag_article')->references('id')->on('articles')->onDelete('cascade');
            $table->foreign('tag_id', 'fk_article_tag_tag')->references('id')->on('tags')->onDelete('cascade');
            $table->index('tag_id', 'idx_tag_id');
        });
    }

    public function down(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('article_tag');
        Schema::enableForeignKeyConstraints();
    }
};

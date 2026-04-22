<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('article_section', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->unsignedBigInteger('article_id');
            $table->unsignedBigInteger('section_id');
            $table->timestamp('created_at')->useCurrent();
            $table->primary(['article_id', 'section_id']);

            $table->foreign('article_id', 'fk_artsec_article')->references('id')->on('articles')->onDelete('cascade');
            $table->foreign('section_id', 'fk_artsec_section')->references('id')->on('sections')->onDelete('cascade');
            $table->index('section_id', 'idx_section_id');
        });
    }

    public function down(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('article_section');
        Schema::enableForeignKeyConstraints();
    }
};

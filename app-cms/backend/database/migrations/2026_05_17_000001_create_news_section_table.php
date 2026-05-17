<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add primary_section_id to news
        Schema::table('news', function (Blueprint $table) {
            $table->unsignedBigInteger('primary_section_id')->nullable()->after('site_id');
            $table->foreign('primary_section_id')->references('id')->on('sections')->onDelete('set null');
        });

        // Pivot: news <-> sections with position for ordering within each section
        Schema::create('news_section', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('news_id');
            $table->unsignedBigInteger('section_id');
            $table->integer('position')->default(0);
            $table->timestamps();

            $table->unique(['news_id', 'section_id']);
            $table->foreign('news_id')->references('id')->on('news')->onDelete('cascade');
            $table->foreign('section_id')->references('id')->on('sections')->onDelete('cascade');
            $table->index(['section_id', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('news_section');
        Schema::table('news', function (Blueprint $table) {
            $table->dropForeign(['primary_section_id']);
            $table->dropColumn('primary_section_id');
        });
    }
};

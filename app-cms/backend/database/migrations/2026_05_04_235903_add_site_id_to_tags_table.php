<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tags', function (Blueprint $table) {
            // Permitir etiquetas por sitio (nullable para etiquetas globales)
            $table->unsignedBigInteger('site_id')->nullable()->after('id');
            $table->index('site_id', 'idx_tags_site_id');
            $table->foreign('site_id', 'fk_tags_site')->references('id')->on('sites')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('tags', function (Blueprint $table) {
            $table->dropForeign('fk_tags_site');
            $table->dropIndex('idx_tags_site_id');
            $table->dropColumn('site_id');
        });
    }
};

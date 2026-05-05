<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('banners', function (Blueprint $table) {
            // Agregar columna site_id para soportar banners por sitio
            $table->unsignedBigInteger('site_id')->nullable()->after('id');
            $table->index('site_id', 'idx_banners_site_id');
            $table->foreign('site_id', 'fk_banners_site')->references('id')->on('sites')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('banners', function (Blueprint $table) {
            $table->dropForeign('fk_banners_site');
            $table->dropIndex('idx_banners_site_id');
            $table->dropColumn('site_id');
        });
    }
};

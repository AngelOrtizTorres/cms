<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('sections')) return;

        Schema::table('sections', function (Blueprint $table) {
            if (!Schema::hasColumn('sections', 'website_id')) {
                $table->unsignedBigInteger('website_id')->nullable()->after('id');
                $table->index('website_id', 'idx_sections_website_id');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('sections')) return;

        Schema::table('sections', function (Blueprint $table) {
            if (Schema::hasColumn('sections', 'website_id')) {
                $table->dropIndex('idx_sections_website_id');
                $table->dropColumn('website_id');
            }
        });
    }
};

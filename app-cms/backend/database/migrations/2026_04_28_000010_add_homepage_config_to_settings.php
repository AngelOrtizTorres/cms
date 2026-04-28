<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('settings')) return;

        Schema::table('settings', function (Blueprint $table) {
            if (!Schema::hasColumn('settings', 'homepage_config')) {
                $table->json('homepage_config')->nullable()->after('social_links');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('settings')) return;

        Schema::table('settings', function (Blueprint $table) {
            if (Schema::hasColumn('settings', 'homepage_config')) {
                $table->dropColumn('homepage_config');
            }
        });
    }
};

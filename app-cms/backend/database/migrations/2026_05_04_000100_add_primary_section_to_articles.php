<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Add nullable primary_section_id, copy existing section_id values, then replace FK
        Schema::table('articles', function (Blueprint $table) {
            $table->unsignedBigInteger('primary_section_id')->nullable()->after('user_id');
        });

        // Copy data from section_id into primary_section_id
        DB::statement('UPDATE articles SET primary_section_id = section_id');

        // Drop old FK and index if present, then add new FK and index and remove old column
        Schema::table('articles', function (Blueprint $table) {
            // drop foreign key if exists
            try {
                $table->dropForeign('fk_articles_section');
            } catch (\Exception $e) {
                // ignore if not present
            }

            try {
                $table->dropIndex('idx_section_status_date');
            } catch (\Exception $e) {
                // ignore
            }
        });

        Schema::table('articles', function (Blueprint $table) {
            $table->foreign('primary_section_id', 'fk_articles_primary_section')
                  ->references('id')->on('sections')->onDelete('restrict');
            $table->index(['primary_section_id', 'status', 'published_at'], 'idx_primary_section_status_date');

            // safe to drop old column now
            try {
                $table->dropColumn('section_id');
            } catch (\Exception $e) {
                // ignore
            }
        });
    }

    public function down(): void
    {
        // Recreate old column, copy values back, restore FK and indexes
        Schema::table('articles', function (Blueprint $table) {
            $table->unsignedBigInteger('section_id')->nullable()->after('user_id');
        });

        DB::statement('UPDATE articles SET section_id = primary_section_id');

        Schema::table('articles', function (Blueprint $table) {
            try {
                $table->foreign('section_id', 'fk_articles_section')
                      ->references('id')->on('sections')->onDelete('restrict');
            } catch (\Exception $e) {
            }

            try {
                $table->index(['section_id', 'status', 'published_at'], 'idx_section_status_date');
            } catch (\Exception $e) {
            }
        });

        Schema::table('articles', function (Blueprint $table) {
            try {
                $table->dropForeign('fk_articles_primary_section');
            } catch (\Exception $e) {
            }

            try {
                $table->dropIndex('idx_primary_section_status_date');
            } catch (\Exception $e) {
            }

            try {
                $table->dropColumn('primary_section_id');
            } catch (\Exception $e) {
            }
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class CreateHomepageConfigTable extends Migration
{
    public function up()
    {
        Schema::create('homepage_config', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->tinyInteger('id')->unsigned()->default(1);
            $table->string('meta_title')->nullable();
            $table->string('meta_description', 160)->nullable();
            $table->tinyInteger('featured_articles_count')->unsigned()->default(6);
            $table->tinyInteger('latest_articles_count')->unsigned()->default(10);
            $table->json('layout_schema')->nullable();
            $table->boolean('banners_enabled')->default(true);
            $table->boolean('show_notices')->default(true);
            $table->timestamp('updated_at')->useCurrent();
            $table->primary('id');
        });

        // Add check constraint and ensure ON UPDATE CURRENT_TIMESTAMP for updated_at
        try {
            DB::statement("ALTER TABLE homepage_config ADD CONSTRAINT uc_homepage_config_single CHECK (id = 1)");
        } catch (\Exception $e) {
            // Some MySQL versions ignore CHECK, ignore failures
        }

        try {
            DB::statement("ALTER TABLE homepage_config MODIFY COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
        } catch (\Exception $e) {
            // ignore if not supported
        }

        // Insert default row if not exists
        DB::table('homepage_config')->insertOrIgnore([
            'id' => 1,
            'meta_title' => 'Portada Principal',
            'featured_articles_count' => 6,
            'latest_articles_count' => 10,
        ]);
    }

    public function down()
    {
        Schema::dropIfExists('homepage_config');
    }
}

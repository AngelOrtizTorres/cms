<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class CreateSettingsTable extends Migration
{
    public function up()
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->tinyInteger('id')->unsigned()->default(1);
            $table->string('site_name')->default('Mi CMS');
            $table->string('site_description', 160)->nullable();
            $table->string('logo_url')->nullable();
            $table->string('favicon_url')->nullable();
            $table->string('brand_color', 7)->default('#000000');
            $table->string('contact_email')->nullable();
            $table->string('phone_number', 20)->nullable();
            $table->text('address')->nullable();
            $table->json('social_links')->nullable();
            $table->string('google_analytics_id', 50)->nullable();
            $table->string('facebook_pixel_id', 50)->nullable();
            $table->text('header_scripts')->nullable();
            $table->text('footer_scripts')->nullable();
            $table->boolean('maintenance_mode')->default(false);
            $table->timestamp('updated_at')->useCurrent();
            $table->primary('id');
        });

        try {
            DB::statement("ALTER TABLE settings ADD CONSTRAINT uc_settings_single CHECK (id = 1)");
        } catch (\Exception $e) {
            // ignore
        }

        try {
            DB::statement("ALTER TABLE settings MODIFY COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
        } catch (\Exception $e) {
            // ignore
        }

        DB::table('settings')->insertOrIgnore([
            'id' => 1,
            'site_name' => 'Mi CMS',
            'social_links' => json_encode(new \stdClass()),
        ]);
    }

    public function down()
    {
        Schema::dropIfExists('settings');
    }
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_user', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->unsignedBigInteger('site_id');
            $table->unsignedBigInteger('user_id');
            $table->string('role')->nullable();
            $table->primary(['site_id', 'user_id']);

            $table->foreign('site_id', 'fk_site_user_site')->references('id')->on('sites')->onDelete('cascade');
            $table->foreign('user_id', 'fk_site_user_user')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_user');
    }
};

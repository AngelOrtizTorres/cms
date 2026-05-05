<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sites', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->bigIncrements('id');
            $table->string('title');
            $table->string('slug')->unique();
            $table->unsignedBigInteger('owner_id')->nullable();
            $table->string('domain')->nullable()->unique();
            $table->text('description')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('icon')->nullable();
            $table->enum('status', ['active', 'inactive', 'archived'])->default('active');
            $table->timestamps();

            $table->foreign('owner_id', 'fk_sites_owner')->references('id')->on('users')->onDelete('set null');
            $table->index(['domain', 'status'], 'idx_sites_domain_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sites');
    }
};

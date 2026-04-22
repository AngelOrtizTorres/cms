<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateNoticesTable extends Migration
{
    public function up()
    {
        Schema::create('notices', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->bigIncrements('id');
            $table->string('title');
            $table->text('message');
            $table->enum('type', ['info', 'warning', 'error', 'success'])->default('info');
            $table->boolean('dismissible')->default(true);
            $table->integer('priority')->default(0);
            $table->string('link_label', 50)->nullable();
            $table->string('link_url')->nullable();
            $table->json('target_pages')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['active', 'priority', 'starts_at', 'ends_at', 'deleted_at'], 'idx_active_priority_dates');
        });
    }

    public function down()
    {
        Schema::dropIfExists('notices');
    }
}

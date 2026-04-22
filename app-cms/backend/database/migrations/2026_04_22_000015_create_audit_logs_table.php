<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAuditLogsTable extends Migration
{
    public function up()
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->bigIncrements('id');
            $table->timestamp('created_at')->useCurrent();

            $table->char('batch_uuid', 36)->nullable();

            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('auditable_type');
            $table->unsignedBigInteger('auditable_id');
            $table->enum('action', ['create', 'update', 'delete', 'restore']);

            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();

            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->text('url')->nullable();

            $table->index(['auditable_type', 'auditable_id'], 'idx_auditable_model');
            $table->index('batch_uuid', 'idx_batch');
            $table->index(['user_id', 'created_at'], 'idx_user_action');
        });
    }

    public function down()
    {
        Schema::dropIfExists('audit_logs');
    }
}

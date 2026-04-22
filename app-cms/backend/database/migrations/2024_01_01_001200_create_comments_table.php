<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            
            // Jerarquía Optimizada
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->string('path')->default('');  // Ruta jerárquica
            $table->unsignedTinyInteger('depth')->default(0);  // Nivel de anidación
            
            // Relación Polimórfica
            $table->unsignedBigInteger('commentable_id');
            $table->string('commentable_type');
            
            // Autoría
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('name');
            $table->string('email');
            $table->text('content');
            
            // Moderación
            $table->enum('status', ['pending', 'approved', 'rejected', 'spam'])->default('pending');
            
            // Analítica de Engagement
            $table->unsignedInteger('reply_count')->default(0);
            $table->integer('upvotes')->default(0);
            $table->integer('downvotes')->default(0);
            
            // Auditoría
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            
            // ÍNDICES
            $table->index(['commentable_type', 'commentable_id', 'status', 'path']);
            $table->index(['commentable_type', 'commentable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comments');
    }
};

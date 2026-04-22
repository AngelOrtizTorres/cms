<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Primero modificar la tabla users para agregar campos faltantes
        if (!Schema::hasColumn('users', 'role')) {
            Schema::table('users', function (Blueprint $table) {
                $table->enum('role', ['admin', 'editor', 'viewer'])->default('editor')->after('password');
                $table->boolean('active')->default(true)->after('role');
                $table->string('avatar_url')->nullable()->after('active');
                $table->timestamp('last_login_at')->nullable()->after('avatar_url');
                $table->softDeletes();
            });
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'active', 'avatar_url', 'last_login_at', 'deleted_at']);
        });
    }
};

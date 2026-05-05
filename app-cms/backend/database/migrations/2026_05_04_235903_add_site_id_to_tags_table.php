<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tags', function (Blueprint $table) {
            // Permitir etiquetas por sitio (nullable para etiquetas globales)
            $table->unsignedBigInteger('site_id')->nullable()->after('id');
            $table->index('site_id', 'idx_tags_site_id');
            $table->foreign('site_id', 'fk_tags_site')->references('id')->on('sites')->onDelete('cascade');
            // Convertir unicidad global en unicidad por sitio (site_id, slug) y (site_id, name)
            // Primero eliminar índices únicos existentes en name y slug si existen
            try {
                $table->dropUnique(['name']);
            } catch (\Exception $e) {
                // ignore if not present
            }
            try {
                $table->dropUnique(['slug']);
            } catch (\Exception $e) {
                // ignore if not present
            }

            // Crear índices únicos compuestos por sitio
            $table->unique(['site_id', 'slug'], 'uniq_tags_site_slug');
            $table->unique(['site_id', 'name'], 'uniq_tags_site_name');
        });
    }

    public function down(): void
    {
        Schema::table('tags', function (Blueprint $table) {
            // Restaurar índices y eliminar columna site_id
            try { $table->dropForeign('fk_tags_site'); } catch (\Exception $e) {}
            try { $table->dropUnique('uniq_tags_site_slug'); } catch (\Exception $e) {}
            try { $table->dropUnique('uniq_tags_site_name'); } catch (\Exception $e) {}
            try { $table->dropIndex('idx_tags_site_id'); } catch (\Exception $e) {}
            // Re-crear unicidad global en name y slug
            try { $table->unique('name'); } catch (\Exception $e) {}
            try { $table->unique('slug'); } catch (\Exception $e) {}
            try { $table->dropColumn('site_id'); } catch (\Exception $e) {}
        });
    }
};

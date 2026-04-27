<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\Section;
use App\Models\User;
use Illuminate\Database\Seeder;

class ArticleSeeder extends Seeder
{
    public function run(): void
    {
        $sections = Section::all();
        $user = User::first() ?? User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
        ]);

        if (!$user->hasRole('admin')) {
            $user->syncRoles(['admin']);
        }

        Article::create([
            'title' => 'Bienvenido al CMS',
            'slug' => 'bienvenido-al-cms',
            'excerpt' => 'Este es tu primer artículo en el CMS',
            'content' => '<h2>Bienvenido</h2><p>Este es un artículo de ejemplo creado automáticamente. Puedes editarlo o eliminarlo según sea necesario.</p><p>El CMS está completamente funcional y listo para usar.</p>',
            'featured' => true,
            'status' => 'published',
            'section_id' => $sections->first()?->id ?? 1,
            'user_id' => $user->id,
            'meta_title' => 'Bienvenido al CMS',
            'meta_description' => 'Tu primer artículo en el CMS',
            'published_at' => now(),
        ]);

        Article::create([
            'title' => 'Cómo usar el editor de artículos',
            'slug' => 'como-usar-editor-articulos',
            'excerpt' => 'Aprende a usar el editor de artículos del CMS',
            'content' => '<h2>Editor de Artículos</h2><p>El editor proporciona una interfaz intuitiva para crear y editar artículos.</p><ul><li>Usa el editor WYSIWYG para formatear tu contenido</li><li>Añade imágenes desde la galería de medios</li><li>Organiza tu contenido en secciones</li></ul>',
            'featured' => true,
            'status' => 'published',
            'section_id' => $sections->where('slug', 'tutoriales')->first()?->id ?? 2,
            'user_id' => $user->id,
            'meta_title' => 'Tutorial: Editor de Artículos',
            'meta_description' => 'Aprende a usar el editor',
            'published_at' => now()->subDay(),
        ]);

        Article::create([
            'title' => 'Tips para SEO en artículos',
            'slug' => 'tips-seo-articulos',
            'excerpt' => 'Optimiza tus artículos para los motores de búsqueda',
            'content' => '<h2>Optimización SEO</h2><p>Para mejorar el posicionamiento en buscadores:</p><ul><li>Usa títulos descriptivos y atractivos</li><li>Completa meta títulos y descripciones</li><li>Usa palabras clave relevantes</li><li>Estructura tu contenido con encabezados</li></ul>',
            'featured' => false,
            'status' => 'published',
            'section_id' => $sections->where('slug', 'blog')->first()?->id ?? 3,
            'user_id' => $user->id,
            'meta_title' => 'SEO: Tips para Artículos',
            'meta_description' => 'Optimiza tus artículos para SEO',
            'published_at' => now()->subDays(2),
        ]);

        Article::create([
            'title' => 'Gestión de medios en el CMS',
            'slug' => 'gestion-medios-cms',
            'excerpt' => 'Sube y gestiona tus archivos multimedia',
            'content' => '<h2>Biblioteca de Medios</h2><p>La biblioteca de medios permite:</p><ul><li>Subir imágenes y documentos</li><li>Organizar archivos por carpetas</li><li>Eliminar archivos innecesarios</li><li>Insertar medios en artículos</li></ul>',
            'featured' => false,
            'status' => 'published',
            'section_id' => $sections->where('slug', 'tutoriales')->first()?->id ?? 2,
            'user_id' => $user->id,
            'meta_title' => 'Gestión de Medios',
            'meta_description' => 'Aprende a gestionar medios',
            'published_at' => now()->subDays(3),
        ]);
    }
}

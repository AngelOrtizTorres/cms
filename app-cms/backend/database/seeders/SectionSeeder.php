<?php

namespace Database\Seeders;

use App\Models\Section;
use Illuminate\Database\Seeder;

class SectionSeeder extends Seeder
{
    public function run(): void
    {
        Section::create([
            'name' => 'Noticias',
            'slug' => 'noticias',
            'description' => 'Últimas noticias y actualizaciones',
            'meta_title' => 'Noticias - CMS',
            'meta_description' => 'Lee nuestras últimas noticias',
            'position' => 1,
            'active' => true,
        ]);

        Section::create([
            'name' => 'Tutoriales',
            'slug' => 'tutoriales',
            'description' => 'Guías y tutoriales útiles',
            'meta_title' => 'Tutoriales - CMS',
            'meta_description' => 'Aprende con nuestros tutoriales',
            'position' => 2,
            'active' => true,
        ]);

        Section::create([
            'name' => 'Blog',
            'slug' => 'blog',
            'description' => 'Artículos del blog',
            'meta_title' => 'Blog - CMS',
            'meta_description' => 'Lee nuestro blog',
            'position' => 3,
            'active' => true,
        ]);
    }
}

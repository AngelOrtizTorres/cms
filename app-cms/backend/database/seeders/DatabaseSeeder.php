<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
<<<<<<< HEAD
=======
        // Ejecutar seeders en orden: roles -> usuarios -> contenido
>>>>>>> main
        $this->call([
            UserSeeder::class,
            WebsiteSeeder::class,
            RoleSeeder::class,
            UserSeeder::class,
            SectionSeeder::class,
            ArticleSeeder::class,
        ]);
        
    }
}

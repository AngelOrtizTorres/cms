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
        // Ejecutar seeders en orden: roles -> usuarios -> contenido
        $this->call([
            RoleSeeder::class,
            UserSeeder::class,
            SectionSeeder::class,
            ArticleSeeder::class,
        ]);
    }
}

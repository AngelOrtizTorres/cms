<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Crear usuario de prueba
        User::factory()->create([
            'name' => 'Usuario Prueba',
            'email' => 'usuario@example.com',
            'password' => 'contraseña',
            'role' => 'admin',
        ]);

        // Ejecutar seeders
        $this->call([
            RoleSeeder::class,
            SectionSeeder::class,
            ArticleSeeder::class,
        ]);
    }
}

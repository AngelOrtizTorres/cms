<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Usuario administrador idempotente
        $user = User::updateOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Administrador',
                'password' => Hash::make('admin123456789'),
                'remember_token' => Str::random(16),
                'role' => 'admin',
            ]
        );

        // Asignar rol Spatie si está disponible
        if (method_exists($user, 'assignRole')) {
            $user->assignRole('admin');
        }

        // Usuario autor idempotente
        $author = User::updateOrCreate(
            ['email' => 'author@gmail.com'],
            [
                'name' => 'Autor',
                'password' => Hash::make('author123456789'),
                'remember_token' => Str::random(16),
                'role' => 'author',
                'api_token' => Str::random(60),
            ]
        );

        if (method_exists($author, 'assignRole')) {
            $author->assignRole('author');
        }

        // Usuario editor idempotente
        $editor = User::updateOrCreate(
            ['email' => 'editor@gmail.com'],
            [
                'name' => 'Editor',
                'password' => Hash::make('editor123456789'),
                'remember_token' => Str::random(16),
                'role' => 'editor',
                'api_token' => Str::random(60),
            ]
        );

        if (method_exists($editor, 'assignRole')) {
            $editor->assignRole('editor');
        }
    }
}

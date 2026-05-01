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
    }
}

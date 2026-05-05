<?php

namespace Database\Seeders;

<<<<<<< HEAD
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Arr;
=======
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
>>>>>>> main

class UserSeeder extends Seeder
{
    public function run(): void
    {
<<<<<<< HEAD
        // Ensure basic roles exist
        $roles = ['admin', 'editor', 'author'];
        foreach ($roles as $r) {
            Role::firstOrCreate(['name' => $r]);
        }

        // Create or update admin user
        $admin = User::updateOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('admin123456789'),
                'email_verified_at' => now(),
                'active' => true,
            ]
        );

        $admin->syncRoles(['admin']);

        // Create 30 test users
        $testUsers = User::factory()->count(30)->create();

        // Assign roles randomly to test users
        $roleChoices = ['author', 'editor'];
        foreach ($testUsers as $u) {
            $u->assignRole(Arr::random($roleChoices));
        }
    }
}
=======
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
>>>>>>> main

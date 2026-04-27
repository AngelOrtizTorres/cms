<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Arr;

class UserSeeder extends Seeder
{
    public function run(): void
    {
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
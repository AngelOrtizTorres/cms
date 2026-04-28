<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Website;

class WebsiteSeeder extends Seeder
{
    public function run(): void
    {
        // Asegurar que existan al menos 5 admins
        $admins = User::role('admin')->take(5)->get();
        if ($admins->count() < 5) {
            $needed = 5 - $admins->count();
            $newAdmins = User::factory()->count($needed)->create()->each(function ($u) {
                $u->assignRole('admin');
            });
            $admins = $admins->concat($newAdmins);
        }

        // Asegurar que existan al menos 5 authors
        $authors = User::role('author')->take(5)->get();
        if ($authors->count() < 5) {
            $needed = 5 - $authors->count();
            $newAuthors = User::factory()->count($needed)->create()->each(function ($u) {
                $u->assignRole('author');
            });
            $authors = $authors->concat($newAuthors);
        }

        // Crear 5 sitios para admins
        foreach ($admins->take(5)->values() as $i => $user) {
            Website::factory()->create([
                'user_id' => $user->id,
                'name' => 'Admin Site ' . ($i + 1),
            ]);
        }

        // Crear 5 sitios para authors
        foreach ($authors->take(5)->values() as $i => $user) {
            Website::factory()->create([
                'user_id' => $user->id,
                'name' => 'Author Site ' . ($i + 1),
            ]);
        }
    }
}

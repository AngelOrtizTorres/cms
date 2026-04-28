<?php

namespace Database\Factories;

use App\Models\Website;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Website>
 */
class WebsiteFactory extends Factory
{
    protected $model = Website::class;

    public function definition(): array
    {
        $name = fake()->company();
        $domain = fake()->domainName();

        return [
            'user_id' => User::factory(),
            'name' => $name,
            'description' => fake()->paragraph(),
            'logo' => null,
            'url' => 'https://' . $domain,
            'email' => fake()->companyEmail(),
        ];
    }
}

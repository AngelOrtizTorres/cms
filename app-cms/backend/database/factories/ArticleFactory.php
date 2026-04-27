<?php

namespace Database\Factories;

use App\Models\Article;
use App\Models\Section;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Article>
 */
class ArticleFactory extends Factory
{
    protected $model = Article::class;

    public function definition(): array
    {
        $title = fake()->sentence(6);
        $slug = Str::slug($title) . '-' . Str::random(6);
        $content = '<p>' . implode('</p><p>', fake()->paragraphs(5)) . '</p>';

        return [
            'title' => $title,
            'slug' => $slug,
            'excerpt' => fake()->text(200),
            'content' => $content,
            'featured_image' => null,
            'gallery_images' => json_encode([]),
            'featured' => fake()->boolean(10),
            'status' => fake()->randomElement(['draft', 'published', 'scheduled', 'archived']),
            'meta_title' => fake()->sentence(6),
            'meta_description' => fake()->text(150),
            'section_id' => Section::factory(),
            'user_id' => User::factory(),
            'published_at' => fake()->optional()->dateTimeBetween('-1 years', 'now'),
        ];
    }

    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'published',
            'published_at' => now(),
        ]);
    }
}

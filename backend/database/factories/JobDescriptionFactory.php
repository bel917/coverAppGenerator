<?php

namespace Database\Factories;

use App\Models\JobDescription;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\JobDescription>
 */
class JobDescriptionFactory extends Factory
{
    protected $model = JobDescription::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $role = fake()->randomElement([
            'Frontend Developer',
            'Backend Developer',
            'Product Manager',
            'Business Analyst',
            'UI/UX Designer',
        ]);

        $company = fake()->company();

        return [
            'user_id' => User::factory(),
            'title' => $role,
            'company_name' => $company,
            'job_post_url' => fake()->optional()->url(),
            'job_description_text' => "We are hiring a {$role} to join {$company}. ".fake()->paragraphs(3, true),
            'requirements_text' => 'Requirements: '.fake()->sentences(4, true),
            'location' => fake()->city().', '.fake()->country(),
            'employment_type' => fake()->randomElement(['full-time', 'part-time', 'contract', 'hybrid', 'remote']),
            'source' => fake()->randomElement(['manual', 'linkedin', 'indeed', 'company-site']),
        ];
    }
}

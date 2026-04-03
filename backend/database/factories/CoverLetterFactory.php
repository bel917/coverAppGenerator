<?php

namespace Database\Factories;

use App\Models\CoverLetter;
use App\Models\Cv;
use App\Models\JobDescription;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CoverLetter>
 */
class CoverLetterFactory extends Factory
{
    protected $model = CoverLetter::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $jobTitle = fake()->randomElement([
            'Frontend Developer',
            'Backend Developer',
            'Product Manager',
            'Marketing Specialist',
            'Data Analyst',
        ]);

        $company = fake()->company();
        $tone = fake()->randomElement(['professional', 'confident', 'friendly', 'formal']);
        $status = fake()->randomElement(['draft', 'generated', 'reviewed']);

        return [
            'user_id' => User::factory(),
            'cv_id' => Cv::factory(),
            'job_description_id' => JobDescription::factory(),
            'title' => "{$jobTitle} application for {$company}",
            'content' => "Dear Hiring Manager,\n\n".fake()->paragraphs(4, true)."\n\nSincerely,\n".fake()->name(),
            'tone' => $tone,
            'language' => fake()->randomElement(['en', 'en', 'en', 'de']),
            'status' => $status,
            'generated_by' => fake()->randomElement(['ai', 'user', 'ai-assisted']),
        ];
    }
}

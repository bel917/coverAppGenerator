<?php

namespace Database\Factories;

use App\Models\Cv;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Cv>
 */
class CvFactory extends Factory
{
    protected $model = Cv::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->randomElement([
            'Product Manager CV',
            'Senior Frontend Developer CV',
            'Backend Engineer Resume',
            'UX Designer Profile',
            'Operations Specialist CV',
        ]);

        $fileName = Str::slug($title).'.pdf';
        $skills = fake()->randomElements([
            'Laravel',
            'React',
            'TypeScript',
            'Project Management',
            'REST APIs',
            'SQL',
            'Figma',
            'Testing',
        ], fake()->numberBetween(3, 5));

        return [
            'user_id' => User::factory(),
            'title' => $title,
            'file_name' => $fileName,
            'file_path' => 'cvs/'.$fileName,
            'file_mime_type' => 'application/pdf',
            'file_size' => fake()->numberBetween(120_000, 2_400_000),
            'extracted_text' => fake()->paragraphs(4, true),
            'parsed_data_json' => [
                'name' => fake()->name(),
                'email' => fake()->safeEmail(),
                'phone' => fake()->phoneNumber(),
                'skills' => array_values($skills),
                'years_experience' => fake()->numberBetween(2, 10),
            ],
            'is_default' => false,
        ];
    }
}

<?php

namespace Database\Seeders;

use App\Models\CoverLetter;
use App\Models\Cv;
use App\Models\JobDescription;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CoverLetterGeneratorSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $user = User::query()->firstOrCreate(
            ['email' => 'demo@example.com'],
            [
                'name' => 'Demo User',
                'password' => Hash::make('password'),
            ]
        );

        $cvs = Cv::factory()
            ->count(2)
            ->for($user)
            ->sequence(
                ['title' => 'Primary Professional CV', 'is_default' => true],
                ['title' => 'Creative Portfolio CV', 'is_default' => false],
            )
            ->create();

        $jobDescriptions = JobDescription::factory()
            ->count(3)
            ->for($user)
            ->create();

        CoverLetter::factory()
            ->count(5)
            ->for($user)
            ->sequence(
                fn ($sequence) => [
                    'cv_id' => $cvs[$sequence->index % $cvs->count()]->id,
                    'job_description_id' => $jobDescriptions[$sequence->index % $jobDescriptions->count()]->id,
                ]
            )
            ->create();
    }
}

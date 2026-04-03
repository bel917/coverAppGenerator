<?php

namespace App\Services;

use App\Models\CoverLetter;
use App\Models\Cv;
use App\Models\JobDescription;
use App\Models\User;

class CoverLetterGenerationService
{
    public function generateForUser(User $user, array $payload): CoverLetter
    {
        $cv = isset($payload['cv_id'])
            ? $user->cvs()->findOrFail($payload['cv_id'])
            : null;

        $jobDescription = isset($payload['job_description_id'])
            ? $user->jobDescriptions()->findOrFail($payload['job_description_id'])
            : null;

        $jobDescriptionText = $jobDescription?->job_description_text ?? ($payload['job_description_text'] ?? '');
        $title = $payload['title'] ?? $this->buildTitle($jobDescription, $jobDescriptionText);
        $tone = $payload['tone'] ?? 'professional';
        $language = $payload['language'] ?? 'en';

        $content = $this->mockContent($user, $cv, $jobDescription, $jobDescriptionText, $tone);

        return $user->coverLetters()->create([
            'cv_id' => $cv?->id,
            'job_description_id' => $jobDescription?->id,
            'title' => $title,
            'content' => $content,
            'tone' => $tone,
            'language' => $language,
            'status' => 'draft',
            'generated_by' => 'ai',
        ]);
    }

    protected function buildTitle(?JobDescription $jobDescription, string $jobDescriptionText): string
    {
        if ($jobDescription?->title) {
            return 'Generated cover letter for '.$jobDescription->title;
        }

        $snippet = mb_substr(trim($jobDescriptionText), 0, 40);

        return $snippet !== ''
            ? 'Generated cover letter - '.$snippet
            : 'Generated cover letter';
    }

    protected function mockContent(
        User $user,
        ?Cv $cv,
        ?JobDescription $jobDescription,
        string $jobDescriptionText,
        string $tone
    ): string {
        $role = $jobDescription?->title ?? 'the role';
        $company = $jobDescription?->company_name ?? 'your company';
        $cvTitle = $cv?->title ?? 'my background';
        $summary = mb_substr(preg_replace('/\s+/', ' ', trim($jobDescriptionText)), 0, 240);

        return "Dear Hiring Manager,\n\n"
            ."I am excited to apply for {$role} at {$company}. Based on {$cvTitle}, I believe my experience aligns well with your current needs.\n\n"
            ."This draft was generated in a {$tone} tone for MVP testing. It uses the provided job description context to shape the narrative.\n\n"
            ."Job summary reference: {$summary}\n\n"
            ."Thank you for your consideration.\n\n"
            ."Sincerely,\n{$user->name}";
    }
}

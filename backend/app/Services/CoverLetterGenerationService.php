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
        $company = $jobDescription?->company_name ?? 'the company';
        $cvTitle = $cv?->title ?? 'my background';

        // Extract short list of key facts from the CV text when available
        $facts = $cv ? $this->extractKeyFactsFromCv($cv) : [];

        // Find top matches between job description and CV facts
        $matches = $this->matchRequirements($jobDescriptionText, $facts);

        // Build a more specific, human-sounding cover letter
        $openingFact = $facts[0] ?? null;
        $hook = $openingFact
            ? "With {$openingFact}, I am interested in the {$role} at {$company}."
            : "I'm writing regarding the {$role} at {$company}.";

        $body = "";

        if (!empty($matches['matched'])) {
            // use up to two matched facts to craft concrete sentences
            $used = array_slice($matches['matched'], 0, 2);
            foreach ($used as $m) {
                $body .= "In my previous role, {$m['fact']} — this directly addresses your need for {$m['requirement']}.\n\n";
            }
        } elseif (!empty($facts)) {
            // fallback: pick up to two strong facts
            $used = array_slice($facts, 0, 2);
            foreach ($used as $f) {
                $body .= "For example, {$f}.\n\n";
            }
        }

        // If there are missing or unmatched requirements, be honest and show transferable skills
        if (!empty($matches['missing'])) {
            $missingList = implode(', ', array_slice($matches['missing'], 0, 3));
            $transfer = $facts[0] ?? 'relevant experience';
            $body .= "I haven't had direct responsibility for {$missingList}, but I have {$transfer} and I learn quickly — I can ramp up and contribute to those areas within weeks.\n\n";
        }

        // Closing: propose next step and sign
        $closing = "I'd welcome a short conversation to show how my background in";
        $closing .= $facts[0] ? " {$this->shortenFactForClosing($facts[0])} " : " this area ";
        $closing .= "can help {$company} with the {$role}.\n\n";

        $closing .= "Thanks for considering my application.\n\n";
        $closing .= "Sincerely,\n{$user->name}";

        $letter = trim("Dear Hiring Team,\n\n{$hook}\n\n{$body}{$closing}");

        // Final pass to avoid templated/generic phrases
        return $this->cleanGenericPhrases($letter);
    }

    protected function extractKeyFactsFromCv(Cv $cv): array
    {
        $text = (string) $cv->extracted_text;
        $facts = [];

        if (trim($text) === '') {
            // fallback to title and file name
            if ($cv->title) {
                $facts[] = $cv->title;
            }
            if ($cv->file_name) {
                $facts[] = $cv->file_name;
            }
            return $facts;
        }

        // Split into lines and look for bullet-like lines or achievement verbs
        $lines = preg_split('/\r?\n/', $text);
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '') {
                continue;
            }

            // Prefer bullet points or lines with achievement verbs
            if (preg_match('/^(?:[-•*]|\d+\.)\s*(.+)/', $line, $m)) {
                $facts[] = rtrim($m[1], '.');
                continue;
            }

            if (preg_match('/\b(?:led|managed|increased|reduced|delivered|built|developed|designed|launched|improved|optimized)\b/i', $line)) {
                $facts[] = rtrim($line, '.');
                continue;
            }

            // capture short role lines like "Senior frontend engineer — Acme"
            if (preg_match('/[A-Z][a-z]{2,}(?: [A-Z][a-z]{2,}){0,3}/', $line) && strlen($line) < 200) {
                $facts[] = rtrim($line, '.');
            }

            if (count($facts) >= 8) {
                break;
            }
        }

        // dedupe and limit
        $facts = array_values(array_unique($facts));
        return array_slice($facts, 0, 6);
    }

    protected function matchRequirements(string $jobText, array $facts): array
    {
        $jobText = strtolower(preg_replace('/[^a-z0-9\s]/i', ' ', $jobText));
        $words = array_filter(array_map('trim', explode(' ', $jobText)), function ($w) {
            return strlen($w) > 4; // basic keywords
        });
        $keywords = array_count_values($words);
        arsort($keywords);
        $top = array_slice(array_keys($keywords), 0, 20);

        $matched = [];
        foreach ($facts as $fact) {
            $lowerFact = strtolower($fact);
            foreach ($top as $kw) {
                if (strpos($lowerFact, $kw) !== false) {
                    $matched[] = ['fact' => $fact, 'requirement' => $kw];
                    break;
                }
            }
        }

        // missing: top keywords that weren't matched
        $matchedReqs = array_map(fn($m) => $m['requirement'], $matched);
        $missing = array_values(array_filter($top, fn($k) => !in_array($k, $matchedReqs)));

        return ['matched' => $matched, 'missing' => $missing];
    }

    protected function shortenFactForClosing(string $fact): string
    {
        // Keep a short descriptor for closing sentence
        $short = preg_replace('/\s*\b(at|for|with|in)\b.*$/i', '', $fact);
        $short = mb_substr($short, 0, 80);
        return trim($short);
    }

    protected function cleanGenericPhrases(string $text): string
    {
        $replacements = [
            '/\bI am excited to apply\b/i' => 'I am writing about',
            '/\bI believe my experience aligns\b/i' => 'My experience',
            '/\bThank you for your consideration\b/i' => 'Thank you',
        ];

        foreach ($replacements as $pattern => $replace) {
            $text = preg_replace($pattern, $replace, $text);
        }

        // Remove repeated company fragments
        $text = preg_replace('/(\b' . preg_quote('the company', '/') . '\b\s*){2,}/i', 'the company ', $text);

        return trim(preg_replace('/\s+/', ' ', $text));
    }
}

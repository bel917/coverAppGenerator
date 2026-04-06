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

        // Extract prioritized facts (numeric achievements first, then tech highlights)
        $facts = $cv ? $this->extractPrioritizedFacts($cv) : [];

        // Detect candidate technologies from facts
        $techs = $this->detectTechnologies($facts);

        // Match job requirements
        $matches = $this->matchRequirements($jobDescriptionText, $facts);

        // Intro: who and main techs (up to 3)
        $introTech = $techs ? implode(', ', array_slice($techs, 0, 3)) : '';
        $intro = $introTech
            ? "I'm {$user->name}, a Software Developer with experience in {$introTech}."
            : "I'm {$user->name}, a Software Developer.";

        // Body: include 2–3 concrete achievements or technologies and connect to requirements
        $selectedFacts = array_slice($facts, 0, 3);
        $bodyParts = [];
        foreach ($selectedFacts as $f) {
            // find a matching keyword for connection, if any
            $matchedReq = null;
            foreach ($matches['matched'] as $m) {
                if ($m['fact'] === $f) {
                    $matchedReq = $m['requirement'];
                    break;
                }
            }

            if ($matchedReq) {
                $bodyParts[] = "$f — this addresses your need for {$matchedReq}.";
            } else {
                $bodyParts[] = "$f.";
            }
        }

        $body = implode(' ', $bodyParts);

        // Missing skills honesty — list missing items once, framed with transferable skills + willingness to learn
        $missingSentence = null;
        $needs = $this->detectNeeds($jobDescriptionText, ['symfony', 'go']);
        $missing = [];
        foreach ($needs as $need) {
            if (!in_array(strtolower($need), array_map('strtolower', $techs), true)) {
                $missing[] = ucfirst($need);
            }
        }

        if (!empty($missing)) {
            $missingList = count($missing) === 1 ? $missing[0] : (implode(', ', array_slice($missing, 0, -1)) . ' and ' . end($missing));
            // choose up to three transferable examples from detected techs or facts
            $transferExamples = $techs ? implode(', ', array_slice($techs, 0, 3)) : ($facts[0] ?? 'related backend and cloud experience');
            $missingSentence = "I don't yet have production experience with {$missingList}, but my {$transferExamples} are transferable and I'm ready to learn and apply {$missingList} quickly.";
        }

        // Closing: brief call-to-action
        $closing = "If you'd like, I can walk through the API designs and migration approach I used for previous projects in a short call.";

        $letter = trim(implode("\n\n", array_filter([
            $intro,
            $body ?: null,
            $missingSentence,
            $closing,
            "Sincerely,\n{$user->name}",
        ])));

        return $this->cleanGenericPhrases($letter);
    }

    protected function extractPrioritizedFacts(Cv $cv): array
    {
        $text = (string) $cv->extracted_text;
        $facts = [];

        // Look for strong numeric/monetary/percentage achievements first
        if (preg_match_all('/([0-9]+(?:[.,][0-9]+)?(?:\+|%|\s+revenue|\s+products?))/i', $text, $m)) {
            foreach ($m[0] as $match) {
                // capture surrounding context (short clause)
                if (preg_match('/([^.\n]{0,80}' . preg_quote($match, '/') . '[^.\n]{0,80})/i', $text, $ctx)) {
                    $facts[] = trim($ctx[1], " .\n");
                }
            }
        }

        // Next, pick lines with achievement verbs
        $lines = preg_split('/\r?\n/', $text);
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '') continue;
            if (preg_match('/\b(led|managed|increased|reduced|delivered|built|developed|designed|launched|improved|optimized|migrat)/i', $line)) {
                $facts[] = rtrim($line, '.');
            }
            if (count($facts) >= 6) break;
        }

        // Also add notable tech mentions
        if (preg_match_all('/\b(Laravel|React|Flutter|Bagisto|Shopware|Magento|AWS|Docker|MySQL|REST API|S3)\b/i', $text, $techs)) {
            foreach (array_unique($techs[0]) as $t) {
                $facts[] = trim($t);
            }
        }

        // dedupe and return up to 4 concise facts
        $facts = array_values(array_unique($facts));
        return array_slice($facts, 0, 4);
    }

    protected function detectTechnologies(array $facts): array
    {
        $techList = ['Laravel','React','Flutter','Bagisto','Shopware','Magento','AWS','Docker','MySQL','REST','S3','Java','Go','Symfony'];
        $found = [];
        foreach ($facts as $f) {
            foreach ($techList as $t) {
                if (stripos($f, $t) !== false) {
                    $found[] = $t;
                }
            }
        }
        return array_values(array_unique($found));
    }

    protected function detectNeeds(string $jobText, array $terms): array
    {
        $found = [];
        $lower = strtolower($jobText);
        foreach ($terms as $t) {
            if (strpos($lower, strtolower($t)) !== false) {
                $found[] = $t;
            }
        }
        return $found;
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

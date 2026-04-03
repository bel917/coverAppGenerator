<?php

namespace App\Http\Requests;

use App\Models\Cv;
use App\Models\JobDescription;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GenerateCoverLetterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $userId = $this->user()?->id;

        return [
            'cv_id' => [
                'nullable',
                'integer',
                Rule::exists(Cv::class, 'id')->where(fn ($query) => $query->where('user_id', $userId)),
            ],
            'job_description_id' => [
                'nullable',
                'integer',
                Rule::exists(JobDescription::class, 'id')->where(fn ($query) => $query->where('user_id', $userId)),
            ],
            'job_description_text' => ['nullable', 'string'],
            'title' => ['nullable', 'string', 'max:255'],
            'tone' => ['nullable', 'string', 'max:100'],
            'language' => ['nullable', 'string', 'max:10'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if (! $this->filled('job_description_id') && ! $this->filled('job_description_text')) {
                $validator->errors()->add('job_description_text', 'Either job_description_id or job_description_text is required.');
            }
        });
    }
}

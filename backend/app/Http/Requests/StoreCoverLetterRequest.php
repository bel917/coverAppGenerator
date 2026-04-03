<?php

namespace App\Http\Requests;

use App\Models\Cv;
use App\Models\JobDescription;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCoverLetterRequest extends FormRequest
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
            'title' => ['required', 'string', 'max:255'],
            'content' => ['nullable', 'string'],
            'tone' => ['nullable', 'string', 'max:100'],
            'language' => ['nullable', 'string', 'max:10'],
            'status' => ['nullable', 'string', 'max:50'],
            'generated_by' => ['nullable', 'string', 'max:50'],
        ];
    }
}

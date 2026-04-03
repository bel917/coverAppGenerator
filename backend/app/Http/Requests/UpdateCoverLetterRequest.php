<?php

namespace App\Http\Requests;

use App\Models\Cv;
use App\Models\JobDescription;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCoverLetterRequest extends FormRequest
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
                'sometimes',
                'nullable',
                'integer',
                Rule::exists(Cv::class, 'id')->where(fn ($query) => $query->where('user_id', $userId)),
            ],
            'job_description_id' => [
                'sometimes',
                'nullable',
                'integer',
                Rule::exists(JobDescription::class, 'id')->where(fn ($query) => $query->where('user_id', $userId)),
            ],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'content' => ['sometimes', 'nullable', 'string'],
            'tone' => ['sometimes', 'nullable', 'string', 'max:100'],
            'language' => ['sometimes', 'nullable', 'string', 'max:10'],
            'status' => ['sometimes', 'nullable', 'string', 'max:50'],
            'generated_by' => ['sometimes', 'nullable', 'string', 'max:50'],
        ];
    }
}

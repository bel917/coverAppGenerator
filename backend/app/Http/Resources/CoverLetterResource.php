<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CoverLetterResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'cv_id' => $this->cv_id,
            'job_description_id' => $this->job_description_id,
            'title' => $this->title,
            'content' => $this->content,
            'tone' => $this->tone,
            'language' => $this->language,
            'status' => $this->status,
            'generated_by' => $this->generated_by,
            'cv' => new CvResource($this->whenLoaded('cv')),
            'job_description' => new JobDescriptionResource($this->whenLoaded('jobDescription')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,
        ];
    }
}

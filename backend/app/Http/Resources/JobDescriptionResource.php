<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JobDescriptionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'title' => $this->title,
            'company_name' => $this->company_name,
            'job_post_url' => $this->job_post_url,
            'job_description_text' => $this->job_description_text,
            'requirements_text' => $this->requirements_text,
            'location' => $this->location,
            'employment_type' => $this->employment_type,
            'source' => $this->source,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,
        ];
    }
}

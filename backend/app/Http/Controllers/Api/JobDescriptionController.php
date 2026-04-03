<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreJobDescriptionRequest;
use App\Http\Requests\UpdateJobDescriptionRequest;
use App\Http\Resources\JobDescriptionResource;
use App\Models\JobDescription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class JobDescriptionController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $jobDescriptions = $request->user()
            ->jobDescriptions()
            ->latest()
            ->get();

        return $this->success(JobDescriptionResource::collection($jobDescriptions), 'Job descriptions retrieved.');
    }

    public function store(StoreJobDescriptionRequest $request): JsonResponse
    {
        $jobDescription = $request->user()->jobDescriptions()->create($request->validated());

        return $this->success(new JobDescriptionResource($jobDescription), 'Job description created successfully.', Response::HTTP_CREATED);
    }

    public function show(Request $request, string $jobDescription): JsonResponse
    {
        $jobDescription = $this->findOwnedJobDescription($request, $jobDescription);

        return $this->success(new JobDescriptionResource($jobDescription), 'Job description retrieved.');
    }

    public function update(UpdateJobDescriptionRequest $request, string $jobDescription): JsonResponse
    {
        $jobDescription = $this->findOwnedJobDescription($request, $jobDescription);
        $jobDescription->update($request->validated());

        return $this->success(new JobDescriptionResource($jobDescription->fresh()), 'Job description updated successfully.');
    }

    public function destroy(Request $request, string $jobDescription): JsonResponse
    {
        $jobDescription = $this->findOwnedJobDescription($request, $jobDescription);
        $jobDescription->delete();

        return $this->success(null, 'Job description deleted successfully.');
    }

    protected function findOwnedJobDescription(Request $request, string $jobDescription): JobDescription
    {
        return $request->user()->jobDescriptions()->findOrFail($jobDescription);
    }
}

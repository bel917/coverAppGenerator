<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\GenerateCoverLetterRequest;
use App\Http\Requests\StoreCoverLetterRequest;
use App\Http\Requests\UpdateCoverLetterRequest;
use App\Http\Resources\CoverLetterResource;
use App\Models\CoverLetter;
use App\Services\CoverLetterGenerationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CoverLetterController extends ApiController
{
    public function __construct(
        protected CoverLetterGenerationService $generationService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $coverLetters = $request->user()
            ->coverLetters()
            ->with(['cv', 'jobDescription'])
            ->latest()
            ->get();

        return $this->success(CoverLetterResource::collection($coverLetters), 'Cover letters retrieved.');
    }

    public function store(StoreCoverLetterRequest $request): JsonResponse
    {
        $coverLetter = $request->user()->coverLetters()->create($request->validated());
        $coverLetter->load(['cv', 'jobDescription']);

        return $this->success(new CoverLetterResource($coverLetter), 'Cover letter created successfully.', Response::HTTP_CREATED);
    }

    public function show(Request $request, string $coverLetter): JsonResponse
    {
        $coverLetter = $this->findOwnedCoverLetter($request, $coverLetter);

        return $this->success(new CoverLetterResource($coverLetter), 'Cover letter retrieved.');
    }

    public function update(UpdateCoverLetterRequest $request, string $coverLetter): JsonResponse
    {
        $coverLetter = $this->findOwnedCoverLetter($request, $coverLetter);
        $coverLetter->update($request->validated());

        return $this->success(new CoverLetterResource($coverLetter->fresh(['cv', 'jobDescription'])), 'Cover letter updated successfully.');
    }

    public function destroy(Request $request, string $coverLetter): JsonResponse
    {
        $coverLetter = $this->findOwnedCoverLetter($request, $coverLetter);
        $coverLetter->delete();

        return $this->success(null, 'Cover letter deleted successfully.');
    }

    public function generate(GenerateCoverLetterRequest $request): JsonResponse
    {
        $coverLetter = $this->generationService->generateForUser($request->user(), $request->validated());
        $coverLetter->load(['cv', 'jobDescription']);

        return $this->success(new CoverLetterResource($coverLetter), 'Cover letter generated successfully.', Response::HTTP_CREATED);
    }

    protected function findOwnedCoverLetter(Request $request, string $coverLetter): CoverLetter
    {
        return $request->user()
            ->coverLetters()
            ->with(['cv', 'jobDescription'])
            ->findOrFail($coverLetter);
    }
}

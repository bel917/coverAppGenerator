<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreCvRequest;
use App\Http\Resources\CvResource;
use App\Models\Cv;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class CvController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $cvs = $request->user()
            ->cvs()
            ->latest()
            ->get();

        return $this->success(CvResource::collection($cvs), 'CVs retrieved.');
    }

    public function store(StoreCvRequest $request): JsonResponse
    {
        $file = $request->file('file');
        $path = $file->store('cvs', 'public');

        if ($request->boolean('is_default')) {
            $request->user()->cvs()->update(['is_default' => false]);
        }

        $cv = $request->user()->cvs()->create([
            'title' => $request->string('title')->toString(),
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_mime_type' => $file->getClientMimeType(),
            'file_size' => $file->getSize(),
            'extracted_text' => null,
            'parsed_data_json' => null,
            'is_default' => $request->boolean('is_default'),
        ]);

        return $this->success(new CvResource($cv), 'CV created successfully.', Response::HTTP_CREATED);
    }

    public function show(Request $request, string $cv): JsonResponse
    {
        $cv = $this->findOwnedCv($request, $cv);

        return $this->success(new CvResource($cv), 'CV retrieved.');
    }

    public function destroy(Request $request, string $cv): JsonResponse
    {
        $cv = $this->findOwnedCv($request, $cv);

        if ($cv->file_path && Storage::disk('public')->exists($cv->file_path)) {
            Storage::disk('public')->delete($cv->file_path);
        }

        $cv->delete();

        return $this->success(null, 'CV deleted successfully.');
    }

    protected function findOwnedCv(Request $request, string $cv): Cv
    {
        return $request->user()->cvs()->findOrFail($cv);
    }
}

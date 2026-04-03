<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CoverLetterController;
use App\Http\Controllers\Api\CvController;
use App\Http\Controllers\Api\JobDescriptionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'app' => config('app.name'),
    ]);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/cvs', [CvController::class, 'index']);
    Route::post('/cvs', [CvController::class, 'store']);
    Route::get('/cvs/{cv}', [CvController::class, 'show']);
    Route::delete('/cvs/{cv}', [CvController::class, 'destroy']);

    Route::get('/job-descriptions', [JobDescriptionController::class, 'index']);
    Route::post('/job-descriptions', [JobDescriptionController::class, 'store']);
    Route::get('/job-descriptions/{jobDescription}', [JobDescriptionController::class, 'show']);
    Route::put('/job-descriptions/{jobDescription}', [JobDescriptionController::class, 'update']);
    Route::delete('/job-descriptions/{jobDescription}', [JobDescriptionController::class, 'destroy']);

    Route::post('/cover-letters/generate', [CoverLetterController::class, 'generate']);
    Route::get('/cover-letters', [CoverLetterController::class, 'index']);
    Route::post('/cover-letters', [CoverLetterController::class, 'store']);
    Route::get('/cover-letters/{coverLetter}', [CoverLetterController::class, 'show']);
    Route::put('/cover-letters/{coverLetter}', [CoverLetterController::class, 'update']);
    Route::delete('/cover-letters/{coverLetter}', [CoverLetterController::class, 'destroy']);
});

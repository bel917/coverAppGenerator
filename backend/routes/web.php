<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return response()->view('app-status', [
        'title' => 'Backend App',
        'frontendUrl' => env('FRONTEND_URL', 'http://localhost:5173'),
        'apiUrl' => url('/api'),
        'note' => 'This Laravel app is the backend API. Open the frontend URL for the actual web interface.',
    ]);
});

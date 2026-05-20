<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ContactController;
 use App\Http\Controllers\TaskController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
    })->middleware(['auth', 'verified'])->name('dashboard');

    Route::middleware('auth')->group(function () {
        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

        Route::prefix('contacts')->name('contacts.')->group(function () {
        Route::get('/',              [ContactController::class, 'index'])->name('index');
        Route::get('/create',        [ContactController::class, 'create'])->name('create');
        Route::post('/',             [ContactController::class, 'store'])->name('store');
        Route::get('/{contact}/edit',[ContactController::class, 'edit'])->name('edit');
        Route::put('/{contact}',     [ContactController::class, 'update'])->name('update');
        Route::delete('/{contact}',  [ContactController::class, 'destroy'])->name('destroy');
    
        // Bulk delete — POST so we can send a body with an array of IDs
        Route::post('/bulk-destroy', [ContactController::class, 'bulkDestroy'])->name('bulk-destroy');

        Route::prefix('tasks')->name('tasks.')->group(function () {
            Route::get('/',              [TaskController::class, 'index'])->name('index');
            Route::post('/',             [TaskController::class, 'store'])->name('store');
            Route::put('/{task}',        [TaskController::class, 'update'])->name('update');
            Route::delete('/{task}',     [TaskController::class, 'destroy'])->name('destroy');
        
            // Attachment management
            Route::delete('/attachments/{attachment}', [TaskController::class, 'destroyAttachment'])
                ->name('attachments.destroy');
        });
    });
});

require __DIR__.'/auth.php';

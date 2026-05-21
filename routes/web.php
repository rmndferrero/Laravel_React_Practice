<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\ConnectionController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\ConversationController;
use Illuminate\Support\Facades\Auth;


Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
        $userId = Auth::id();
        // 1. Task Statistics
        $taskBase = \App\Models\Task::where('user_id', $userId);
        $taskStats = [
            'total'       => (clone $taskBase)->count(),
            'pending'     => (clone $taskBase)->where('status', 'pending')->count(),
            'in_progress' => (clone $taskBase)->where('status', 'in_progress')->count(),
            'completed'   => (clone $taskBase)->where('status', 'completed')->count(),
            'overdue'     => (clone $taskBase)
                ->whereNotIn('status', ['completed', 'cancelled'])
                ->whereNotNull('due_at')
                ->where('due_at', '<', now())
                ->count(),
        ];

        // 2. Contact Statistics
        $contactStats = [
            'total' => \App\Models\Contact::where('user_id', $userId)->count(),
        ];

        // 3. Upcoming Tasks (Next 5 active tasks ordered by deadline)
        $upcomingTasks = \App\Models\Task::where('user_id', $userId)
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->orderByRaw('due_at IS NULL ASC') // Put null deadlines at the bottom
            ->orderBy('due_at', 'asc')
            ->take(5)
            ->get()
            ->map(fn ($task) => [
                'id'             => $task->id,
                'name'           => $task->name,
                'status_label'   => $task->status_label,
                'priority_label' => $task->priority_label,
                'priority_color' => $task->priority_color,
                'due_at_human'   => $task->due_at ? $task->due_at->format('M j, Y') : null,
                'is_overdue'     => $task->is_overdue,
            ]);
        $recentContacts = \App\Models\Contact::where('user_id', $userId)
        ->orderBy('created_at', 'desc')
        ->take(5)
        ->get()
        ->map(fn ($contact) => [
            'id'        => $contact->id,
            'full_name' => $contact->full_name,
            'company'   => $contact->company,
            'email'     => $contact->email,
        ]);
        return Inertia::render('Dashboard', [
            'taskStats' => $taskStats,
            'contactStats' => $contactStats,
            'upcomingTasks' => $upcomingTasks,
            'recentContacts' => $recentContacts,
        ]);
    })->middleware(['auth', 'verified'])->name('dashboard');

    Route::middleware('auth')->group(function () {
        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

        Route::prefix('contacts')->name('contacts.')->group(function () {
            Route::get('/',              [ContactController::class, 'index'])->name('index');
            Route::get('/create',        [ContactController::class, 'create'])->name('create');
            Route::post('/',             [ContactController::class, 'store'])->name('store');
            
            // Bulk delete — POST so we can send a body with an array of IDs
            // Define before dynamic {contact} routes to avoid route conflicts
            Route::post('/bulk-destroy', [ContactController::class, 'bulkDestroy'])->name('bulk-destroy');
            
            Route::get('/{contact}/edit',[ContactController::class, 'edit'])->name('edit');
            Route::put('/{contact}',     [ContactController::class, 'update'])->name('update');
            Route::delete('/{contact}',  [ContactController::class, 'destroy'])->name('destroy');
        });

        Route::prefix('tasks')->name('tasks.')->group(function () {
            Route::get('/',              [TaskController::class, 'index'])->name('index');
            Route::post('/',             [TaskController::class, 'store'])->name('store');
            Route::put('/{task}',        [TaskController::class, 'update'])->name('update');
            Route::delete('/{task}',     [TaskController::class, 'destroy'])->name('destroy');
        
            // Attachment management
            Route::delete('/attachments/{attachment}', [TaskController::class, 'destroyAttachment'])
                ->name('attachments.destroy');
        });

            Route::prefix('connections')->name('connections.')->group(function () {
            Route::get('/', [ConnectionController::class, 'index'])->name('index');
            Route::post('/', [ConnectionController::class, 'store'])->name('store');
            Route::put('/{connection}', [ConnectionController::class, 'update'])->name('update');
            Route::delete('/{connection}', [ConnectionController::class, 'destroy'])->name('destroy');
        });

        // --- GROUPS ---
        Route::prefix('groups')->name('groups.')->group(function () {
            Route::get('/', [GroupController::class, 'index'])->name('index');
            Route::post('/', [GroupController::class, 'store'])->name('store');
            Route::get('/{group}', [GroupController::class, 'show'])->name('show');
            Route::delete('/{group}', [GroupController::class, 'destroy'])->name('destroy');
            
            // Group Members Management
            Route::post('/{group}/members', [GroupController::class, 'addMember'])->name('members.add');
            Route::delete('/{group}/members/{user}', [GroupController::class, 'removeMember'])->name('members.remove');
        });

        // --- CHAT & CONVERSATIONS ---
        Route::prefix('conversations')->name('conversations.')->group(function () {
            Route::post('/direct/{user}', [ConversationController::class, 'startDirect'])->name('direct');
            Route::post('/group/{group}', [ConversationController::class, 'startGroup'])->name('group');
            
            Route::get('/{conversation}', [ConversationController::class, 'show'])->name('show');
            Route::post('/{conversation}/messages', [ConversationController::class, 'store'])->name('messages.store');
        });
    });

require __DIR__.'/auth.php';

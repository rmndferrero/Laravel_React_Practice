<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskAttachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class TaskController extends Controller
{
    // Max file size in KB (10 MB)
    const MAX_FILE_KB = 10240;

    // Allowed mime types
    const ALLOWED_MIMES = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain', 'text/csv',
        'application/zip',
    ];

    // ── Index ─────────────────────────────────────────────────────────────────

    public function index(Request $request)
    {
        $query = Task::forUser(Auth::id())
            ->with(['attachments'])
            ->search($request->input('search'))
            ->filterByStatus($request->input('status'))
            ->filterByPriority($request->input('priority'));

        // Sorting
        $sortField     = $request->input('sort', 'created_at');
        $sortDirection = $request->input('direction', 'desc');
        $allowedSorts  = ['name', 'status', 'priority', 'due_at', 'created_at'];

        if (in_array($sortField, $allowedSorts)) {
            // NULL due_at should always go last
            if ($sortField === 'due_at') {
                $query->orderByRaw("due_at IS NULL ASC")->orderBy('due_at', $sortDirection);
            } else {
                $query->orderBy($sortField, $sortDirection === 'desc' ? 'desc' : 'asc');
            }
        }

        $tasks = $query
            ->paginate($request->input('per_page', 20))
            ->withQueryString()
            ->through(fn ($t) => $this->formatTask($t));

        // Stats for the summary bar
        $stats = $this->getStats(Auth::id());

        return Inertia::render('Tasks/Index', [
            'tasks'   => $tasks,
            'stats'   => $stats,
            'filters' => $request->only(['search', 'status', 'priority', 'sort', 'direction']),
            'statuses'   => Task::STATUSES,
            'priorities' => Task::PRIORITIES,
        ]);
    }

    // ── Store ─────────────────────────────────────────────────────────────────

    public function store(Request $request)
    {
        $data = $this->validateTask($request);
        $data['user_id'] = Auth::id();

        $task = Task::create($data);

        // Handle file attachments
        if ($request->hasFile('attachments')) {
            $this->storeAttachments($task, $request->file('attachments'));
        }

        return redirect()->route('tasks.index')
            ->with('success', 'Task created.');
    }

    // ── Update ────────────────────────────────────────────────────────────────

    public function update(Request $request, Task $task)
    {
        $this->authorizeTask($task);

        $data = $this->validateTask($request, $task->id);
        $task->update($data);

        // New attachments added during edit
        if ($request->hasFile('attachments')) {
            $this->storeAttachments($task, $request->file('attachments'));
        }

        return redirect()->route('tasks.index')
            ->with('success', 'Task updated.');
    }

    // ── Destroy ───────────────────────────────────────────────────────────────

    public function destroy(Task $task)
    {
        $this->authorizeTask($task);

        // Delete all physical attachment files
        foreach ($task->attachments as $attachment) {
            Storage::disk($attachment->disk)->delete($attachment->stored_path);
        }

        $task->delete();

        return redirect()->route('tasks.index')
            ->with('success', 'Task deleted.');
    }

    // ── Delete a single attachment ────────────────────────────────────────────

    public function destroyAttachment(TaskAttachment $attachment)
    {
        // Ensure the attachment belongs to the authenticated user's task
        if ($attachment->task->user_id !== Auth::id()) {
            abort(403);
        }

        Storage::disk($attachment->disk)->delete($attachment->stored_path);
        $attachment->delete();

        return back()->with('success', 'Attachment removed.');
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function validateTask(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'name'          => ['required', 'string', 'max:100'],
            'description'   => ['nullable', 'string', 'max:5000'],
            'status'        => ['required', 'string', 'in:' . implode(',', array_keys(Task::STATUSES))],
            'status_custom' => ['nullable', 'string', 'max:20', 'required_if:status,other'],
            'priority'      => ['required', 'string', 'in:' . implode(',', array_keys(Task::PRIORITIES))],
            'due_at'        => ['nullable', 'date'],
            'tags'          => ['nullable', 'string', 'max:500'],
            'contact_id'    => ['nullable', 'integer', 'exists:contacts,id'],
            'attachments'   => ['nullable', 'array', 'max:10'],
            'attachments.*' => [
                'file',
                'max:' . self::MAX_FILE_KB,
                'mimes:jpg,jpeg,png,gif,webp,pdf,doc,docx,xls,xlsx,txt,csv,zip',
            ],
        ], [
            'status_custom.required_if' => 'Please describe the custom status.',
            'attachments.max'           => 'You may attach up to 10 files per task.',
            'attachments.*.max'         => 'Each file must be under 10 MB.',
        ]);
    }

    private function storeAttachments(Task $task, array $files): void
    {
        foreach ($files as $file) {
            // Store with a UUID filename to avoid collisions, keep extension
            $extension  = $file->getClientOriginalExtension();
            $storedPath = 'files_uploaded/' . Str::uuid() . '.' . $extension;

            Storage::disk('public')->put($storedPath, file_get_contents($file));

            TaskAttachment::create([
                'task_id'       => $task->id,
                'user_id'       => Auth::id(),
                'original_name' => $file->getClientOriginalName(),
                'stored_path'   => $storedPath,
                'mime_type'     => $file->getMimeType(),
                'size_bytes'    => $file->getSize(),
                'disk'          => 'public',
            ]);
        }
    }

    private function formatTask(Task $task): array
    {
        return [
            'id'             => $task->id,
            'name'           => $task->name,
            'description'    => $task->description,
            'status'         => $task->status,
            'status_label'   => $task->status_label,
            'status_custom'  => $task->status_custom,
            'priority'       => $task->priority,
            'priority_label' => $task->priority_label,
            'priority_color' => $task->priority_color,
            'due_at'         => $task->due_at?->toIso8601String(),
            'due_at_human'   => $task->due_at?->format('M j, Y · g:i A'),
            'is_overdue'     => $task->is_overdue,
            'tags'           => $task->tags,
            'tags_array'     => $task->tags_array,
            'contact_id'     => $task->contact_id,
            'created_at'     => $task->created_at->toDateString(),
            'attachments'    => $task->attachments->map(fn ($a) => [
                'id'             => $a->id,
                'original_name'  => $a->original_name,
                'url'            => $a->url,
                'mime_type'      => $a->mime_type,
                'formatted_size' => $a->formatted_size,
                'type_icon'      => $a->type_icon,
            ])->toArray(),
        ];
    }

    private function getStats(int $userId): array
    {
        $base = Task::forUser($userId);

        return [
            'total'       => (clone $base)->count(),
            'pending'     => (clone $base)->where('status', 'pending')->count(),
            'in_progress' => (clone $base)->where('status', 'in_progress')->count(),
            'completed'   => (clone $base)->where('status', 'completed')->count(),
            'overdue'     => (clone $base)
                ->whereNotIn('status', ['completed', 'cancelled'])
                ->whereNotNull('due_at')
                ->where('due_at', '<', now())
                ->count(),
        ];
    }

    private function authorizeTask(Task $task): void
    {
        if ($task->user_id !== Auth::id()) {
            abort(403);
        }
    }
}
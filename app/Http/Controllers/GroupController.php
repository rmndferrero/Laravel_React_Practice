<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\User;
use App\Models\Connection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Task;

class GroupController extends Controller
{
    // List all groups the user owns or belongs to
    public function index()
    {
        $userId = Auth::id();

        $groups = Group::withCount('members')
            ->where('admin_id', $userId)
            ->orWhereHas('members', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->latest()
            ->get();

        return Inertia::render('Groups/Index', [
            'groups' => $groups
        ]);
    }

    // Create a new group
    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255']);

        $group = Group::create([
            'name' => $request->name,
            'admin_id' => Auth::id(),
        ]);

        // Automatically add the creator as a member in the pivot table
        $group->members()->attach(Auth::id());

        return redirect()->route('groups.show', $group->id)->with('success', 'Group created successfully!');
    }

    // View a specific group (Dashboard for the group)
    public function show(Group $group)
    {
        $user = Auth::user();

        // 1. Authorization: Ensure user is admin or a member
        $isMember = $group->members()->where('user_id', $user->id)->exists();
        if ($group->admin_id !== $user->id && !$isMember) {
            abort(403, 'You do not have permission to view this group.');
        }

        $group->load('admin', 'members');

        // 2. Fetch Active Connections to invite (Exclude those already in the group)
        $activeConnectionIds = Connection::where('status', 'accepted')
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)->orWhere('connected_user_id', $user->id);
            })
            ->get()
            ->map(fn ($c) => $c->user_id === $user->id ? $c->connected_user_id : $c->user_id);

        $memberIds = $group->members->pluck('id');
        
        $availableConnections = User::whereIn('id', $activeConnectionIds)
            ->whereNotIn('id', $memberIds)
            ->get(['id', 'name', 'email']);

        // 3. Load group tasks (We will use this in Part B!)
        $tasks = $group->tasks()->with('assignee')->latest()->get()->map(fn ($task) => [
            'id' => $task->id,
            'name' => $task->name,
            'status_label' => $task->status_label,
            'priority_label' => $task->priority_label,
            'priority_color' => $task->priority_color,
            'due_at_human' => $task->due_at ? $task->due_at->format('M j, Y') : null,
            'assignee_name' => $task->assignee ? $task->assignee->name : 'Unassigned',
        ]);

        return Inertia::render('Groups/Show', [
            'group' => $group,
            'availableConnections' => $availableConnections,
            'tasks' => $tasks,
            'isAdmin' => $group->admin_id === $user->id,
            'statuses' => Task::STATUSES,     // <-- Added
            'priorities' => Task::PRIORITIES, // <-- Added
        ]);
    }

    // Add a connection to the group
    public function addMember(Request $request, Group $group)
    {
        if ($group->admin_id !== Auth::id()) abort(403);
        $request->validate(['user_id' => 'required|exists:users,id']);

        $group->members()->syncWithoutDetaching([$request->user_id]);

        return back()->with('success', 'Member added to the group!');
    }

    // Remove a member or leave group
    public function removeMember(Group $group, User $user)
    {
        // Only the admin can remove others, OR a user can remove themselves (leave)
        if ($group->admin_id !== Auth::id() && Auth::id() !== $user->id) abort(403);
        
        // Prevent admin from removing themselves this way (they should delete the group)
        if ($group->admin_id === $user->id) abort(400, 'Admin cannot leave the group. Delete it instead.');

        $group->members()->detach($user->id);

        if (Auth::id() === $user->id) {
            return redirect()->route('groups.index')->with('success', 'You left the group.');
        }

        return back()->with('success', 'Member removed.');
    }

    // Delete the group entirely
    public function destroy(Group $group)
    {
        if ($group->admin_id !== Auth::id()) abort(403);
        
        $group->delete();
        return redirect()->route('groups.index')->with('success', 'Group deleted.');
    }
}
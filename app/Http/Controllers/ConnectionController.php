<?php

namespace App\Http\Controllers;

use App\Models\Connection;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ConnectionController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        // 1. Get Pending Requests (where the current user is the receiver)
        $pendingRequests = Connection::with('sender')
            ->where('connected_user_id', $user->id)
            ->where('status', 'pending')
            ->get();

        // 2. Get Active Connections (user could be sender OR receiver)
        $activeConnections = Connection::with(['sender', 'receiver'])
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                      ->orWhere('connected_user_id', $user->id);
            })
            ->where('status', 'accepted')
            ->get()
            ->map(function ($connection) use ($user) {
                // Return the *other* person's profile
                return $connection->user_id === $user->id 
                    ? $connection->receiver 
                    : $connection->sender;
            });

        // 3. Handle User Search (exclude self and existing connections)
        $searchResults = [];
        if ($request->filled('search')) {
            $existingIds = Connection::where('user_id', $user->id)
                ->orWhere('connected_user_id', $user->id)
                ->pluck('user_id')
                ->merge(Connection::where('user_id', $user->id)->orWhere('connected_user_id', $user->id)->pluck('connected_user_id'))
                ->unique();

            $searchResults = User::where('name', 'like', '%' . $request->search . '%')
                ->where('email', 'like', '%' . $request->search . '%', 'or')
                ->where('id', '!=', $user->id)
                ->whereNotIn('id', $existingIds)
                ->take(10)
                ->get();
        }

        return Inertia::render('Connections/Index', [
            'pendingRequests'   => $pendingRequests,
            'activeConnections' => $activeConnections,
            'searchResults'     => $searchResults,
            'filters'           => $request->only('search'),
        ]);
    }

    // Send a friend request
    public function store(Request $request)
    {
        $request->validate(['connected_user_id' => 'required|exists:users,id']);

        Connection::firstOrCreate([
            'user_id' => Auth::id(),
            'connected_user_id' => $request->connected_user_id,
        ]);

        return back()->with('success', 'Connection request sent!');
    }

    // Accept a friend request
    public function update(Connection $connection)
    {
        // Ensure the logged-in user is the one receiving the request
        if ($connection->connected_user_id !== Auth::id()) abort(403);

        $connection->update(['status' => 'accepted']);

        return back()->with('success', 'Connection accepted!');
    }

    // Reject or Remove a connection
    public function destroy(Connection $connection)
    {
        // Ensure the user is part of this connection before deleting
        if ($connection->user_id !== Auth::id() && $connection->connected_user_id !== Auth::id()) {
            abort(403);
        }

        $connection->delete();

        return back()->with('success', 'Connection removed.');
    }
}
<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use App\Events\MessageSent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ConversationController extends Controller
{
    // Load the Chat UI and message history
    public function show(Conversation $conversation)
    {
        $user = Auth::user();

        // Security: Ensure user belongs in this chat
        $isAuthorized = $conversation->is_group 
            ? $conversation->group->members()->where('user_id', $user->id)->exists()
            : $conversation->participants()->where('user_id', $user->id)->exists();

        if (!$isAuthorized) abort(403);

        $conversation->load(['group', 'participants']);
        
        $messages = $conversation->messages()->with('sender:id,name')->get();

        // Figure out the chat name
        if ($conversation->is_group) {
            $chatName = $conversation->group->name;
        } else {
            $otherPerson = $conversation->participants->where('id', '!=', $user->id)->first();
            $chatName = $otherPerson ? $otherPerson->name : 'Unknown User';
        }

        return Inertia::render('Conversations/Show', [
            'conversation' => $conversation,
            'messages'     => $messages,
            'chatName'     => $chatName,
        ]);
    }

    // Save a message and broadcast it
    public function store(Request $request, Conversation $conversation)
    {
        $request->validate(['body' => 'required|string|max:1000']);

        $message = $conversation->messages()->create([
            'user_id' => Auth::id(),
            'body'    => $request->body,
        ]);

        // Broadcast to Reverb!
        broadcast(new MessageSent($message));

        return response()->json($message->load('sender:id,name'));
    }

    public function startDirect(\App\Models\User $user)
    {
        $authId = Auth::id();

        // Find existing direct chat between these two users
        $conversation = Conversation::where('is_group', false)
            ->whereHas('participants', fn($q) => $q->where('user_id', $authId))
            ->whereHas('participants', fn($q) => $q->where('user_id', $user->id))
            ->first();

        // Create one if it doesn't exist
        if (!$conversation) {
            $conversation = Conversation::create(['is_group' => false]);
            $conversation->participants()->attach([$authId, $user->id]);
        }

        return redirect()->route('conversations.show', $conversation->id);
    }

    // Start or enter a Group chat
    public function startGroup(\App\Models\Group $group)
    {
        // Only members can access the group chat
        if ($group->admin_id !== Auth::id() && !$group->members()->where('user_id', Auth::id())->exists()) {
            abort(403);
        }

        $conversation = Conversation::firstOrCreate([
            'is_group' => true,
            'group_id' => $group->id,
        ]);

        return redirect()->route('conversations.show', $conversation->id);
    }
}
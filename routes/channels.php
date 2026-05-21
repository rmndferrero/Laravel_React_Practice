<?php

use App\Models\Conversation;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('chat.{conversationId}', function ($user, $conversationId) {
    $conversation = Conversation::find($conversationId);
    
    if (!$conversation) return false;

    // If it's a group chat, check if they are in the group
    if ($conversation->is_group) {
        return $conversation->group->members()->where('user_id', $user->id)->exists();
    }

    // If it's a 1-on-1, check if they are one of the participants
    return $conversation->participants()->where('user_id', $user->id)->exists();
});
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Task extends Model
{
    use HasFactory, SoftDeletes;

    // ── Constants ─────────────────────────────────────────────────────────────

    const STATUSES = [
        'pending'     => 'Pending',
        'in_progress' => 'In Progress',
        'completed'   => 'Completed',
        'cancelled'   => 'Cancelled',
        'other'       => 'Other',
    ];

    const PRIORITIES = [
        'low'    => 'Low',
        'medium' => 'Medium',
        'high'   => 'High',
        'urgent' => 'Urgent',
    ];

    // Priority colors for frontend use (returned in formatTask)
    const PRIORITY_COLORS = [
        'low'    => '#6B7280', // muted gray
        'medium' => '#3B82F6', // blue
        'high'   => '#F59E0B', // amber
        'urgent' => '#FF0000', // signal red — matches design system primary
    ];

    // ── Fillable ──────────────────────────────────────────────────────────────

    protected $fillable = [
        'user_id',
        'team_id',
        'contact_id',
        'name',
        'description',
        'status',
        'status_custom',
        'priority',
        'due_at',
        'tags',
        'group_id',    // <-- ADD THIS
        'assigned_to'
    ];

    protected $casts = [
        'due_at' => 'datetime',
    ];

    // ── Relationships ─────────────────────────────────────────────────────────

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function contact()
    {
        return $this->belongsTo(Contact::class)->withTrashed(); // keep link even if contact soft-deleted
    }

    public function attachments()
    {
        return $this->hasMany(TaskAttachment::class);
    }

    // ── Accessors ─────────────────────────────────────────────────────────────

    public function getTagsArrayAttribute(): array
    {
        if (!$this->tags) return [];
        return array_filter(array_map('trim', explode(',', $this->tags)));
    }

    public function getStatusLabelAttribute(): string
    {
        if ($this->status === 'other' && $this->status_custom) {
            return $this->status_custom;
        }
        return self::STATUSES[$this->status] ?? $this->status;
    }

    public function getPriorityLabelAttribute(): string
    {
        return self::PRIORITIES[$this->priority] ?? $this->priority;
    }

    public function getPriorityColorAttribute(): string
    {
        return self::PRIORITY_COLORS[$this->priority] ?? '#6B7280';
    }

    public function getIsOverdueAttribute(): bool
    {
        if (!$this->due_at) return false;
        if (in_array($this->status, ['completed', 'cancelled'])) return false;
        return $this->due_at->isPast();
    }

    // ── Scopes ────────────────────────────────────────────────────────────────

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeSearch($query, ?string $search)
    {
        if (!$search) return $query;
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%")
              ->orWhere('tags', 'like', "%{$search}%");
        });
    }

    public function scopeFilterByStatus($query, ?string $status)
    {
        if (!$status) return $query;
        return $query->where('status', $status);
    }

    public function scopeFilterByPriority($query, ?string $priority)
    {
        if (!$priority) return $query;
        return $query->where('priority', $priority);
    }

    public function group()
    {
        return $this->belongsTo(Group::class);
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}
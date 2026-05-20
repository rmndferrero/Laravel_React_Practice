<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class TaskAttachment extends Model
{
    protected $fillable = [
        'task_id',
        'user_id',
        'original_name',
        'stored_path',
        'mime_type',
        'size_bytes',
        'disk',
    ];

    // ── Relationships ─────────────────────────────────────────────────────────

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // ── Accessors ─────────────────────────────────────────────────────────────

    public function getUrlAttribute(): string
    {
        if (!$this->stored_path) {
            return '';
        }

        // Fallback to 'public' if the disk isn't set in older database records
        $diskName = $this->disk ?? 'public';

        /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
        $disk = Storage::disk($diskName);

        return $disk->url($this->stored_path);
    }

    public function getFormattedSizeAttribute(): string
    {
        $bytes = $this->size_bytes;
        if ($bytes < 1024)       return $bytes . ' B';
        if ($bytes < 1048576)    return round($bytes / 1024, 1) . ' KB';
        return round($bytes / 1048576, 1) . ' MB';
    }

    // Derive a human-readable type label from mime
    public function getTypeIconAttribute(): string
    {
        $mime = $this->mime_type;
        if (str_starts_with($mime, 'image/'))       return 'image';
        if ($mime === 'application/pdf')             return 'pdf';
        if (str_contains($mime, 'word'))             return 'doc';
        if (str_contains($mime, 'spreadsheet') || str_contains($mime, 'excel')) return 'sheet';
        if (str_contains($mime, 'zip') || str_contains($mime, 'rar'))           return 'archive';
        return 'file';
    }
}
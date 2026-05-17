<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Contact extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'company',
        'street',
        'city',
        'state',
        'zip',
        'country',
        'notes',
        'tags',
        'avatar',
    ];

    // ─── Relationships ────────────────────────────────────────────────────────

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // ─── Accessors ────────────────────────────────────────────────────────────

    /**
     * Full name accessor.
     */
    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    /**
     * Returns the avatar URL or null (frontend handles initials fallback).
     */
    public function getAvatarUrlAttribute(): ?string
    {
        return $this->avatar ? Storage::url($this->avatar) : null;
    }

    /**
     * Tags as an array.
     */
    public function getTagsArrayAttribute(): array
    {
        if (!$this->tags) return [];
        return array_filter(array_map('trim', explode(',', $this->tags)));
    }

    // ─── Scopes ───────────────────────────────────────────────────────────────

    public function scopeSearch($query, ?string $search)
    {
        if (!$search) return $query;

        return $query->where(function ($q) use ($search) {
            $q->where('first_name', 'like', "%{$search}%")
              ->orWhere('last_name',  'like', "%{$search}%")
              ->orWhere('email',      'like', "%{$search}%")
              ->orWhere('phone',      'like', "%{$search}%")
              ->orWhere('company',    'like', "%{$search}%");
        });
    }

    public function scopeFilterByCompany($query, ?string $company)
    {
        if (!$company) return $query;
        return $query->where('company', $company);
    }

    public function scopeFilterByCountry($query, ?string $country)
    {
        if (!$country) return $query;
        return $query->where('country', $country);
    }
}
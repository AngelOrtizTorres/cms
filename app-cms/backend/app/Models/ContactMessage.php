<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ContactMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone_number',
        'subject',
        'message',
        'status',
        'reply_message',
        'replied_at',
        'internal_notes',
        'ip_address',
        'user_agent',
        'source_url',
        'privacy_accepted',
    ];

    protected $casts = [
        'privacy_accepted' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'replied_at' => 'datetime',
    ];
}

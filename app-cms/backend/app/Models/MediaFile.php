<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class MediaFile extends Model
{
    use HasFactory;

    protected $table = 'media';
    protected $fillable = [
        'user_id',
        'name',
        'file_name',
        'disk',
        'mime_type',
        'size',
        'width',
        'height',
        'alt_text',
        'title',
        'folder',
    ];

    protected $casts = [
        'size' => 'integer',
        'width' => 'integer',
        'height' => 'integer',
        'created_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

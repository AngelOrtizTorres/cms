<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Banner extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'type',
        'image_url',
        'link_url',
        'code_content',
        'position',
        'display_order',
        'active',
        'starts_at',
        'ends_at',
        'clicks',
        'impressions',
    ];

    protected $casts = [
        'active' => 'boolean',
        'clicks' => 'integer',
        'impressions' => 'integer',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class News extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'news';

    protected $fillable = [
        'site_id',
        'primary_section_id',
        'title',
        'slug',
        'status',
        'published_at',
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];

    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    public function primarySection()
    {
        return $this->belongsTo(Section::class, 'primary_section_id');
    }

    public function sections()
    {
        return $this->belongsToMany(Section::class, 'news_section')
            ->withPivot('position')
            ->orderByPivot('position');
    }
}

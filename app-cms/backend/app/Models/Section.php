<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Section extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'parent_id',
        'name',
        'slug',
        'description',
        'meta_title',
        'meta_description',
        'position',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
        'position' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // Relaciones
    public function parent()
    {
        return $this->belongsTo(Section::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Section::class, 'parent_id');
    }

    public function articles()
    {
        return $this->hasMany(Article::class);
    }

    public function secondaryArticles()
    {
        return $this->belongsToMany(Article::class, 'article_section');
    }
}

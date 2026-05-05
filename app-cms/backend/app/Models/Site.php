<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

final class Site extends Model
{
    protected $table = 'sites';

    protected $fillable = [
        'title',
        'slug',
        'owner_id',
        'domain',
        'description',
        'contact_email',
        'icon',
        'status',
    ];

    public $timestamps = false;

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function editors(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'site_user', 'site_id', 'user_id');
    }
}

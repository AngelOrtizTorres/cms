<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Models\Site;
use Spatie\Permission\Traits\HasRoles;
use Laravel\Sanctum\HasApiTokens;

<<<<<<< HEAD
=======
#[Fillable(['name', 'email', 'password', 'role', 'api_token'])]
#[Hidden(['password', 'remember_token'])]
>>>>>>> main
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name',
        'email',
        'password',
        'active',
        'avatar_url',
        'last_login_at',
    ];

    /**
     * Hidden attributes
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Attribute casting
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
            'active' => 'boolean',
        ];
    }
<<<<<<< HEAD
}
=======

    /**
     * Sites created by the user
     */
    public function sites(): HasMany
    {
        return $this->hasMany(Site::class, 'owner_id');
    }

    /**
     * Sites assigned to the user (editors / collaborators)
     */
    public function assignedSites(): BelongsToMany
    {
        return $this->belongsToMany(Site::class, 'site_user', 'user_id', 'site_id');
    }
}
>>>>>>> main

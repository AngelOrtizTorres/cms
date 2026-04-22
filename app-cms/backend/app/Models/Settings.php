<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Settings extends Model
{
    use HasFactory;

    protected $table = 'settings';
    protected $fillable = [
        'site_name',
        'site_description',
        'logo_url',
        'favicon_url',
        'brand_color',
        'contact_email',
        'phone_number',
        'address',
        'social_links',
        'google_analytics_id',
        'facebook_pixel_id',
        'header_scripts',
        'footer_scripts',
        'maintenance_mode',
    ];

    protected $casts = [
        'social_links' => 'json',
        'maintenance_mode' => 'boolean',
        'updated_at' => 'datetime',
    ];

    public static function get($key)
    {
        $setting = static::find(1);
        return $setting ? $setting->{$key} : null;
    }

    public static function set($key, $value)
    {
        return static::updateOrCreate(
            ['id' => 1],
            [$key => $value]
        );
    }
}

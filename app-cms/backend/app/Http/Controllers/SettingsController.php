<?php

namespace App\Http\Controllers;

use App\Models\Settings;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function show()
    {
        $settings = Settings::find(1);
        if (!$settings) {
            return response()->json([], 200);
        }

        return response()->json($settings);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'site_name' => 'sometimes|string|max:255',
            'site_description' => 'nullable|string|max:160',
            'logo_url' => 'nullable|string|max:2048',
            'favicon_url' => 'nullable|string|max:2048',
            'brand_color' => 'nullable|string|max:7',
            'contact_email' => 'nullable|email|max:255',
            'phone_number' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'social_links' => 'nullable|json',
            'google_analytics_id' => 'nullable|string|max:50',
            'facebook_pixel_id' => 'nullable|string|max:50',
            'header_scripts' => 'nullable|string',
            'footer_scripts' => 'nullable|string',
            'maintenance_mode' => 'nullable|boolean',
        ]);

        $settings = Settings::updateOrCreate(['id' => 1], $validated);

        return response()->json($settings);
    }

    public function homepage()
    {
        $settings = Settings::find(1);
        $homepage = $settings && $settings->homepage_config ? $settings->homepage_config : [
            'featured_articles' => 6,
            'latest_articles' => 10,
            'sections_displayed' => [],
            'banners_enabled' => true,
        ];

        return response()->json($homepage);
    }

    public function updateHomepage(Request $request)
    {
        $validated = $request->validate([
            'featured_articles' => 'nullable|integer|min:0',
            'latest_articles' => 'nullable|integer|min:0',
            'sections_displayed' => 'nullable|array',
            'sections_displayed.*' => 'integer',
            'banners_enabled' => 'nullable|boolean',
        ]);

        $settings = Settings::updateOrCreate(['id' => 1], ['homepage_config' => $validated]);

        return response()->json($settings->homepage_config);
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Settings;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class SettingsController extends Controller
{
    public function index()
    {
        $settings = Settings::find(1);
        if (!$settings) {
            return response()->json([], 200);
        }
        return response()->json($settings);
    }

    public function update(Request $request)
    {
        $token = $request->bearerToken();
        if ($token && !Auth::check()) {
            $tokenUser = User::where('api_token', $token)->first();
            if ($tokenUser) Auth::login($tokenUser);
        }

        if (!Auth::check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validated = $request->only([
            'site_name', 'site_description', 'logo_url', 'favicon_url', 'brand_color',
            'contact_email', 'phone_number', 'address', 'social_links', 'google_analytics_id',
            'facebook_pixel_id', 'header_scripts', 'footer_scripts', 'maintenance_mode'
        ]);

        $settings = Settings::updateOrCreate(['id' => 1], $validated);

        return response()->json($settings);
    }

    public function getHomepage()
    {
        $path = storage_path('app/homepage.json');
        if (!file_exists($path)) {
            return response()->json([
                'featured_articles' => 3,
                'latest_articles' => 10,
                'sections_displayed' => [],
                'banners_enabled' => true,
            ]);
        }

        $content = json_decode(file_get_contents($path), true);
        return response()->json($content ?: []);
    }

    public function updateHomepage(Request $request)
    {
        $token = $request->bearerToken();
        if ($token && !Auth::check()) {
            $tokenUser = User::where('api_token', $token)->first();
            if ($tokenUser) Auth::login($tokenUser);
        }

        if (!Auth::check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $data = $request->only(['featured_articles', 'latest_articles', 'sections_displayed', 'banners_enabled']);
        $path = storage_path('app/homepage.json');
        file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT));

        return response()->json($data);
    }
}

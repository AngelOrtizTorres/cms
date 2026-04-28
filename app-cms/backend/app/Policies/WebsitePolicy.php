<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Website;

class WebsitePolicy
{
    /**
     * Determine whether the user can view the website.
     */
    public function view(User $user, Website $website)
    {
        // Owner or admin can view
        if ($user->id === $website->user_id) return true;
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can open/manage the website panel.
     * Per rules: only the site owner (creator) may access the site's panel.
     */
    public function open(User $user, Website $website)
    {
        return $user->id === $website->user_id;
    }

    /**
     * Determine whether the user can update the website.
     */
    public function update(User $user, Website $website)
    {
        // Only owner can update
        return $user->id === $website->user_id;
    }

    /**
     * Determine whether the user can delete the website.
     */
    public function delete(User $user, Website $website)
    {
        // Owner can delete own sites.
        if ($user->id === $website->user_id) return true;

        // Admin can delete sites they did NOT create (per requested rule).
        if ($user->hasRole('admin') && $user->id !== $website->user_id) return true;

        return false;
    }
}

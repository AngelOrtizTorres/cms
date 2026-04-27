<?php

namespace App\Http\Middleware;

use App\Models\Article;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureArticleUpdatePermission
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if ($user->hasRole('admin') || $user->hasRole('editor')) {
            return $next($request);
        }

        if (!$user->hasRole('author')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $articleId = (int) $request->route('id');
        $article = Article::find($articleId);

        if (!$article) {
            return response()->json(['message' => 'Article not found'], 404);
        }

        if ((int) $article->user_id !== (int) $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return $next($request);
    }
}

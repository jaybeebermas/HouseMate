<?php

namespace App\GraphQL\Queries\Navigation;

use App\Models\Navigation;
use Illuminate\Support\Facades\Auth;

class NavigationQuery
{
    public function navigation(): array
    {
        $user = Auth::user() ?: Auth::guard('sanctum')->user() ?: Auth::guard('web')->user();

        if (! $user) {
            \Illuminate\Support\Facades\Log::warning('Navigation requested without authentication.');

            return [];
        }

        \Illuminate\Support\Facades\Log::info('Navigation requested by User ID: '.$user->id.' (Role: '.$user->role.')');

        $isSuperAdmin = $user->hasRole('super_admin');

        $items = Navigation::query()
            ->orderBy('parent_key')
            ->orderBy('sort_order')
            ->get()
            ->filter(function (Navigation $item) use ($user, $isSuperAdmin) {
                if ($isSuperAdmin || ! $item->permission) {
                    return true;
                }

                return $user->hasPermissionTo($item->permission);
            })
            ->map(fn (Navigation $item) => [
                'id' => $item->key,
                'title' => $item->title,
                'type' => $item->type,
                'icon' => $item->icon,
                'route' => $item->route,
                'permission' => $item->permission,
                'parent' => $item->parent_key,
            ])
            ->all();

        return $this->buildTree($items, null, []);
    }

    /**
     * @param  array<int, array<string, mixed>>  $items
     * @return array<int, array<string, mixed>>
     */
    private function buildTree(array $items, ?string $parentId, array $path): array
    {
        $nodes = [];

        foreach ($items as $item) {
            $currentParent = $item['parent'] ?? null;
            if ($currentParent !== $parentId) {
                continue;
            }

            $id = (string) $item['id'];

            if (in_array($id, $path, true)) {
                $item['children'] = [];
                $nodes[] = $item;
                continue;
            }

            $item['children'] = $this->buildTree($items, $id, [...$path, $id]);
            $nodes[] = $item;
        }

        return $nodes;
    }
}

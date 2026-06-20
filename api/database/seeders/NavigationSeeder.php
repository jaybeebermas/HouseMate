<?php

namespace Database\Seeders;

use App\Models\Navigation;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class NavigationSeeder extends Seeder
{
    /**
     * Seed navigation records from config/navigation/*.php.
     */
    public function run(): void
    {
        if (! Schema::hasTable('navigations')) {
            $this->command?->error('Table "navigations" is missing. Run: php artisan migrate');
            return;
        }

        $navigationTree = config('navigation', []);
        $rows = [];

        $this->flattenNavigation($navigationTree, $rows);

        $keys = [];
        foreach ($rows as $row) {
            $keys[] = $row['key'];
            Navigation::query()->updateOrCreate(
                ['key' => $row['key']],
                $row
            );
        }

        if (! empty($keys)) {
            Navigation::query()->whereNotIn('key', $keys)->delete();
        }
    }

    /**
     * @param  array<int, array<string, mixed>>  $items
     * @param  array<int, array<string, mixed>>  $rows
     */
    private function flattenNavigation(array $items, array &$rows, ?string $parentKey = null): void
    {
        foreach (array_values($items) as $index => $item) {
            $key = (string) ($item['id'] ?? '');
            if ($key === '') {
                continue;
            }

            $rows[] = [
                'key' => $key,
                'title' => (string) ($item['title'] ?? $key),
                'type' => (string) ($item['type'] ?? 'item'),
                'icon' => isset($item['icon']) ? (string) $item['icon'] : null,
                'route' => isset($item['route']) ? (string) $item['route'] : null,
                'permission' => isset($item['permission']) ? (string) $item['permission'] : null,
                'parent_key' => $parentKey,
                'sort_order' => $index,
            ];

            $children = $item['children'] ?? [];
            if (is_array($children) && ! empty($children)) {
                $this->flattenNavigation($children, $rows, $key);
            }
        }
    }
}

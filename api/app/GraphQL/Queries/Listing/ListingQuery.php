<?php

namespace App\GraphQL\Queries\Listing;

use App\Models\Listing;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;

class ListingQuery
{
    /**
     * @param  mixed  $_
     * @param  array{}  $args
     * @return Listing[]
     */
    public function myListings(mixed $_, array $args): array
    {
        // 1. Dynamic database migration checks
        try {
            if (!Schema::hasTable('listings')) {
                Artisan::call('migrate', ['--force' => true]);
            }
        } catch (\Throwable $e) {
            Log::error('Autorun listings migration failed on query: ' . $e->getMessage());
        }

        $user = Auth::user();
        if (!$user instanceof User) {
            return [];
        }

        return Listing::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->all();
    }

    /**
     * @param  mixed  $_
     * @param  array{}  $args
     * @return Listing[]
     */
    public function listings(mixed $_, array $args): array
    {
        try {
            if (!Schema::hasTable('listings')) {
                Artisan::call('migrate', ['--force' => true]);
            }
        } catch (\Throwable $e) {
            Log::error('Autorun listings migration failed on public query: ' . $e->getMessage());
        }

        return Listing::with('user')
            ->orderBy('created_at', 'desc')
            ->get()
            ->all();
    }

    /**
     * @param  mixed  $_
     * @param  array{
     *   search?: string,
     *   category?: string,
     *   min_price?: float,
     *   max_price?: float,
     *   sort_by?: string,
     *   page?: int,
     *   limit?: int
     * }  $args
     * @return array{
     *   data: Listing[],
     *   total: int,
     *   hasMore: bool
     * }
     */
    public function paginatedListings(mixed $_, array $args): array
    {
        try {
            if (!Schema::hasTable('listings')) {
                Artisan::call('migrate', ['--force' => true]);
            }
        } catch (\Throwable $e) {
            Log::error('Autorun listings migration failed on paginated query: ' . $e->getMessage());
        }

        $query = Listing::with('user');

        // Search filter (searches details or address)
        if (!empty($args['search'])) {
            $search = '%' . $args['search'] . '%';
            $query->where(function ($q) use ($search) {
                $q->where('details', 'like', $search)
                  ->orWhere('address', 'like', $search);
            });
        }

        // Category filter
        if (!empty($args['category'])) {
            $query->where('category', $args['category']);
        }

        // Price range filter
        if (isset($args['min_price'])) {
            $query->where('price', '>=', $args['min_price']);
        }
        if (isset($args['max_price'])) {
            $query->where('price', '<=', $args['max_price']);
        }

        // Sorting
        $sortBy = $args['sort_by'] ?? 'newest';
        switch ($sortBy) {
            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            case 'rating_desc':
                $query->orderBy('rating', 'desc');
                break;
            case 'newest':
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        $page = $args['page'] ?? 1;
        $limit = $args['limit'] ?? 8;
        $total = $query->count();

        $data = $query->skip(($page - 1) * $limit)
            ->take($limit)
            ->get()
            ->all();

        $hasMore = ($page * $limit) < $total;

        return [
            'data' => $data,
            'total' => $total,
            'hasMore' => $hasMore
        ];
    }
}

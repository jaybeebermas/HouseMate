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
}

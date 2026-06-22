<?php

namespace App\GraphQL\Mutations\Listing;

use App\Models\Listing;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Artisan;

class ListingMutation
{
    /**
     * @param  mixed  $_
     * @param  array{category: string, price: float, details: string, latitude: float, longitude: float, address: string, images: string[], cover_image: string}  $args
     * @return array{status: string, message: string, listing?: Listing}
     */
    public function createListing(mixed $_, array $args): array
    {
        // 1. Self-healing database migration checks
        try {
            if (!Schema::hasTable('listings')) {
                Artisan::call('migrate', ['--force' => true]);
            }
        } catch (\Throwable $e) {
            Log::error('Autorun listings migration failed: ' . $e->getMessage());
        }

        $user = Auth::user();
        if (!$user instanceof User) {
            return [
                'status' => 'ERROR',
                'message' => 'Unauthenticated.',
            ];
        }

        // Ensure user has listing.create permission
        if (!$user->can('listing.create')) {
            return [
                'status' => 'ERROR',
                'message' => 'Unauthorized. Only approved landlords can post rooms.',
            ];
        }

        DB::beginTransaction();

        try {
            $listing = Listing::create([
                'user_id' => $user->id,
                'category' => $args['category'],
                'price' => $args['price'],
                'details' => $args['details'],
                'latitude' => $args['latitude'],
                'longitude' => $args['longitude'],
                'address' => $args['address'],
                'images' => $args['images'],
                'cover_image' => $args['cover_image'],
                'rating' => 5.0,
                'reviews_count' => 0,
            ]);

            DB::commit();
            Log::info('Listing posted successfully.', ['user_id' => $user->id, 'listing_id' => $listing->id]);

            return [
                'status' => 'SUCCESS',
                'message' => 'Listing created successfully!',
                'listing' => $listing,
            ];
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Listing posting failed: ' . $e->getMessage());

            return [
                'status' => 'ERROR',
                'message' => 'Failed to create listing: ' . $e->getMessage(),
            ];
        }
    }
}

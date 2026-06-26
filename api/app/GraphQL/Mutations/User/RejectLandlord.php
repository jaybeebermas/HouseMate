<?php

namespace App\GraphQL\Mutations\User;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

final class RejectLandlord
{
    /**
     * @param  mixed  $_
     * @param  array{id: string}  $args
     * @return User
     */
    public function __invoke(mixed $_, array $args): User
    {
        $user = User::findOrFail($args['id']);

        DB::beginTransaction();
        try {
            $user->landlord_status = 'rejected';
            $user->save();

            DB::commit();
            Log::info('Landlord rejected.', ['user_id' => $user->id]);

            return $user;
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Reject landlord failed.', ['user_id' => $user->id, 'error' => $e->getMessage()]);
            throw $e;
        }
    }
}

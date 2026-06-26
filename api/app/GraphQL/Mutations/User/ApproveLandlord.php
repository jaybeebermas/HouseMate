<?php

namespace App\GraphQL\Mutations\User;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

final class ApproveLandlord
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
            $user->landlord_status = 'approved';
            $user->role = 'landlord';
            $user->save();

            $roleModelClass = config('permission.models.role');
            foreach (['web', 'sanctum'] as $guardName) {
                $roleModelClass::query()->firstOrCreate(
                    ['name' => 'landlord', 'guard_name' => $guardName]
                );
            }
            $user->syncRoles(['landlord']);

            DB::commit();
            Log::info('Landlord approved.', ['user_id' => $user->id]);

            return $user;
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Approve landlord failed.', ['user_id' => $user->id, 'error' => $e->getMessage()]);
            throw $e;
        }
    }
}

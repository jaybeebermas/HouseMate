<?php declare(strict_types=1);

namespace App\GraphQL\Mutations\Role;

use App\Models\Role;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

final readonly class DeleteRole
{
    /** @param  array{id: string}  $args */
    public function __invoke(null $_, array $args): ?Role
    {
        DB::beginTransaction();

        try {
            $role = Role::query()->find($args['id']);
            if (! $role) {
                DB::commit();
                Log::info('DeleteRole mutation skipped. Role not found.', [
                    'id' => $args['id'] ?? null,
                ]);
                return null;
            }

            $role->delete();
            DB::commit();

            Log::info('DeleteRole mutation succeeded.', [
                'role_id' => $role->id,
            ]);

            return $role;
        } catch (Throwable $e) {
            DB::rollBack();

            Log::error('DeleteRole mutation failed.', [
                'id' => $args['id'] ?? null,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}

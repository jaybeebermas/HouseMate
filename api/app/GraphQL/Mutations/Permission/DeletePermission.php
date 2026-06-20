<?php declare(strict_types=1);

namespace App\GraphQL\Mutations\Permission;

use App\Models\Permission;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

final readonly class DeletePermission
{
    /** @param  array{id: string}  $args */
    public function __invoke(null $_, array $args): ?Permission
    {
        DB::beginTransaction();

        try {
            $permission = Permission::query()->find($args['id']);
            if (! $permission) {
                DB::commit();
                Log::info('DeletePermission mutation skipped. Permission not found.', [
                    'id' => $args['id'] ?? null,
                ]);
                return null;
            }

            $permission->delete();
            DB::commit();
            Log::info('DeletePermission mutation succeeded.', [
                'permission_id' => $permission->id,
            ]);

            return $permission;
        } catch (Throwable $e) {
            DB::rollBack();

            Log::error('DeletePermission mutation failed.', [
                'id' => $args['id'] ?? null,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}

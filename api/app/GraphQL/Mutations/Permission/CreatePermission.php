<?php declare(strict_types=1);

namespace App\GraphQL\Mutations\Permission;

use App\Models\Permission;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

final readonly class CreatePermission
{
    /** @param  array{input: array{name: string, guard_name?: string}}  $args */
    public function __invoke(null $_, array $args): Permission
    {
        DB::beginTransaction();

        try {
            $input = $args['input'];

            $permission = Permission::query()->create([
                'name' => $input['name'],
                'guard_name' => $input['guard_name'] ?? 'web',
            ]);

            DB::commit();
            Log::info('CreatePermission mutation succeeded.', [
                'permission_id' => $permission->id,
            ]);

            return $permission;
        } catch (Throwable $e) {
            DB::rollBack();

            Log::error('CreatePermission mutation failed.', [
                'input' => $args['input'] ?? null,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}

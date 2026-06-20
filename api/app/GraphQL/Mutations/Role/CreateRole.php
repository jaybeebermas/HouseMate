<?php declare(strict_types=1);

namespace App\GraphQL\Mutations\Role;

use App\Models\Role;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

final readonly class CreateRole
{
    /** @param  array{input: array{name: string, guard_name?: string, permissions?: string[]}}  $args */
    public function __invoke(null $_, array $args): Role
    {
        DB::beginTransaction();

        try {
            $input = $args['input'];
            $role = Role::query()->create([
                'name' => $input['name'],
                'guard_name' => $input['guard_name'] ?? 'web',
            ]);

            if (isset($input['permissions'])) {
                $role->syncPermissions($input['permissions']);
            }

            DB::commit();

            Log::info('CreateRole mutation succeeded.', [
                'role_id' => $role->id,
            ]);

            return $role;
        } catch (Throwable $e) {
            DB::rollBack();

            Log::error('CreateRole mutation failed.', [
                'input' => $args['input'] ?? null,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}

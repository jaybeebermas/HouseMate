<?php declare(strict_types=1);

namespace App\GraphQL\Mutations\User;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

final readonly class UpdateUser
{
    /** @param  array{input: array{id: string, username?: string, first_name?: string, last_name?: string, email?: string, password?: string, role?: string}}  $args */
    public function __invoke(null $_, array $args): User
    {
        DB::beginTransaction();

        try {
            $input = $args['input'];
            $user = User::findOrFail($input['id']);

            $updateData = collect($input)->except(['id', 'role', 'password'])->toArray();

            if (! empty($input['password'])) {
                $updateData['password'] = $input['password'];
            }

            if (! empty($input['role'])) {
                $updateData['role'] = $input['role'];
                $user->syncRoles([$input['role']]);
            }

            $user->update($updateData);
            $user = $user->fresh();

            DB::commit();
            Log::info('UpdateUser mutation succeeded.', [
                'user_id' => $user?->id,
            ]);

            return $user;
        } catch (Throwable $e) {
            DB::rollBack();

            Log::error('UpdateUser mutation failed.', [
                'input' => $args['input'] ?? null,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}

<?php declare(strict_types=1);

namespace App\GraphQL\Mutations\User;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

final readonly class DeleteUser
{
    /** @param  array{id: string}  $args */
    public function __invoke(null $_, array $args): bool
    {
        DB::beginTransaction();

        try {
            $user = User::findOrFail($args['id']);
            $deleted = (bool) $user->delete();

            DB::commit();
            Log::info('DeleteUser mutation succeeded.', [
                'user_id' => $args['id'] ?? null,
            ]);

            return $deleted;
        } catch (Throwable $e) {
            DB::rollBack();

            Log::error('DeleteUser mutation failed.', [
                'id' => $args['id'] ?? null,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}

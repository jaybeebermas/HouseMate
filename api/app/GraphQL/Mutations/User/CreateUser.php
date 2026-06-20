<?php declare(strict_types=1);

namespace App\GraphQL\Mutations\User;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

final readonly class CreateUser
{
    /** @param  array{input: array{username: string, first_name: string, last_name: string, email: string, password: string, role?: string}}  $args */
    public function __invoke(null $_, array $args): User
    {
        DB::beginTransaction();

        try {
            $input = $args['input'];

            $user = User::create([
                'username' => $input['username'],
                'first_name' => $input['first_name'],
                'last_name' => $input['last_name'],
                'email' => $input['email'],
                'password' => $input['password'], // Laravel casts/hashes this if configured in cast
                'role' => $input['role'] ?? 'user',
            ]);

            if (! empty($input['role'])) {
                $user->assignRole($input['role']);
            }

            DB::commit();
            Log::info('CreateUser mutation succeeded.', [
                'user_id' => $user->id,
                'username' => $user->username,
            ]);

            return $user;
        } catch (Throwable $e) {
            DB::rollBack();

            Log::error('CreateUser mutation failed.', [
                'input' => $args['input'] ?? null,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}

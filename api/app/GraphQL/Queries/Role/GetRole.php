<?php declare(strict_types=1);

namespace App\GraphQL\Queries\Role;

use App\Models\Role;
use Illuminate\Database\Eloquent\Collection;

final readonly class GetRole
{
    /** @return Collection<int, Role> */
    public function roles(): Collection
    {
        return Role::query()->where('guard_name', 'web')->orderBy('id')->get();
    }

    /** @param  array{id: string}  $args */
    public function role(null $_, array $args): ?Role
    {
        return Role::query()->find($args['id']);
    }
}

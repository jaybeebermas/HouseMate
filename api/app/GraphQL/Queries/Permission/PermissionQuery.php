<?php

namespace App\GraphQL\Queries\Permission;

use Illuminate\Database\Eloquent\Model;

class PermissionQuery
{
    public function permissions(): \Illuminate\Database\Eloquent\Collection
    {
        /** @var Model $permissionModel */
        $permissionModel = app('App\\Models\\Permission');

        return $permissionModel->newQuery()->orderBy('id')->get();
    }

    public function permission(mixed $_, array $args): ?Model
    {
        /** @var Model $permissionModel */
        $permissionModel = app('App\\Models\\Permission');

        return $permissionModel->newQuery()->find($args['id']);
    }

    public function availablePermissions(): array
    {
        return config('const.permissions', []);
    }

    public function basePermissions(): array
    {
        return config('const.base_permissions', []);
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * Seed the application's permissions from config/const.php.
     */
    public function run(): void
    {
        $permissionModelClass = config('permission.models.permission');
        $roleModelClass = config('permission.models.role');
        $permissionsList = config('const.permissions', []);
        $guards = ['web', 'sanctum'];

        foreach ($guards as $guardName) {
            // Create Permissions
            foreach ($permissionsList as $permissionName) {
                $permissionModelClass::query()->updateOrCreate(
                    ['name' => $permissionName, 'guard_name' => $guardName],
                    []
                );
            }

            // Forget cached permissions so Spatie is aware of newly created permissions
            app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();

            // Create Roles
            $superAdmin = $roleModelClass::query()->updateOrCreate(
                ['name' => 'super_admin', 'guard_name' => $guardName],
                []
            );

            $admin = $roleModelClass::query()->updateOrCreate(
                ['name' => 'admin', 'guard_name' => $guardName],
                []
            );

            // Create Guest Role (no permissions)
            $roleModelClass::query()->updateOrCreate(
                ['name' => 'guest', 'guard_name' => $guardName],
                []
            );

            // Assign Permissions
            $superAdmin->syncPermissions($permissionsList);
            $admin->syncPermissions($permissionsList);
            // Guest role intentionally has NO permissions
        }

        $permissionRegistrar = app()->bound('permission.registrar')
            ? app('permission.registrar')
            : null;

        if ($permissionRegistrar && method_exists($permissionRegistrar, 'forgetCachedPermissions')) {
            $permissionRegistrar->forgetCachedPermissions();
        }
    }
}

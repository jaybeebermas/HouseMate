<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create a Super Admin User
        $superAdmin = User::firstOrCreate(
            ['username' => 'superadmin'],
            [
                'first_name' => 'Super',
                'last_name' => 'Admin',
                'email' => 'superadmin@brgysync.com',
                'password' => Hash::make('password123'),
                'role' => 'super_admin',
            ]
        );
        $superAdmin->assignRole('super_admin');
    }
}

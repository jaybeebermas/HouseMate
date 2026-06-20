<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create default super admin
        $admin = User::firstOrCreate(
            ['username' => 'admin'],
            [
                'first_name' => 'System',
                'last_name' => 'Admin',
                'email' => 'admin@gmail.com',
                'password' => Hash::make('1qaz2wsx#edc'),
                'role' => 'super_admin',
            ]
        );

        $admin->assignRole('super_admin');
    }
}

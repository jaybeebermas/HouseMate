<?php

return [
    'id' => 'user-management',
    'title' => 'User Management',
    'type' => 'collapsible',
    'icon' => 'heroicons:user-group',
    'parent' => null,
    'permission' => null,
    'children' => [
        ['id' => 'users', 'title' => 'Users', 'type' => 'item', 'route' => '/admin/users', 'permission' => 'user.view', 'icon' => 'heroicons:users'],
        ['id' => 'roles', 'title' => 'Roles', 'type' => 'item', 'route' => '/admin/roles', 'permission' => 'user.view', 'icon' => 'heroicons:shield-check'],
    ],
];


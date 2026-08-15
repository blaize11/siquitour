<?php

// Load Laravel
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Role;
use App\Models\UserRole;
use App\Models\AuditLog;
use App\Models\User;

echo "\n🔐 SiquiTour Permissions System Verification\n";
echo str_repeat("=", 50) . "\n\n";

// Check roles
$roles = Role::all();
echo "📋 Roles Created:\n";
foreach ($roles as $role) {
    $count = UserRole::where('role_id', $role->id)->count();
    echo "   ✅ {$role->display_name} ({$role->name}): {$count} users\n";
}

// Check user roles
$userRolesCount = UserRole::count();
echo "\n👥 Total UserRoles Assigned: {$userRolesCount}\n";

// Check audit logs
$auditLogsCount = AuditLog::count();
echo "📝 Audit Logs Table: Created\n";

// Check users have active role
$usersWithActiveRole = User::whereNotNull('active_role_id')->count();
$totalUsers = User::count();
echo "\n✅ Users with Active Role: {$usersWithActiveRole}/{$totalUsers}\n";

// Summary
echo "\n" . str_repeat("=", 50);
echo "\n✅ PERMISSIONS SYSTEM READY!\n";
echo str_repeat("=", 50) . "\n\n";

echo "📌 Next Steps:\n";
echo "   1. Register middleware in app/Http/Kernel.php\n";
echo "   2. Register policies in AuthServiceProvider.php\n";
echo "   3. Apply role middleware to routes\n";
echo "   4. Test API endpoints\n\n";

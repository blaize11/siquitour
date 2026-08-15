<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use App\Models\UserRole;
use Illuminate\Database\Seeder;

class AssignRolesToUsers extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $guestRole = Role::where('name', 'guest')->first();

        if (!$guestRole) {
            echo "❌ Guest role not found. Run migrations first.\n";
            return;
        }

        $users = User::all();
        $count = 0;

        foreach ($users as $user) {
            UserRole::firstOrCreate([
                'user_id' => $user->id,
                'role_id' => $guestRole->id,
            ], [
                'status' => 'active',
                'is_primary' => true,
            ]);

            $user->update(['active_role_id' => $guestRole->id]);
            $count++;
        }

        echo "✅ Assigned guest role to {$count} users\n";
    }
}

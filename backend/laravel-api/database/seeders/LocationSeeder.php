<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LocationSeeder extends Seeder
{
    public function run(): void
    {
        // Create Siquijor Province
        $siquijor = DB::table('provinces')->insertGetId([
            'name' => 'Siquijor',
            'region' => 'Central Visayas (Region VII)',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Define municipalities and their barangays (Official PSGC)
        $locations = [
            'Enrique Villanueva' => [
                'Balolong', 'Bino-ongan', 'Bitaug', 'Bolot', 'Camogao', 'Cangmangki',
                'Libo', 'Lomangcapan', 'Lotloton', 'Manan-ao', 'Olave', 'Parian',
                'Poblacion', 'Tulapos'
            ],
            'Larena' => [
                'Bagacay', 'Balolang', 'Basac', 'Bintangan', 'Bontod', 'Cabulihan',
                'Calunasan', 'Candigum', 'Cang-allas', 'Cang-apa', 'Cangbagsa', 'Cangmalalag',
                'Canlambo', 'Canlasog', 'Catamboan', 'Helen', 'Nonoc', 'North Poblacion',
                'South Poblacion', 'Ponong', 'Sabang', 'Sandugan', 'Taculing'
            ],
            'Lazi' => [
                'Campalanas', 'Cangclaran', 'Cangomantong', 'Capalasanan', 'Catamboan',
                'Gabayan', 'Kimba', 'Kinamandagan', 'Lower Cabangcalan', 'Nagerong',
                'Po-o', 'Simacolong', 'Tagmanocan', 'Talayong', 'Tigbawan', 'Tignao',
                'Upper Cabangcalan', 'Ytaya'
            ],
            'Maria' => [
                'Bogo', 'Bonga', 'Cabal-asan', 'Calunasan', 'Candaping A', 'Candaping B',
                'Cantaroc A', 'Cantaroc B', 'Cantugbas', 'Lico-an', 'Lilo-an', 'Looc',
                'Logucan', 'Minalulan', 'Nabutay', 'Olang', 'Pisong A', 'Pisong B',
                'Poblacion Norte', 'Poblacion Sur', 'Saguing', 'Sawang'
            ],
            'San Juan' => [
                'Canasagan', 'Candura', 'Cangmunag', 'Cansayang', 'Catulayan',
                'Lala-o', 'Maite', 'Napo', 'Paliton', 'Poblacion', 'Solangon',
                'Tag-ibo', 'Tambisan', 'Timbaon', 'Tubod'
            ],
            'Siquijor' => [
                'Banban', 'Bolos', 'Caipilan', 'Caitican', 'Calalinan', 'Cang-atuyom',
                'Canal', 'Candanay Norte', 'Candanay Sur', 'Cang-adieng', 'Cang-agong',
                'Cang-alwang', 'Cang-asa', 'Cang-inte', 'Cang-isad', 'Canghunoghunog',
                'Cangmatnog', 'Cangmohao', 'Cantabon', 'Caticugan', 'Dumanhog',
                'Ibabao', 'Lambojon', 'Luyang', 'Luzong', 'Olo', 'Pangi', 'Panlautan',
                'Pasihagon', 'Pili', 'Poblacion', 'Polangyuta', 'Ponong', 'Sabang',
                'San Antonio', 'Songculan', 'Tacdog', 'Tacloban', 'Tambisan', 'Tebjong',
                'Tinago', 'Tongo'
            ],
        ];

        // Insert municipalities and barangays
        foreach ($locations as $municipality => $barangays) {
            $municipalityId = DB::table('municipalities')->insertGetId([
                'province_id' => $siquijor,
                'name' => $municipality,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            foreach ($barangays as $barangay) {
                DB::table('barangays')->insert([
                    'municipality_id' => $municipalityId,
                    'name' => $barangay,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // Insert major landmarks
        $landmarks = [
            ['name' => 'Cambugahay Falls', 'barangay' => 'Talayong', 'municipality' => 'Lazi', 'category' => 'Waterfall', 'latitude' => 9.1697, 'longitude' => 123.5811],
            ['name' => 'Old Enchanted Balete Tree', 'barangay' => 'Talayong', 'municipality' => 'Lazi', 'category' => 'Historical Site', 'latitude' => 9.1674, 'longitude' => 123.5778],
            ['name' => 'San Isidro Labrador Church', 'barangay' => 'Poblacion', 'municipality' => 'Lazi', 'category' => 'Church', 'latitude' => 9.1645, 'longitude' => 123.5867],
            ['name' => 'Paliton Beach', 'barangay' => 'Paliton', 'municipality' => 'San Juan', 'category' => 'Beach', 'latitude' => 9.2145, 'longitude' => 123.5147],
            ['name' => 'Tubod Marine Sanctuary', 'barangay' => 'Tubod', 'municipality' => 'San Juan', 'category' => 'Marine Sanctuary', 'latitude' => 9.2456, 'longitude' => 123.4987],
            ['name' => 'Salagdoong Beach', 'barangay' => 'Poblacion Sur', 'municipality' => 'Maria', 'category' => 'Beach', 'latitude' => 9.2234, 'longitude' => 123.6123],
            ['name' => 'Cantabon Cave', 'barangay' => 'Cantabon', 'municipality' => 'Siquijor', 'category' => 'Cave', 'latitude' => 9.2845, 'longitude' => 123.5456],
            ['name' => 'Mt. Bandilaan', 'barangay' => 'Poblacion', 'municipality' => 'Siquijor', 'category' => 'Mountain', 'latitude' => 9.2567, 'longitude' => 123.5634],
            ['name' => 'Capilay Spring Park', 'barangay' => 'Poblacion', 'municipality' => 'San Juan', 'category' => 'Spring', 'latitude' => 9.2234, 'longitude' => 123.5234],
            ['name' => 'Tulapos Marine Sanctuary', 'barangay' => 'Tulapos', 'municipality' => 'Enrique Villanueva', 'category' => 'Marine Sanctuary', 'latitude' => 9.1456, 'longitude' => 123.6123],
            ['name' => 'Kagusuan Beach', 'barangay' => 'Poblacion Sur', 'municipality' => 'Maria', 'category' => 'Beach', 'latitude' => 9.2345, 'longitude' => 123.6234],
            ['name' => 'Solangon Pier', 'barangay' => 'Solangon', 'municipality' => 'San Juan', 'category' => 'Pier', 'latitude' => 9.2456, 'longitude' => 123.5345],
        ];

        foreach ($landmarks as $landmark) {
            $barangayId = DB::table('barangays')
                ->join('municipalities', 'barangays.municipality_id', '=', 'municipalities.id')
                ->where('barangays.name', $landmark['barangay'])
                ->where('municipalities.name', $landmark['municipality'])
                ->value('barangays.id');

            if ($barangayId) {
                DB::table('landmarks')->insert([
                    'name' => $landmark['name'],
                    'barangay_id' => $barangayId,
                    'category' => $landmark['category'],
                    'latitude' => $landmark['latitude'],
                    'longitude' => $landmark['longitude'],
                    'status' => 'active',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}

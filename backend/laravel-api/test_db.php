<?php

try {
    $pdo = new PDO('mysql:host=127.0.0.1;port=3306;dbname=siquitour', 'root', '');
    $stmt = $pdo->query('SHOW TABLES');
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

    echo "✓ Database Connection Successful!\n";
    echo "Tables found: " . count($tables) . "\n\n";

    foreach($tables as $table) {
        echo "- $table\n";
    }

    // Check if users table has the required columns
    if (in_array('users', $tables)) {
        echo "\n✓ Users table exists\n";
        $stmt = $pdo->query('DESC users');
        $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
        echo "Columns: " . implode(', ', $columns) . "\n";
    }

} catch(Exception $e) {
    echo "✗ Database Connection Error\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "\nTroubleshooting:\n";
    echo "1. Make sure MySQL/MariaDB is running\n";
    echo "2. Check XAMPP Control Panel\n";
    echo "3. Ensure 'siquitour' database exists\n";
}
?>

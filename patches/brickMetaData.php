<?php

// Manual fallback patch for legacy installations.
// Regular package setup already adds these columns via onPackageSetup().
// Do not execute unless package setup failed to add the metadata columns.

define('QUIQQER_SYSTEM', true);
define('SYSTEM_INTERN', true);
require dirname(dirname(dirname(dirname(__FILE__)))) . '/header.php';

if (!class_exists('QUI\Bricks\Manager')) {
    exit;
}

$bricksTable = QUI\Bricks\Manager::getTable();
$SchemaManager = QUI::getSchemaManager();

if (!$SchemaManager->tablesExist([$bricksTable])) {
    exit;
}

$Table = $SchemaManager->introspectTable($bricksTable);
$addedColumns = [];

foreach (['c_date', 'e_date'] as $column) {
    if (!$Table->hasColumn($column)) {
        $addedColumns[] = new \Doctrine\DBAL\Schema\Column(
            $column,
            \Doctrine\DBAL\Types\Type::getType(\Doctrine\DBAL\Types\Types::DATETIME_MUTABLE),
            ['notnull' => false, 'default' => null]
        );
    }
}

foreach (['c_user', 'e_user'] as $column) {
    if (!$Table->hasColumn($column)) {
        $addedColumns[] = new \Doctrine\DBAL\Schema\Column(
            $column,
            \Doctrine\DBAL\Types\Type::getType(\Doctrine\DBAL\Types\Types::STRING),
            ['length' => 50, 'notnull' => false, 'default' => null]
        );
    }
}

if ($addedColumns === []) {
    echo 'Already executed' . PHP_EOL;
    exit;
}

$SchemaManager->alterTable(new \Doctrine\DBAL\Schema\TableDiff(
    $Table,
    addedColumns: $addedColumns
));

echo 'Brick metadata columns added' . PHP_EOL;

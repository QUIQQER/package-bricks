<?php

define('QUIQQER_SYSTEM', true);
define('SYSTEM_INTERN', true);
require dirname(dirname(dirname(dirname(__FILE__)))).'/header.php';

// workaround for older patch
$Bricks = QUI\Bricks\Manager::init();
$result = QUI::getDataBase()->fetch(array(
    'count' => 'count',
    'from'  => $Bricks->getUIDTable(),
));

// if unique ids already exist, the pages no longer have to be passed through
if (false && isset($result[0]) && isset($result[0]['count']) && $result[0]['count']) {
    echo 'Already executed'.PHP_EOL;

    return;
}

$projects = QUI::getProjectManager()->getProjectList();

// helper to look if areas are empty
$areasEmpty = function ($areas) {
    if (!is_array($areas)) {
        return true;
    }

    foreach ($areas as $area => $data) {
        if (!empty($data)) {
            return false;
        }
    }

    return true;
};

echo PHP_EOL;

/* @var $Project QUI\Projects\Project */
foreach ($projects as $Project) {
    $ids = $Project->getSitesIds();

    foreach ($ids as $id) {
        $id = $id['id'];

        try {
            $Site  = new QUI\Projects\Site\Edit($Project, $id);
            $areas = $Site->getAttribute('quiqqer.bricks.areas');

            if ($areas === false) {
                continue;
            }

            $areas = json_decode($areas, true);

            if ($areasEmpty($areas)) {
                continue;
            }

            echo $Project->getName().'-'.$Project->getLang().'-'.$id.PHP_EOL;

            $Site->unlockWithRights();
            $Site->load();
            $Site->save(QUI::getUsers()->getSystemUser());
        } catch (QUI\Exception $Exception) {
            echo $Exception->getMessage().PHP_EOL;
            continue;
        }
    }

    unset($Edit);
    unset($Project);
}

echo 'Bricks saving...';

// alle bausteine speichern
$bricks = QUI::getDataBase()->fetch(array(
    'from' => $Bricks->getTable()
));

foreach ($bricks as $brick) {
    try {
        $Brick = $Bricks->getBrickById($brick['id']);
        $Bricks->saveBrick($brick['id'], $Brick->getAttributes());
    } catch (QUI\Exception $Exception) {
        QUI\System\Log::writeException($Exception);
        echo $Exception->getMessage().PHP_EOL;
    }
}

echo '[done]';
echo PHP_EOL;

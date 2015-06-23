<?php

/**
 * This file contains package_quiqqer_bricks_ajax_project_getBricks
 */

/**
 * Returns the bricks of the project area
 *
 * @param string      $project - json array, Project Data
 * @param string|bool $area    - (optional), Area name
 *
 * @return array
 */
function package_quiqqer_bricks_ajax_project_getBricks($project, $area = false)
{
    $Project = QUI::getProjectManager()->decode($project);
    $BrickManager = new QUI\Bricks\Manager();

    $bricks = $BrickManager->getBricksFromProject($Project);
    $result = array();

    foreach ($bricks as $Brick) {
        /* @var $Brick QUI\Bricks\Brick */
        if (!$area) {
            $result[] = $Brick->getAttributes();
            continue;
        }

        $areas = $Brick->getAttribute('areas');

        if (strpos($areas, ','.$area.',') !== false) {
            $result[] = $Brick->getAttributes();
        }
    }

    return $result;
}

QUI::$Ajax->register(
    'package_quiqqer_bricks_ajax_project_getBricks',
    array('project', 'area'),
    'Permission::checkAdminUser'
);

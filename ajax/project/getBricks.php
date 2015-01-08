<?php

/**
 * This file contains package_quiqqer_bricks_ajax_project_getBricks
 */

/**
 * Returns the feed list
 *
 * @param string $project - json array, Project Data
 * @return array
 */
function package_quiqqer_bricks_ajax_project_getBricks($project)
{
    $Project      = QUI::getProjectManager()->decode( $project );
    $BrickManager = new QUI\Bricks\Manager();

    $bricks = $BrickManager->getBricksFromProject( $Project );
    $result = array();

    foreach ( $bricks as $Brick ) {
        $result[] = $Brick->getAttributes();
    }

    return $result;
}

QUI::$Ajax->register(
    'package_quiqqer_bricks_ajax_project_getBricks',
    array( 'project' ),
    'Permission::checkAdminUser'
);

<?php

/**
 * This file contains package_quiqqer_bricks_ajax_project_getAreas
 */

/**
 * Returns the feed list
 *
 * @param string $project  - json array, Project Data
 * @param string $siteType - siteType
 * @return array
 */
function package_quiqqer_bricks_ajax_project_getAreas($project, $siteType)
{
    $Project      = QUI::getProjectManager()->decode( $project );
    $BrickManager = new QUI\Bricks\Manager();

    return $BrickManager->getAreasByProject( $Project, $siteType );
}

QUI::$Ajax->register(
    'package_quiqqer_bricks_ajax_project_getAreas',
    array( 'project', 'siteType' ),
    'Permission::checkAdminUser'
);

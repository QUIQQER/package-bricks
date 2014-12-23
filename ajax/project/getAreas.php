<?php

/**
 * This file contains package_quiqqer_blocks_ajax_project_getBlocks
 */

/**
 * Returns the feed list
 *
 * @param string $project - json array, Project Data
 * @return array
 */
function package_quiqqer_blocks_ajax_project_getAreas($project)
{
    $Project      = QUI::getProjectManager()->decode( $project );
    $BlockManager = new QUI\Blocks\Manager();

    return $BlockManager->getAreasByProject( $Project );
}

QUI::$Ajax->register(
    'package_quiqqer_blocks_ajax_project_getAreas',
    array( 'project' ),
    'Permission::checkAdminUser'
);

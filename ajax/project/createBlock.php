<?php

/**
 * This file contains package_quiqqer_blocks_ajax_project_createBlock
 */

/**
 * Returns the feed list
 *
 * @param string $project - json array, Project Data
 * @param string $data - json array, Block Data
 * @return array
 */
function package_quiqqer_blocks_ajax_project_createBlock($project, $data)
{
    $Project = QUI::getProjectManager()->decode( $project );
    $Block   = new QUI\Blocks\Block( json_decode( $data, true ) );

    $BlockManager = new QUI\Blocks\Manager();

    return $BlockManager->createBlockForProject( $Project, $Block );
}

QUI::$Ajax->register(
    'package_quiqqer_blocks_ajax_project_createBlock',
    array( 'project', 'data' ),
    'Permission::checkAdminUser'
);

<?php

/**
 * This file contains package_quiqqer_feed_ajax_getList
 */

/**
 * Returns the feed list
 *
 * @author www.pcsg.de (Henning Leutz)
 * @param string $project - json array, Project Data
 * @return array
 */
function package_quiqqer_blocks_ajax_project_getBlocks($project)
{
    $Project      = QUI::getProjectManager()->decode( $project );
    $BlockManager = new \QUI\Blocks\Manager();

    $blocks = $BlockManager->getBlocksFromProject( $Project );
    $result = array();

    foreach ( $blocks as $Block ) {
        $result = $Block->getAttributes();
    }

    return $result;
}

\QUI::$Ajax->register(
    'package_quiqqer_blocks_ajax_project_getBlocks',
    array( 'project' ),
    'Permission::checkAdminUser'
);

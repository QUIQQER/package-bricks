<?php

/**
 * This file contains package_quiqqer_blocks_ajax_getAvailableBlocks
 */

/**
 * Returns the available blocks in the system
 *
 * @return array
 */
function package_quiqqer_blocks_ajax_getAvailableBlocks()
{
    $BlockManager = new \QUI\Blocks\Manager();

    return $BlockManager->getAvailableBlocks();
}

\QUI::$Ajax->register(
    'package_quiqqer_blocks_ajax_getAvailableBlocks',
    false,
    'Permission::checkAdminUser'
);

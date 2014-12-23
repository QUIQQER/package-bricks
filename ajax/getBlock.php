<?php

/**
 * This file contains package_quiqqer_blocks_ajax_getBlock
 */

/**
 * Returns the Block data
 *
 * @param {String|Integer} $blockId - Block-ID
 * @return array
 */
function package_quiqqer_blocks_ajax_getBlock($blockId)
{
    $BlockManager = new \QUI\Blocks\Manager();
    $Block = $BlockManager->getBlockById( $blockId );

    return $Block->getAttributes();
}

\QUI::$Ajax->register(
    'package_quiqqer_blocks_ajax_getBlock',
    array('blockId'),
    'Permission::checkAdminUser'
);

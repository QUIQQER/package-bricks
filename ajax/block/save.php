<?php

/**
 * This file contains package_quiqqer_blocks_ajax_getBlock
 */

/**
 * saves the block
 *
 * @param {String|Integer} $blockId - Block-ID
 * @param
 * @return array
 */
function package_quiqqer_blocks_ajax_block_save($blockId, $data)
{
    $BlockManager = new \QUI\Blocks\Manager();
    $BlockManager->saveBlock( $blockId, json_decode( $data, true ) );

    $Block = $BlockManager->getBlockById( $blockId );

    return $Block->getAttributes();
}

\QUI::$Ajax->register(
    'package_quiqqer_blocks_ajax_block_save',
    array('blockId', 'data'),
    'Permission::checkAdminUser'
);

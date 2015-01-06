<?php

/**
 * This file contains package_quiqqer_blocks_ajax_getBlock
 */

/**
 * delete the Block-IDs
 *
 * @param {String} $blockId - Block-IDs; JSON Array
 */
function package_quiqqer_blocks_ajax_block_delete($blockIds)
{
    $BlockManager = new \QUI\Blocks\Manager();
    $blockIds     = json_decode( $blockIds, true );

    foreach ( $blockIds as $blockId )
    {
        try
        {
            $BlockManager->deleteBlock( $blockId );

        } catch ( QUI\Exception $Exception )
        {
            QUI::getMessagesHandler()->addAttention(
                $Exception->getMessage()
            );
        }
    }
}

\QUI::$Ajax->register(
    'package_quiqqer_blocks_ajax_block_delete',
    array('blockIds'),
    'Permission::checkAdminUser'
);

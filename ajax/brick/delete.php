<?php

/**
 * This file contains package_quiqqer_bricks_ajax_brick_delete
 */

/**
 * delete the Brick-IDs
 *
 * @param {String} $brickId - Brick-IDs; JSON Array
 */
QUI::$Ajax->registerFunction(
    'package_quiqqer_bricks_ajax_brick_delete',
    function ($brickIds) {
        $BrickManager = QUI\Bricks\Manager::init();
        $brickIds     = \json_decode($brickIds, true);

        foreach ($brickIds as $brickId) {
            try {
                $BrickManager->deleteBrick($brickId);
            } catch (QUI\Exception $Exception) {
                QUI::getMessagesHandler()->addAttention(
                    $Exception->getMessage()
                );
            }
        }
    },
    ['brickIds'],
    'Permission::checkAdminUser'
);

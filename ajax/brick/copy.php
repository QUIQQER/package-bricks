<?php

/**
 * This file contains package_quiqqer_bricks_ajax_brick_save
 */

/**
 * saves the brick
 *
 * @param string|Integer $brickId - Brick-ID
 * @param string $title - title of the new brick
 * @param string $description - description of the new brick
 *
 * @return array
 */
QUI::$Ajax->registerFunction(
    'package_quiqqer_bricks_ajax_brick_copy',
    function ($brickId, $params) {
        $BrickManager = QUI\Bricks\Manager::init();

        $newId = $BrickManager->copyBrick(
            $brickId,
            \json_decode($params, true)
        );

        return $BrickManager->getBrickById($newId)->getAttributes();
    },
    ['brickId', 'params'],
    'Permission::checkAdminUser'
);

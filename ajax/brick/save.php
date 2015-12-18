<?php

/**
 * This file contains package_quiqqer_bricks_ajax_brick_save
 */

/**
 * saves the brick
 *
 * @param string|Integer $brickId - Brick-ID
 * @param string $data - JSON Data
 *
 * @return array
 */
QUI::$Ajax->registerFunction(
    'package_quiqqer_bricks_ajax_brick_save',
    function ($brickId, $data) {
        $BrickManager = QUI\Bricks\Manager::init();
        $BrickManager->saveBrick($brickId, json_decode($data, true));

        $Brick = $BrickManager->getBrickById($brickId);

        return $Brick->getAttributes();
    },
    array('brickId', 'data'),
    'Permission::checkAdminUser'
);

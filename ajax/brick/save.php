<?php

/**
 * This file contains package_quiqqer_bricks_ajax_brick_save
 */

/**
 * saves the brick
 *
 * @param string|Integer $brickId - Brick-ID
 * @param string         $data    - JSON Data
 *
 * @return array
 */
function package_quiqqer_bricks_ajax_brick_save($brickId, $data)
{
    $BrickManager = QUI\Bricks\Manager::init();
    $BrickManager->saveBrick($brickId, json_decode($data, true));

    $Brick = $BrickManager->getBrickById($brickId);

    return $Brick->getAttributes();
}

QUI::$Ajax->register(
    'package_quiqqer_bricks_ajax_brick_save',
    array('brickId', 'data'),
    'Permission::checkAdminUser'
);

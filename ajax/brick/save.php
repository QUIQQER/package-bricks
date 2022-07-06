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
        $data         = json_decode($data, true);

        $BrickManager->saveBrick($brickId, $data);
        $Brick = $BrickManager->getBrickById($brickId);

        return [
            'attributes'        => $Brick->getAttributes(),
            'settings'          => $Brick->getSettings(),
            'customfields'      => $Brick->getCustomFields(),
            'availableSettings' => $BrickManager->getAvailableBrickSettingsByBrickType(
                $Brick->getAttribute('type')
            )
        ];
    },
    ['brickId', 'data'],
    'Permission::checkAdminUser'
);

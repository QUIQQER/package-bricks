<?php

/**
 * This file contains package_quiqqer_bricks_ajax_getBrick
 */

/**
 * Returns the Brick data
 *
 * @param {String|Integer} $brickId - Brick-ID
 *
 * @return array
 */

QUI::getAjax()->registerFunction(
    'package_quiqqer_bricks_ajax_getBrick',
    function ($brickId) {
        $BrickManager = QUI\Bricks\Manager::init();
        $Brick = $BrickManager?->getBrickById($brickId);

        if (!$Brick) {
            return [
                'attributes' => [],
                'settings' => [],
                'customfields' => [],
                'availableSettings' => []
            ];
        }

        return [
            'attributes' => $Brick->getAttributes(),
            'settings' => $Brick->getSettings(),
            'customfields' => $Brick->getCustomFields(),
            'availableSettings' => $BrickManager->getAvailableBrickSettingsByBrickType(
                (string)$Brick->getAttribute('type')
            )
        ];
    },
    ['brickId'],
    'Permission::checkAdminUser'
);

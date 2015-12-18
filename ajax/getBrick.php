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
QUI::$Ajax->registerFunction(
    function ($brickId) {
        $BrickManager = QUI\Bricks\Manager::init();
        $Brick        = $BrickManager->getBrickById($brickId);

        return array(
            'attributes' => $Brick->getAttributes(),
            'settings' => $Brick->getSettings(),
            'customfields' => $Brick->getCustomFields(),
            'availableSettings' => $BrickManager->getAvailableBrickSettingsByBrickType(
                $Brick->getAttribute('type')
            )
        );
    },
    'package_quiqqer_bricks_ajax_getBrick',
    array('brickId'),
    'Permission::checkAdminUser'
);

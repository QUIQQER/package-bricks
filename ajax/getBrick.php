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
function package_quiqqer_bricks_ajax_getBrick($brickId)
{
    $BrickManager = new QUI\Bricks\Manager();
    $Brick = $BrickManager->getBrickById($brickId);

    return array(
        'attributes'        => $Brick->getAttributes(),
        'settings'          => $Brick->getSettings(),
        'customfields'      => $Brick->getCustomFields(),
        'availableSettings' => $BrickManager->getAvailableBrickSettingsByBrickType(
            $Brick->getAttribute('type')
        )
    );
}

QUI::$Ajax->register(
    'package_quiqqer_bricks_ajax_getBrick',
    array('brickId'),
    'Permission::checkAdminUser'
);

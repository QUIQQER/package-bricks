<?php

/**
 * This file contains package_quiqqer_bricks_ajax_getAvailableBricks
 */

/**
 * Returns the available bricks in the system
 *
 * @return array
 */
function package_quiqqer_bricks_ajax_getAvailableBricks()
{
    $BricksManager = new QUI\Bricks\Manager();

    return $BricksManager->getAvailableBricks();
}

QUI::$Ajax->register(
    'package_quiqqer_bricks_ajax_getAvailableBricks',
    false,
    'Permission::checkAdminUser'
);

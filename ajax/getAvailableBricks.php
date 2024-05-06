<?php

/**
 * This file contains package_quiqqer_bricks_ajax_getAvailableBricks
 */

/**
 * Returns the available bricks in the system
 *
 * @return array
 */

QUI::$Ajax->registerFunction(
    'package_quiqqer_bricks_ajax_getAvailableBricks',
    function () {
        $BricksManager = QUI\Bricks\Manager::init();
        return $BricksManager->getAvailableBricks();
    },
    false,
    'Permission::checkAdminUser'
);

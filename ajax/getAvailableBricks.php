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
    function () {
        $BricksManager = QUI\Bricks\Manager::init();

        return $BricksManager->getAvailableBricks();
    },
    'package_quiqqer_bricks_ajax_getAvailableBricks',
    false,
    'Permission::checkAdminUser'
);

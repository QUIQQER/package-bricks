<?php

/**
 * Return a xml category
 *
 * @param array $file - list of xml files
 * @param $category
 * @return String
 */
QUI::$Ajax->registerFunction(
    'package_quiqqer_bricks_ajax_getPanelCategory',
    function ($brickId, $category) {
        return QUI\Bricks\Panel::getInstance()->getCategoryFromBrick($brickId, $category);
    },
    ['brickId', 'category'],
    'Permission::checkAdminUser'
);

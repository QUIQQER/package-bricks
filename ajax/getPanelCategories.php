<?php

/**
 * This file contains package_quiqqer_bricks_ajax_getPanelCategories
 */

/**
 * Returns the Brick categories for a brick panel
 *
 * @param {String|Integer} $brickId - Brick-ID
 * @return array
 */
QUI::$Ajax->registerFunction(
    'package_quiqqer_bricks_ajax_getPanelCategories',
    function ($brickId) {
        $categories = QUI\Bricks\Panel::getInstance()->getCategoriesFromBrick($brickId);

        foreach ($categories as $key => $category) {
            unset($categories[$key]['items']);
        }

        return $categories;
    },
    ['brickId'],
    'Permission::checkAdminUser'
);

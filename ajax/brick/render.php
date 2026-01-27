<?php

/**
 * This file contains package_quiqqer_bricks_ajax_brick_render
 */

/**
 * renders a brick
 */
QUI::$Ajax->registerFunction(
    'package_quiqqer_bricks_ajax_brick_render',
    function ($brickId) {
        $bm = QUI\Bricks\Manager::init();
        $brick = $bm->getBrickById($brickId);

        $html = QUI\Control\Manager::getCSS();
        $html .= $brick->create();

        return $html;
    },
    ['brickId']
);

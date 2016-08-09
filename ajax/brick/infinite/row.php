<?php

/**
 * This file contains package_quiqqer_bricks_ajax_brick_infinite_row
 */

use QUI\Bricks\Controls\Children\Infinite;

/**
 * Return the children of the infinite brick row
 *
 * @param string|integer $brickId - Brick-ID
 * @param string|integer $row - Row number
 */
QUI::$Ajax->registerFunction(
    'package_quiqqer_bricks_ajax_brick_infinite_row',
    function ($brickId, $brickUID, $row) {
        $BrickManager = QUI\Bricks\Manager::init();

        if (isset($brickUID) && !empty($brickUID)) {
            $Brick = $BrickManager->getBrickById($brickUID);
        } else {
            $Brick = $BrickManager->getBrickById($brickId);
        }

        $settings = array_merge(
            $Brick->getAttributes(),
            $Brick->getSettings()
        );

        $Engine   = QUI::getTemplateManager()->getEngine();
        $Infinite = new Infinite($settings);

        $Engine->assign(array(
            'children'  => $Infinite->getRow((int)$row),
            'row'       => (int)$row,
            'this'      => $Infinite,
            'gridClass' => $Infinite->getAttribute('gridClass')
        ));

        return $Engine->fetch($Infinite->getRowTemplate());
    },
    array('brickId', 'brickUID', 'row'),
    false
);

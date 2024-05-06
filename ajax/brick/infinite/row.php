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

        if (!empty($brickUID)) {
            $Brick = $BrickManager->getBrickById($brickUID);
        } else {
            $Brick = $BrickManager->getBrickById($brickId);
        }

        $settings = array_merge(
            $Brick->getAttributes(),
            $Brick->getSettings()
        );

        $Engine = QUI::getTemplateManager()->getEngine();
        $Infinite = new Infinite($settings);

        // bad fix for getting the right attributes - like gridClass
        $Infinite->getBody();


        // generate rows
        $loadingRows = 1;

        if (!empty($settings['loadingrows']) && (int)$settings['loadingrows']) {
            $loadingRows = (int)$settings['loadingrows'];
        }

        $result = '';

        for ($i = 0; $i < $loadingRows; $i++) {
            $Engine->assign([
                'children' => $Infinite->getRow((int)$row),
                'row' => (int)$row,
                'this' => $Infinite,
                'gridClass' => $Infinite->getAttribute('gridClass')
            ]);

            $result .= $Engine->fetch($Infinite->getRowTemplate());
            $row++;
        }

        return $result;
    },
    ['brickId', 'brickUID', 'row']
);

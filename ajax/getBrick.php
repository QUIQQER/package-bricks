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

QUI::getAjax()->registerFunction(
    'package_quiqqer_bricks_ajax_getBrick',
    function ($brickId) {
        $formatUserDisplay = static function ($userId): string {
            if (empty($userId)) {
                return '';
            }

            try {
                $User = QUI::getUsers()->get((string)$userId);
                return $User->getName() . ' (' . $userId . ')';
            } catch (Exception) {
                return (string)$userId;
            }
        };

        $BrickManager = QUI\Bricks\Manager::init();

        if (!$BrickManager) {
            return [
                'attributes' => [],
                'settings' => [],
                'customfields' => [],
                'availableSettings' => []
            ];
        }

        $Brick = $BrickManager->getBrickById($brickId);
        $availableBricks = $BrickManager->getAvailableBricks();

        if (!$Brick) {
            return [
                'attributes' => [],
                'settings' => [],
                'customfields' => [],
                'availableSettings' => []
            ];
        }

        $attributes = $Brick->getAttributes();
        $availableByControl = [];

        foreach ($availableBricks as $availableBrick) {
            if (empty($availableBrick['control'])) {
                continue;
            }

            $availableByControl[$availableBrick['control']] = $availableBrick;
        }

        $type = $attributes['type'] ?? '';
        $definitionData = $availableByControl[$type] ?? [];
        $missingControl = $type !== 'content' && empty($definitionData);

        $attributes['systemName'] = $definitionData['name'] ?? '';
        $attributes['deprecated'] = !empty($definitionData['deprecated']) || !empty($attributes['deprecated']) ? 1 : 0;
        $attributes['missingControl'] = $missingControl ? 1 : 0;
        $attributes['c_user_display'] = $formatUserDisplay($Brick->getAttribute('c_user'));
        $attributes['e_user_display'] = $formatUserDisplay($Brick->getAttribute('e_user'));

        return [
            'attributes' => $attributes,
            'settings' => $Brick->getSettings(),
            'customfields' => $Brick->getCustomFields(),
            'availableSettings' => $BrickManager->getAvailableBrickSettingsByBrickType(
                (string)$Brick->getAttribute('type')
            )
        ];
    },
    ['brickId'],
    'Permission::checkAdminUser'
);

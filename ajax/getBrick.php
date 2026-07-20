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

        $translateAvailableSettings = static function (array $settings): array {
            $Locale = QUI::getLocale();

            foreach ($settings as $index => $setting) {
                if (isset($setting['text'])) {
                    $settings[$index]['text'] = $Locale->parseLocaleString($setting['text']);
                }

                if (isset($setting['description'])) {
                    $settings[$index]['description'] = $Locale->parseLocaleString($setting['description']);
                }

                if (!empty($setting['options']) && is_array($setting['options'])) {
                    foreach ($setting['options'] as $optionIndex => $option) {
                        if (!isset($option['text'])) {
                            continue;
                        }

                        $settings[$index]['options'][$optionIndex]['text'] = $Locale->parseLocaleString(
                            $option['text']
                        );
                    }
                }
            }

            return $settings;
        };

        /** @var QUI\Bricks\Manager $BrickManager */
        $BrickManager = QUI\Bricks\Manager::init();

        $availableBricks = $BrickManager->getAvailableBricks();

        try {
            $Brick = $BrickManager->getBrickById((int)$brickId);
        } catch (Exception) {
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
            'availableSettings' => $translateAvailableSettings($BrickManager->getAvailableBrickSettingsByBrickType(
                (string)$Brick->getAttribute('type')
            ))
        ];
    },
    ['brickId'],
    'Permission::checkAdminUser'
);

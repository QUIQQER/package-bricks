<?php

/**
 * This file contains package_quiqqer_bricks_ajax_brick_save
 */

/**
 * saves the brick
 *
 * @param string|Integer $brickId - Brick-ID
 * @param string $data - JSON Data
 *
 * @return array
 */
QUI::getAjax()->registerFunction(
    'package_quiqqer_bricks_ajax_brick_save',
    function ($brickId, $data) {
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

        $BrickManager = QUI\Bricks\Manager::init();
        if ($BrickManager === null) {
            return [
                'attributes' => [],
                'settings' => [],
                'customfields' => [],
                'availableSettings' => []
            ];
        }

        $data = json_decode($data, true);
        $Brick = $BrickManager->getBrickByIdentifier($brickId);
        $brickId = (int)$Brick->getAttribute('id');

        $BrickManager->saveBrick($brickId, $data);
        $Brick = $BrickManager->getBrickById($brickId);

        $attributes = $Brick->getAttributes();
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
    ['brickId', 'data'],
    'Permission::checkAdminUser'
);

<?php

namespace QUI\Bricks\Layout;

use function array_key_exists;
use function is_array;
use function is_string;
use function str_contains;

class Presets
{
    public const DEFAULT_COLUMNS = 12;
    public const DEFAULT_PRESET_ID = 'core:2-equal';

    private const LEGACY_ALIASES = [
        'preset-2-equal' => 'core:2-equal',
        'preset-2-left-narrow' => 'core:2-left-narrow',
        'preset-2-right-narrow' => 'core:2-right-narrow',
        'preset-4-equal' => 'core:4-equal',
        'preset-4-offset-a' => 'core:4-offset-a',
        'preset-4-offset-b' => 'core:4-offset-b',
        'preset-3x2-equal' => 'core:3x2-equal',
        'preset-3x2-alternating' => 'core:3x2-alternating',
        'preset-3rows-middle-full' => 'core:3rows-middle-full',
        'preset-top-full-bottom-2' => 'core:top-full-bottom-2',
        'preset-top-2-bottom-full' => 'core:top-2-bottom-full',
        'preset-left-tall-right-stack' => 'core:left-tall-right-stack',
        'preset-right-tall-left-stack' => 'core:right-tall-left-stack',
        'preset-center-tall-side-stacks' => 'core:center-tall-side-stacks'
    ];

    private const CORE_PRESETS = [
        'core:2-equal' => [
            'id' => 'core:2-equal',
            'sort' => 10,
            'labelKey' => 'brick.multiLayout.layout.1',
            'columns' => self::DEFAULT_COLUMNS,
            'defaultSlotWidth' => 6,
            'slots' => [
                ['id' => 'slot-1', 'x' => 0, 'y' => 0, 'w' => 6, 'h' => 1],
                ['id' => 'slot-2', 'x' => 6, 'y' => 0, 'w' => 6, 'h' => 1]
            ]
        ],
        'core:2-left-narrow' => [
            'id' => 'core:2-left-narrow',
            'sort' => 20,
            'labelKey' => 'brick.multiLayout.layout.2',
            'columns' => self::DEFAULT_COLUMNS,
            'defaultSlotWidth' => 6,
            'slots' => [
                ['id' => 'slot-1', 'x' => 0, 'y' => 0, 'w' => 4, 'h' => 1],
                ['id' => 'slot-2', 'x' => 4, 'y' => 0, 'w' => 8, 'h' => 1]
            ]
        ],
        'core:2-right-narrow' => [
            'id' => 'core:2-right-narrow',
            'sort' => 30,
            'labelKey' => 'brick.multiLayout.layout.3',
            'columns' => self::DEFAULT_COLUMNS,
            'defaultSlotWidth' => 6,
            'slots' => [
                ['id' => 'slot-1', 'x' => 0, 'y' => 0, 'w' => 8, 'h' => 1],
                ['id' => 'slot-2', 'x' => 8, 'y' => 0, 'w' => 4, 'h' => 1]
            ]
        ],
        'core:4-equal' => [
            'id' => 'core:4-equal',
            'sort' => 40,
            'labelKey' => 'brick.multiLayout.layout.4',
            'columns' => self::DEFAULT_COLUMNS,
            'defaultSlotWidth' => 6,
            'slots' => [
                ['id' => 'slot-1', 'x' => 0, 'y' => 0, 'w' => 6, 'h' => 1],
                ['id' => 'slot-2', 'x' => 6, 'y' => 0, 'w' => 6, 'h' => 1],
                ['id' => 'slot-3', 'x' => 0, 'y' => 1, 'w' => 6, 'h' => 1],
                ['id' => 'slot-4', 'x' => 6, 'y' => 1, 'w' => 6, 'h' => 1]
            ]
        ],
        'core:4-offset-a' => [
            'id' => 'core:4-offset-a',
            'sort' => 50,
            'labelKey' => 'brick.multiLayout.layout.5',
            'columns' => self::DEFAULT_COLUMNS,
            'defaultSlotWidth' => 6,
            'slots' => [
                ['id' => 'slot-1', 'x' => 0, 'y' => 0, 'w' => 4, 'h' => 1],
                ['id' => 'slot-2', 'x' => 4, 'y' => 0, 'w' => 8, 'h' => 1],
                ['id' => 'slot-3', 'x' => 0, 'y' => 1, 'w' => 8, 'h' => 1],
                ['id' => 'slot-4', 'x' => 8, 'y' => 1, 'w' => 4, 'h' => 1]
            ]
        ],
        'core:4-offset-b' => [
            'id' => 'core:4-offset-b',
            'sort' => 60,
            'labelKey' => 'brick.multiLayout.layout.6',
            'columns' => self::DEFAULT_COLUMNS,
            'defaultSlotWidth' => 6,
            'slots' => [
                ['id' => 'slot-1', 'x' => 0, 'y' => 0, 'w' => 8, 'h' => 1],
                ['id' => 'slot-2', 'x' => 8, 'y' => 0, 'w' => 4, 'h' => 1],
                ['id' => 'slot-3', 'x' => 0, 'y' => 1, 'w' => 4, 'h' => 1],
                ['id' => 'slot-4', 'x' => 4, 'y' => 1, 'w' => 8, 'h' => 1]
            ]
        ],
        'core:3x2-equal' => [
            'id' => 'core:3x2-equal',
            'sort' => 70,
            'labelKey' => 'brick.multiLayout.layout.7',
            'columns' => self::DEFAULT_COLUMNS,
            'defaultSlotWidth' => 4,
            'slots' => [
                ['id' => 'slot-1', 'x' => 0, 'y' => 0, 'w' => 4, 'h' => 1],
                ['id' => 'slot-2', 'x' => 4, 'y' => 0, 'w' => 4, 'h' => 1],
                ['id' => 'slot-3', 'x' => 8, 'y' => 0, 'w' => 4, 'h' => 1],
                ['id' => 'slot-4', 'x' => 0, 'y' => 1, 'w' => 4, 'h' => 1],
                ['id' => 'slot-5', 'x' => 4, 'y' => 1, 'w' => 4, 'h' => 1],
                ['id' => 'slot-6', 'x' => 8, 'y' => 1, 'w' => 4, 'h' => 1]
            ]
        ],
        'core:3x2-alternating' => [
            'id' => 'core:3x2-alternating',
            'sort' => 80,
            'labelKey' => 'brick.multiLayout.layout.8',
            'columns' => self::DEFAULT_COLUMNS,
            'defaultSlotWidth' => 4,
            'slots' => [
                ['id' => 'slot-1', 'x' => 0, 'y' => 0, 'w' => 3, 'h' => 1],
                ['id' => 'slot-2', 'x' => 3, 'y' => 0, 'w' => 6, 'h' => 1],
                ['id' => 'slot-3', 'x' => 9, 'y' => 0, 'w' => 3, 'h' => 1],
                ['id' => 'slot-4', 'x' => 0, 'y' => 1, 'w' => 6, 'h' => 1],
                ['id' => 'slot-5', 'x' => 6, 'y' => 1, 'w' => 3, 'h' => 1],
                ['id' => 'slot-6', 'x' => 9, 'y' => 1, 'w' => 3, 'h' => 1]
            ]
        ],
        'core:3rows-middle-full' => [
            'id' => 'core:3rows-middle-full',
            'sort' => 90,
            'labelKey' => 'brick.multiLayout.layout.9',
            'columns' => self::DEFAULT_COLUMNS,
            'defaultSlotWidth' => 4,
            'slots' => [
                ['id' => 'slot-1', 'x' => 0, 'y' => 0, 'w' => 4, 'h' => 1],
                ['id' => 'slot-2', 'x' => 4, 'y' => 0, 'w' => 4, 'h' => 1],
                ['id' => 'slot-3', 'x' => 8, 'y' => 0, 'w' => 4, 'h' => 1],
                ['id' => 'slot-4', 'x' => 0, 'y' => 1, 'w' => 12, 'h' => 1],
                ['id' => 'slot-5', 'x' => 0, 'y' => 2, 'w' => 4, 'h' => 1],
                ['id' => 'slot-6', 'x' => 4, 'y' => 2, 'w' => 4, 'h' => 1],
                ['id' => 'slot-7', 'x' => 8, 'y' => 2, 'w' => 4, 'h' => 1]
            ]
        ],
        'core:top-full-bottom-2' => [
            'id' => 'core:top-full-bottom-2',
            'sort' => 100,
            'labelKey' => 'brick.multiLayout.layout.10',
            'columns' => self::DEFAULT_COLUMNS,
            'defaultSlotWidth' => 6,
            'slots' => [
                ['id' => 'slot-1', 'x' => 0, 'y' => 0, 'w' => 12, 'h' => 1],
                ['id' => 'slot-2', 'x' => 0, 'y' => 1, 'w' => 6, 'h' => 1],
                ['id' => 'slot-3', 'x' => 6, 'y' => 1, 'w' => 6, 'h' => 1]
            ]
        ],
        'core:top-2-bottom-full' => [
            'id' => 'core:top-2-bottom-full',
            'sort' => 110,
            'labelKey' => 'brick.multiLayout.layout.11',
            'columns' => self::DEFAULT_COLUMNS,
            'defaultSlotWidth' => 6,
            'slots' => [
                ['id' => 'slot-1', 'x' => 0, 'y' => 0, 'w' => 6, 'h' => 1],
                ['id' => 'slot-2', 'x' => 6, 'y' => 0, 'w' => 6, 'h' => 1],
                ['id' => 'slot-3', 'x' => 0, 'y' => 1, 'w' => 12, 'h' => 1]
            ]
        ],
        'core:left-tall-right-stack' => [
            'id' => 'core:left-tall-right-stack',
            'sort' => 120,
            'labelKey' => 'brick.multiLayout.layout.12',
            'columns' => self::DEFAULT_COLUMNS,
            'defaultSlotWidth' => 6,
            'slots' => [
                ['id' => 'slot-1', 'x' => 0, 'y' => 0, 'w' => 6, 'h' => 2],
                ['id' => 'slot-2', 'x' => 6, 'y' => 0, 'w' => 6, 'h' => 1],
                ['id' => 'slot-3', 'x' => 6, 'y' => 1, 'w' => 6, 'h' => 1]
            ]
        ],
        'core:right-tall-left-stack' => [
            'id' => 'core:right-tall-left-stack',
            'sort' => 130,
            'labelKey' => 'brick.multiLayout.layout.13',
            'columns' => self::DEFAULT_COLUMNS,
            'defaultSlotWidth' => 6,
            'slots' => [
                ['id' => 'slot-1', 'x' => 0, 'y' => 0, 'w' => 6, 'h' => 1],
                ['id' => 'slot-2', 'x' => 0, 'y' => 1, 'w' => 6, 'h' => 1],
                ['id' => 'slot-3', 'x' => 6, 'y' => 0, 'w' => 6, 'h' => 2]
            ]
        ],
        'core:center-tall-side-stacks' => [
            'id' => 'core:center-tall-side-stacks',
            'sort' => 140,
            'labelKey' => 'brick.multiLayout.layout.14',
            'columns' => self::DEFAULT_COLUMNS,
            'defaultSlotWidth' => 3,
            'slots' => [
                ['id' => 'slot-1', 'x' => 0, 'y' => 0, 'w' => 3, 'h' => 1],
                ['id' => 'slot-2', 'x' => 0, 'y' => 1, 'w' => 3, 'h' => 1],
                ['id' => 'slot-3', 'x' => 0, 'y' => 2, 'w' => 3, 'h' => 1],
                ['id' => 'slot-4', 'x' => 3, 'y' => 0, 'w' => 6, 'h' => 3],
                ['id' => 'slot-5', 'x' => 9, 'y' => 0, 'w' => 3, 'h' => 1],
                ['id' => 'slot-6', 'x' => 9, 'y' => 1, 'w' => 3, 'h' => 1],
                ['id' => 'slot-7', 'x' => 9, 'y' => 2, 'w' => 3, 'h' => 1]
            ]
        ]
    ];

    public static function getDefaultPresetId(): string
    {
        return self::DEFAULT_PRESET_ID;
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    public static function getCorePresets(): array
    {
        return self::CORE_PRESETS;
    }

    /**
     * @param array<string, array<string, mixed>> $customPresets
     * @return array<string, array<string, mixed>>
     */
    public static function getPresets(array $customPresets = [], string $namespace = ''): array
    {
        $presets = self::CORE_PRESETS;

        foreach ($customPresets as $id => $preset) {
            if (!is_array($preset)) {
                continue;
            }

            $presetId = self::normalizeCustomPresetId(
                isset($preset['id']) && is_string($preset['id']) ? $preset['id'] : (string)$id,
                $namespace
            );

            if ($presetId === '' || array_key_exists($presetId, self::CORE_PRESETS)) {
                continue;
            }

            $preset['id'] = $presetId;
            $presets[$presetId] = $preset;
        }

        return $presets;
    }

    public static function normalizePresetId(mixed $presetId): string
    {
        if (!is_string($presetId) || $presetId === '') {
            return self::DEFAULT_PRESET_ID;
        }

        if (array_key_exists($presetId, self::LEGACY_ALIASES)) {
            return self::LEGACY_ALIASES[$presetId];
        }

        if (array_key_exists($presetId, self::CORE_PRESETS)) {
            return $presetId;
        }

        return self::DEFAULT_PRESET_ID;
    }

    /**
     * @param array<string, array<string, mixed>> $customPresets
     * @return array<string, mixed>
     */
    public static function getPreset(string $presetId, array $customPresets = [], string $namespace = ''): array
    {
        $presets = self::getPresets($customPresets, $namespace);
        $normalizedPresetId = self::normalizePresetId($presetId);

        if (array_key_exists($presetId, $presets)) {
            return $presets[$presetId];
        }

        return $presets[$normalizedPresetId] ?? $presets[self::DEFAULT_PRESET_ID];
    }

    private static function normalizeCustomPresetId(string $presetId, string $namespace): string
    {
        if ($presetId === '') {
            return '';
        }

        if (array_key_exists($presetId, self::LEGACY_ALIASES)) {
            return '';
        }

        if (str_contains($presetId, ':')) {
            return $presetId;
        }

        return $namespace !== '' ? $namespace . ':' . $presetId : '';
    }
}

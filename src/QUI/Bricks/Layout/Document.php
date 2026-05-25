<?php

namespace QUI\Bricks\Layout;

class Document
{
    public static function normalizePresetId(mixed $presetId): string
    {
        return Presets::normalizePresetId($presetId);
    }

    /**
     * @return array<string, mixed>
     */
    public static function getPresetDefinition(string $presetId): array
    {
        return Presets::getPreset($presetId);
    }
}

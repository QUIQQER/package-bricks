<?php

namespace QUI\Bricks\Layout;

use QUI;
use QUI\Control;

use function count;
use function dirname;

class Renderer
{
    /**
     * @param array<string, mixed> $document
     * @param array<int, array<string, mixed>> $areas
     */
    public function render(
        Control $Control,
        array $document,
        array $areas,
        string $documentStyle,
        string $layoutClass = '',
        bool $areaBackgroundEnabled = true
    ): string {
        $Engine = QUI::getTemplateManager()->getEngine();
        $Engine->assign([
            'this' => $Control,
            'layoutDocument' => $document,
            'areas' => $areas,
            'areaCount' => count($areas),
            'desktopColumns' => $document['breakpoints']['desktop']['columns'],
            'documentStyle' => $documentStyle,
            'layoutClass' => $layoutClass,
            'areaBackgroundEnabled' => $areaBackgroundEnabled,
        ]);

        return $Engine->fetch(dirname(__FILE__) . '/Layout.html');
    }
}

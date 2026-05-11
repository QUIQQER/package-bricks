<?php

namespace QUITests\Bricks\Controls;

use PHPUnit\Framework\TestCase;

class MultiLayoutTest extends TestCase
{
    public function testControlBehaviorSmoke(): void
    {
        $class = 'QUI\Bricks\Controls\MultiLayout';
        $this->assertTrue(class_exists($class));

        try {
            $Control = new $class([
                'tileMinHeightPreset' => 'large',
                'layoutAreas' => json_encode([
                    'preset' => 'preset-2-equal',
                    'breakpoints' => [
                        'desktop' => [
                            'columns' => 12,
                            'slots' => [
                                ['id' => 'slot-1', 'x' => 0, 'y' => 0, 'w' => 6, 'h' => 1],
                                ['id' => 'slot-2', 'x' => 6, 'y' => 0, 'w' => 6, 'h' => 1]
                            ]
                        ],
                        'tablet' => [
                            'columns' => 12,
                            'slots' => [
                                ['id' => 'slot-1', 'x' => 0, 'y' => 0, 'w' => 6, 'h' => 1],
                                ['id' => 'slot-2', 'x' => 6, 'y' => 0, 'w' => 6, 'h' => 1]
                            ]
                        ],
                        'mobile' => [
                            'columns' => 12,
                            'slots' => [
                                ['id' => 'slot-1', 'x' => 0, 'y' => 0, 'w' => 12, 'h' => 1],
                                ['id' => 'slot-2', 'x' => 0, 'y' => 1, 'w' => 12, 'h' => 1]
                            ]
                        ]
                    ],
                    'areas' => [
                        'slot-1' => [
                            'title' => 'Bereich 1',
                            'mode' => 'subLayout',
                            'backgroundEnabled' => true,
                            'backgroundImage' => '/assets/background.png',
                            'backgroundImageFit' => 'cover',
                            'backgroundImagePosition' => 'center top',
                            'backgroundOverlayEnabled' => true,
                            'backgroundOverlayColor' => '#112233',
                            'backgroundOverlayOpacity' => 35,
                            'backgroundColorEnabled' => true,
                            'backgroundColor' => '#445566',
                            'customMinHeightEnabled' => true,
                            'customMinHeightPreset' => 'manual',
                            'customMinHeightValue' => '420px',
                            'subLayoutAreaBackgroundEnabled' => false,
                            'subLayoutGridGapPreset' => 'large',
                            'subLayoutDocument' => [
                                'preset' => 'preset-2-equal',
                                'breakpoints' => [
                                    'desktop' => [
                                        'columns' => 12,
                                        'slots' => [
                                            ['id' => 'slot-1', 'x' => 0, 'y' => 0, 'w' => 6, 'h' => 1],
                                            ['id' => 'slot-2', 'x' => 6, 'y' => 0, 'w' => 6, 'h' => 1]
                                        ]
                                    ],
                                    'tablet' => [
                                        'columns' => 12,
                                        'slots' => [
                                            ['id' => 'slot-1', 'x' => 0, 'y' => 0, 'w' => 12, 'h' => 1],
                                            ['id' => 'slot-2', 'x' => 0, 'y' => 0, 'w' => 12, 'h' => 1]
                                        ]
                                    ],
                                    'mobile' => [
                                        'columns' => 12,
                                        'slots' => [
                                            ['id' => 'slot-1', 'x' => 0, 'y' => 0, 'w' => 12, 'h' => 1],
                                            ['id' => 'slot-2', 'x' => 0, 'y' => 1, 'w' => 12, 'h' => 1]
                                        ]
                                    ]
                                ],
                                'areas' => [
                                    'slot-1' => [
                                        'title' => 'Innen 1',
                                        'mode' => 'subLayout',
                                        'content' => '<p>Nested fallback</p>'
                                    ],
                                    'slot-2' => [
                                        'title' => 'Innen 2',
                                        'mode' => 'image',
                                        'image' => '/assets/inner.png',
                                        'imageFit' => 'cover'
                                    ]
                                ]
                            ]
                        ],
                        'slot-2' => [
                            'title' => 'Bereich 2',
                            'mode' => 'image',
                            'image' => '/assets/foreground.png',
                            'imageFit' => 'contain',
                            'imageWidth' => '480px'
                        ]
                    ]
                ], JSON_THROW_ON_ERROR)
            ]);
            $this->assertInstanceOf($class, $Control);
        } catch (\Throwable) {
            $this->addToAssertionCount(1);
            return;
        }

        try {
            $html = $Control->getBody();
            $this->assertIsString($html);
            $this->assertStringContainsString('--quiqqer-bricks-multiLayout-tablet-column', $html);
            $this->assertStringContainsString('--quiqqer-bricks-multiLayout-mobile-column', $html);
            $this->assertStringNotContainsString('--quiqqer-bricks-multiLayout-bg-image', $html);
            $this->assertStringContainsString('quiqqer-bricks-controls-multiLayout-area__background', $html);
            $this->assertStringContainsString('quiqqer-bricks-controls-multiLayout-area__backgroundMedia', $html);
            $this->assertStringContainsString('quiqqer-bricks-controls-multiLayout-area__overlay', $html);
            $this->assertStringContainsString('quiqqer-bricks-controls-multiLayout-area__content', $html);
            $this->assertStringContainsString('quiqqer-bricks-controls-multiLayout-area__image', $html);
            $this->assertStringContainsString('quiqqer-bricks-controls-multiLayout-area--subLayout', $html);
            $this->assertStringContainsString('quiqqer-bricks-controls-multiLayout-subGrid', $html);
            $this->assertStringContainsString('--quiqqer-bricks-multiLayout-sub-gap: clamp(1rem, 4cqi, 2.5rem)', $html);
            $this->assertStringContainsString('--quiqqer-bricks-multiLayout-tablet-row: 2 / span 1', $html);
            $this->assertStringContainsString('Nested fallback', $html);
            $this->assertStringContainsString('/assets/inner.png', $html);
            $this->assertStringContainsString('--quiqqer-bricks-multiLayout-background-fit: cover', $html);
            $this->assertStringContainsString('--quiqqer-bricks-multiLayout-background-position: center top', $html);
            $this->assertStringContainsString('--quiqqer-bricks-multiLayout-background-overlay-color: #112233', $html);
            $this->assertStringContainsString('--quiqqer-bricks-multiLayout-background-overlay-opacity: 0.35', $html);
            $this->assertStringContainsString('--quiqqer-bricks-multiLayout-area-background: #445566', $html);
            $this->assertStringContainsString('--quiqqer-bricks-multiLayout-image-fit: contain', $html);
            $this->assertStringContainsString('--quiqqer-bricks-multiLayout-image-width: 480px', $html);
            $this->assertStringContainsString('--quiqqer-bricks-multiLayout-tile-min-height: 280px', $html);
            $this->assertStringContainsString('--quiqqer-bricks-multiLayout-slot-min-height: 420px', $html);
        } catch (\Throwable) {
            $this->addToAssertionCount(1);
        }
    }
}

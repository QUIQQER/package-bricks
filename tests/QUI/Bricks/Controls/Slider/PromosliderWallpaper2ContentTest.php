<?php

namespace QUITests\Bricks\Controls\Slider;

use PHPUnit\Framework\TestCase;
use QUI\Bricks\Controls\Slider\PromosliderWallpaper2Content;

class PromosliderWallpaper2ContentTest extends TestCase
{
    public function testSlideHandlingAndParseSlides(): void
    {
        $Slider = new class ([]) extends PromosliderWallpaper2Content {
            public function exposeParseSlides(mixed $slides, string $type = 'desktop'): void
            {
                $this->parseSlides($slides, $type);
            }

            public function getDesktopSlides(): array
            {
                return $this->desktopSlides;
            }

            public function getMobileSlides(): array
            {
                return $this->mobileSlides;
            }
        };

        $Slider->addSlide('not-media-url', 'Left', 'Right', false, '/desktop', true);
        $Slider->addMobileSlide('not-media-url', 'Left M', 'Right M', '/mobile', false);

        $this->assertNotEmpty($Slider->getDesktopSlides());
        $this->assertNotEmpty($Slider->getMobileSlides());

        $Slider->exposeParseSlides(json_encode([
            [
                'image' => 'not-media-url',
                'left' => 'L1',
                'right' => 'R1',
                'url' => '/1',
                'newTab' => false
            ],
            [
                'isDisabled' => true
            ]
        ]), 'desktop');

        $Slider->exposeParseSlides([
            [
                'image' => 'not-media-url',
                'left' => 'L2',
                'right' => 'R2',
                'url' => '/2',
                'newTab' => true
            ]
        ], 'mobile');

        $this->assertGreaterThanOrEqual(2, count($Slider->getDesktopSlides()));
        $this->assertGreaterThanOrEqual(2, count($Slider->getMobileSlides()));
    }
}

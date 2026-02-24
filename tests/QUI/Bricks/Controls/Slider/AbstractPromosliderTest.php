<?php

namespace QUITests\Bricks\Controls\Slider;

use PHPUnit\Framework\TestCase;
use QUI\Bricks\Controls\Slider\AbstractPromoslider;

class AbstractPromosliderTest extends TestCase
{
    public function testAddSlideAndParseSlides(): void
    {
        $Slider = new class ([]) extends AbstractPromoslider {
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

        $Slider->addSlide('not-media-url', 'Plain title', 'Text', 'left', '/x', true);
        $Slider->addMobileSlide('not-media-url', 'Plain title', 'Text', '/y', false);

        $desktopSlides = $Slider->getDesktopSlides();
        $mobileSlides = $Slider->getMobileSlides();

        $this->assertNotEmpty($desktopSlides);
        $this->assertNotEmpty($mobileSlides);
        $this->assertSame('quiqqer-bricks-promoslider-slide-left', $desktopSlides[0]['pos']);
        $this->assertFalse($desktopSlides[0]['image']);
        $this->assertFalse($mobileSlides[0]['image']);

        $Slider->exposeParseSlides(json_encode([
            [
                'image' => 'not-media-url',
                'title' => 'A',
                'text' => 'B',
                'type' => 'right',
                'url' => '/z',
                'newTab' => false,
                'isDisabled' => false
            ],
            [
                'isDisabled' => true
            ]
        ]), 'desktop');

        $Slider->exposeParseSlides([
            [
                'image' => 'not-media-url',
                'title' => 'M',
                'text' => 'N',
                'url' => '/m',
                'newTab' => true
            ]
        ], 'mobile');

        $this->assertGreaterThanOrEqual(2, count($Slider->getDesktopSlides()));
        $this->assertGreaterThanOrEqual(2, count($Slider->getMobileSlides()));
    }
}

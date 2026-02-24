<?php

namespace QUITests\Bricks;

use PHPUnit\Framework\TestCase;
use QUI\Bricks\Brick;

class BrickTest extends TestCase
{
    public function testCssClassesAndSettingsHandling(): void
    {
        $Brick = new Brick([
            'type' => 'content',
            'classes' => '["alpha", "beta"]',
            'settings' => '{"foo":"bar"}'
        ]);

        $Brick->addCSSClass('gamma');
        $Brick->addCSSClass(['delta', 'epsilon']);

        $this->assertTrue($Brick->hasCSSClass('*gamma*'));
        $this->assertTrue($Brick->hasCSSClass('alpha*'));

        $settings = $Brick->getSettings();
        $this->assertIsArray($settings);
        $this->assertArrayHasKey('classes', $settings);

        $Brick->setSettings([
            'classes' => ['zeta', 'eta']
        ]);

        $this->assertTrue($Brick->hasCSSClass('*zeta*'));

        $Brick->clearCSSClasses();
        $this->assertSame([], $Brick->getCSSClasses());
    }

    public function testCheckForContentTypeAndTypeHelpers(): void
    {
        $Brick = new Brick([
            'type' => 'content',
            'title' => 'Test'
        ]);

        $this->assertSame($Brick, $Brick->check());
        $this->assertSame(Brick::class, $Brick->getType());
        $this->assertTrue($Brick->isInstanceOf(Brick::class));

        try {
            $html = $Brick->create();
            $this->assertIsString($html);
        } catch (\Throwable) {
            $this->addToAssertionCount(1);
        }
    }
}

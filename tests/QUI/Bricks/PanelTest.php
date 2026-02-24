<?php

namespace QUITests\Bricks;

use PHPUnit\Framework\TestCase;
use QUI\Bricks\Brick;
use QUI\Bricks\Panel;

class PanelTest extends TestCase
{
    public function testProtectedGetPath(): void
    {
        $Panel = Panel::getInstance();

        $Brick = new class extends Brick {
            public function __construct()
            {
            }

            public function getAttribute(string $name): mixed
            {
                if ($name === 'type') {
                    return '\\Vendor\\Package\\Control';
                }

                return null;
            }
        };

        $Reflection = new \ReflectionClass($Panel);
        $method = $Reflection->getMethod('getPath');
        $method->setAccessible(true);

        $path = $method->invoke($Panel, $Brick);

        $this->assertSame('//quiqqer/bricks/brick[@control="\\Vendor\\Package\\Control"]', $path);
    }
}

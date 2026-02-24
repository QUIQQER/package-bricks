<?php

namespace QUITests\Bricks;

use PHPUnit\Framework\TestCase;
use QUI\Bricks\Events;
use Smarty;

class EventsTest extends TestCase
{
    public function testOnSmartyInitRegistersBrickareaPlugin(): void
    {
        $Smarty = new Smarty();

        Events::onSmartyInit($Smarty);

        $this->assertArrayHasKey('function', $Smarty->registered_plugins);
        $this->assertArrayHasKey('brickarea', $Smarty->registered_plugins['function']);
    }

    public function testOnSiteSaveReturnsEarlyIfSiteAlreadySaved(): void
    {
        $Site = $this->createMock(\QUI\Interfaces\Projects\Site::class);
        $Site->method('getId')->willReturn(42);

        $Reflection = new \ReflectionClass(Events::class);
        $savedProperty = $Reflection->getProperty('saved');
        $savedProperty->setAccessible(true);
        $savedProperty->setValue(null, [42 => true]);

        Events::onSiteSave($Site);

        $saved = $savedProperty->getValue();
        $this->assertIsArray($saved);
        $this->assertArrayHasKey(42, $saved);
    }
}

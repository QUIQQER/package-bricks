<?php

namespace QUITests\Bricks\Api;

use InvalidArgumentException;
use PHPUnit\Framework\TestCase;
use QUI\Bricks\Api\BrickService;
use QUI\Bricks\Brick;
use QUI\Bricks\Manager;

class BrickServiceTest extends TestCase
{
    public function testSerializeBrickIncludesApiDetails(): void
    {
        $Brick = new Brick([
            'id' => 17,
            'project' => 'demo',
            'lang' => 'de',
            'title' => 'API brick',
            'type' => 'content',
            'classes' => '["hero", "spacing-large"]',
            'customfields' => '["classes"]'
        ]);
        $Brick->setAttribute('id', 17);

        $result = BrickService::serializeBrick($Brick);

        $this->assertSame(17, $result['id']);
        $this->assertSame('demo', $result['project']);
        $this->assertSame('de', $result['lang']);
        $this->assertSame(['classes'], $result['customfields']);
        $this->assertSame(['hero', 'spacing-large'], $result['cssClasses']);
    }

    public function testUpdateMapsLegacyAttributeClassesToSettings(): void
    {
        $Brick = new Brick([
            'id' => 9,
            'project' => 'demo',
            'lang' => 'en',
            'title' => 'Before',
            'type' => 'content'
        ]);
        $Brick->setAttribute('id', 9);

        $Manager = $this->createMock(Manager::class);
        $Manager->expects($this->exactly(2))
            ->method('getBrickById')
            ->with(9)
            ->willReturn($Brick);
        $Manager->expects($this->once())
            ->method('saveBrick')
            ->with(
                9,
                $this->callback(static function (array $data): bool {
                    return $data['title'] === 'After'
                        && $data['settings']['classes'] === ['hero', 'wide']
                        && !array_key_exists('classes', $data);
                })
            );

        $Service = new BrickService($Manager);
        $result = $Service->update(9, [
            'title' => 'After',
            'classes' => ['hero', 'wide']
        ]);

        $this->assertSame(9, $result['id']);
    }

    public function testDeleteIgnoresInvalidIdsAndReturnsDeletedIds(): void
    {
        $Manager = $this->createMock(Manager::class);
        $Manager->expects($this->exactly(2))
            ->method('deleteBrick')
            ->willReturnCallback(static function (int $id): void {
                self::assertContains($id, [3, 5]);
            });

        $Service = new BrickService($Manager);

        $this->assertSame(
            ['deleted' => [3, 5]],
            $Service->delete([0, 3, 'invalid', '5'])
        );
    }

    public function testGetRejectsInvalidBrickId(): void
    {
        $Service = new BrickService($this->createMock(Manager::class));

        $this->expectException(InvalidArgumentException::class);
        $Service->get(0);
    }

    public function testListBrickTypesAppliesFiltersAndLimit(): void
    {
        $Manager = $this->createMock(Manager::class);
        $Manager->method('getAvailableBricks')->willReturn([
            [
                'control' => 'content',
                'title' => 'Content',
                'description' => 'Rich text',
                'deprecated' => false
            ],
            [
                'control' => 'legacy',
                'title' => 'Legacy',
                'description' => 'Old brick',
                'deprecated' => true
            ]
        ]);

        $Service = new BrickService($Manager);
        $result = $Service->listBrickTypes(false, false, 'rich', 10, 0);

        $this->assertCount(1, $result);
        $this->assertSame('content', $result[0]['control']);
    }
}

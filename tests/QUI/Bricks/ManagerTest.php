<?php

namespace QUITests\Bricks;

use DOMDocument;
use PHPUnit\Framework\TestCase;
use QUI\Bricks\Manager;

class ManagerTest extends TestCase
{
    private string $tmpDir;

    protected function setUp(): void
    {
        parent::setUp();
        $this->tmpDir = sys_get_temp_dir() . '/quiqqer-bricks-manager-tests-' . md5((string)mt_rand());
        mkdir($this->tmpDir, 0777, true);
    }

    protected function tearDown(): void
    {
        parent::tearDown();

        if (is_dir($this->tmpDir)) {
            foreach ((array)scandir($this->tmpDir) as $file) {
                if ($file === '.' || $file === '..') {
                    continue;
                }

                @unlink($this->tmpDir . '/' . $file);
            }

            @rmdir($this->tmpDir);
        }
    }

    public function testInitAndCacheNamespace(): void
    {
        $Manager = Manager::init();

        $this->assertInstanceOf(Manager::class, $Manager);
        $this->assertSame('quiqqer/package/quiqqer/bricks/', Manager::getBrickCacheNamespace());
    }

    public function testParseSettingToBrickArray(): void
    {
        $doc = new DOMDocument();
        $doc->loadXML(<<<'XML'
<setting name="size" type="select" class="SizeControl" data-qui="package/size" data-extra="foo">
  Size
  <description>Size description</description>
  <option value="small">Small</option>
  <option value="large">Large</option>
</setting>
XML
        );

        $node = $doc->getElementsByTagName('setting')->item(0);
        $this->assertNotNull($node);

        $Manager = new class (true) extends Manager {
            public function exposeParseSettingToBrickArray(\DOMNode $Setting): array
            {
                return $this->parseSettingToBrickArray($Setting);
            }
        };

        $result = $Manager->exposeParseSettingToBrickArray($node);

        $this->assertSame('size', $result['name']);
        $this->assertSame('select', $result['type']);
        $this->assertSame('SizeControl', $result['class']);
        $this->assertSame('package/size', $result['data-qui']);
        $this->assertSame('foo', $result['data-attributes']['data-extra']);
        $this->assertSame('Size description', trim((string)$result['description']));
        $this->assertCount(2, $result['options']);
        $this->assertSame('small', $result['options'][0]['value']);
    }
}

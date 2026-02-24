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

    public function testAvailableBricksAndSettingsFromXml(): void
    {
        $xmlFile = $this->tmpDir . '/bricks.xml';
        file_put_contents($xmlFile, <<<'XML'
<?xml version="1.0"?>
<quiqqer>
  <bricks>
    <brick control="\\Vendor\\Control" name="hero">
      <title><locale group="g" var="title"/></title>
      <description><locale group="g" var="description"/></description>
      <settings>
        <setting name="specificSetting" type="text">Specific</setting>
      </settings>
    </brick>
    <brick control="*" name="global">
      <settings>
        <setting name="globalSetting" type="text">Global</setting>
      </settings>
    </brick>
  </bricks>
</quiqqer>
XML
);

        $Manager = new class ($xmlFile) extends Manager {
            public function __construct(private string $xmlFile)
            {
                parent::__construct(true);
            }

            protected function getBricksXMLFiles(): array
            {
                return [$this->xmlFile];
            }
        };

        $bricks = $Manager->getAvailableBricks();
        $this->assertNotEmpty($bricks);

        $controls = array_map(static fn(array $entry): string => (string)$entry['control'], $bricks);
        $this->assertContains('content', $controls);
        $this->assertTrue((bool)array_filter($controls, static function (string $control): bool {
            return str_contains($control, 'Vendor') && str_contains($control, 'Control');
        }));

        $settings = $Manager->getAvailableBrickSettingsByBrickType('\\Vendor\\Control');
        $this->assertNotEmpty($settings);

        $settingNames = array_map(static fn(array $entry): string => (string)$entry['name'], $settings);
        $this->assertContains('width', $settingNames);
        $this->assertContains('height', $settingNames);
        $this->assertContains('classes', $settingNames);
        $this->assertContains('globalSetting', $settingNames);
    }
}

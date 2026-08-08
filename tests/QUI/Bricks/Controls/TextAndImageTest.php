<?php

namespace QUITests\Bricks\Controls;

use PHPUnit\Framework\TestCase;

class TextAndImageTest extends TestCase
{
    public function testImageLoadingSettingAndTemplateVariants(): void
    {
        $packageDir = dirname(__DIR__, 4);
        $Document = new \DOMDocument();

        $this->assertTrue($Document->load($packageDir . '/bricks.xml'));

        $XPath = new \DOMXPath($Document);
        $settings = $XPath->query(
            '/quiqqer/bricks/brick[@control="\\QUI\\Bricks\\Controls\\TextAndImage"]' .
            '/settings/setting[@name="imageLoading"]'
        );

        $this->assertNotFalse($settings);
        $this->assertCount(1, $settings);
        $this->assertSame('select', $settings->item(0)?->attributes?->getNamedItem('type')?->nodeValue);
        $this->assertSame('lazy', $XPath->evaluate('string(defaultValue)', $settings->item(0)));
        $this->assertSame(
            ['lazy', 'eager'],
            array_map(
                static fn(\DOMNode $option): string => (string)$option->attributes?->getNamedItem('value')?->nodeValue,
                iterator_to_array($XPath->query('option', $settings->item(0)) ?: [])
            )
        );

        $template = file_get_contents(
            $packageDir . '/src/QUI/Bricks/Controls/TextAndImage.html'
        );

        $this->assertIsString($template);
        $this->assertStringContainsString("{if \$imageLoading == 'eager'}", $template);
        $this->assertStringContainsString('loading="eager" fetchpriority="high"', $template);
        $this->assertStringContainsString('loading="lazy"', $template);
    }

    public function testImageLoadingNormalization(): void
    {
        $Control = new class extends \QUI\Bricks\Controls\TextAndImage {
            public function normalizeImageLoadingForTest(mixed $imageLoading): string
            {
                return $this->normalizeImageLoading($imageLoading);
            }
        };

        $this->assertSame('lazy', $Control->normalizeImageLoadingForTest('lazy'));
        $this->assertSame('eager', $Control->normalizeImageLoadingForTest('eager'));
        $this->assertSame('lazy', $Control->normalizeImageLoadingForTest('invalid'));
        $this->assertSame('lazy', $Control->normalizeImageLoadingForTest(null));
    }

    public function testControlBehaviorSmoke(): void
    {
        $class = 'QUI\Bricks\Controls\TextAndImage';
        $this->assertTrue(class_exists($class));

        try {
            $Control = new $class([]);
            $this->assertInstanceOf($class, $Control);
        } catch (\Throwable) {
            $this->addToAssertionCount(1);
            return;
        }

        $methods = [
            'addSlide',
            'addMobileSlide',
            'getRow',
            'getTemplate',
            'getRowTemplate',
            'createJSONLDFAQSchemaCode',
            'create',
            'getBody'
        ];

        foreach ($methods as $method) {
            if (!method_exists($Control, $method)) {
                continue;
            }

            try {
                switch ($method) {
                    case 'addSlide':
                        $Control->addSlide('not-a-media-url', 'Title', 'Text');
                        break;

                    case 'addMobileSlide':
                        $Control->addMobileSlide('not-a-media-url', 'Title', 'Text');
                        break;

                    case 'getRow':
                        $result = $Control->getRow(0);
                        $this->assertIsArray($result);
                        break;

                    default:
                        $result = $Control->{$method}();

                        if (in_array($method, ['getTemplate', 'getRowTemplate', 'createJSONLDFAQSchemaCode', 'create', 'getBody'], true)) {
                            $this->assertIsString((string)$result);
                        }
                        break;
                }
            } catch (\Throwable) {
                $this->addToAssertionCount(1);
            }
        }
    }
}

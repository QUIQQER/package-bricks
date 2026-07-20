<?php

namespace QUITests\Bricks\Controls;

use PHPUnit\Framework\TestCase;
use QUI\Bricks\Controls\Image;

class ImageTest extends TestCase
{
    public function testNormalizesSupportedLinks(): void
    {
        $Control = new class extends Image {
            public function normalizeLinkForTest(mixed $link): string
            {
                return $this->normalizeLink($link);
            }
        };

        $this->assertSame(
            'https://www.example.com/path?source=image&area=banner',
            $Control->normalizeLinkForTest(' https://www.example.com/path?source=image&area=banner ')
        );
        $this->assertSame(
            'index.php?project=example&lang=de&id=12',
            $Control->normalizeLinkForTest('index.php?project=example&lang=de&id=12')
        );
    }

    public function testRejectsUnsafeOrMalformedLinks(): void
    {
        $Control = new class extends Image {
            public function normalizeLinkForTest(mixed $link): string
            {
                return $this->normalizeLink($link);
            }
        };

        $links = [
            null,
            'javascript:alert(1)',
            'data:text/html,test',
            'https://',
            "https://example.com/line\nbreak"
        ];

        foreach ($links as $link) {
            $this->assertSame('', $Control->normalizeLinkForTest($link));
        }
    }

    public function testNormalizesLinkAttributes(): void
    {
        $Control = new class extends Image {
            public function normalizeLinkTargetForTest(mixed $target): string
            {
                return $this->normalizeLinkTarget($target);
            }

            public function normalizeLinkRelForTest(mixed $rel, string $target): string
            {
                return $this->normalizeLinkRel($rel, $target);
            }
        };

        $this->assertSame('_blank', $Control->normalizeLinkTargetForTest('_blank'));
        $this->assertSame('', $Control->normalizeLinkTargetForTest('popup'));
        $this->assertSame(
            'nofollow noopener',
            $Control->normalizeLinkRelForTest('nofollow invalid nofollow', '_blank')
        );
        $this->assertSame('sponsored', $Control->normalizeLinkRelForTest('sponsored', ''));
        $this->assertSame('', $Control->normalizeLinkRelForTest('invalid', ''));
    }

    public function testRendersStructuredContentWithoutEmptyImageMarkup(): void
    {
        $Control = new Image([
            'frontendTitle' => '<strong>Bildtitel</strong>',
            'content' => '<p>Inhalt</p>',
            'picture' => '',
            'link' => 'https://www.example.com'
        ]);
        $InvalidImage = new Image([
            'picture' => 'not-a-media-url',
            'link' => 'https://www.example.com'
        ]);
        $body = $Control->getBody();
        $html = $Control->create();
        $invalidImageBody = $InvalidImage->getBody();

        $this->assertStringContainsString(
            '<h2 class="control-header">&lt;strong&gt;Bildtitel&lt;/strong&gt;</h2>',
            $body
        );
        $this->assertStringContainsString('<div class="control-content">', $body);
        $this->assertStringContainsString('<p>Inhalt</p>', $body);
        $this->assertStringNotContainsString('<img', $body);
        $this->assertStringNotContainsString('<a ', $body);
        $this->assertStringNotContainsString('quiqqer-bricks-controls-image__pictureContainer', $body);
        $this->assertStringNotContainsString('<div class="quiqqer-bricks-controls-image">', $body);
        $this->assertStringStartsWith('<section ', $html);
        $this->assertStringContainsString('class="quiqqer-bricks-controls-image"', $html);
        $this->assertSame('', $Control->getAttribute('altText'));
        $this->assertSame('', $Control->getAttribute('imageTitle'));
        $this->assertStringNotContainsString('<img', $invalidImageBody);
        $this->assertStringNotContainsString('<a ', $invalidImageBody);
    }

    public function testImageSettingsAreRegistered(): void
    {
        $Document = new \DOMDocument();
        $this->assertTrue($Document->load(dirname(__DIR__, 4) . '/bricks.xml'));

        $XPath = new \DOMXPath($Document);
        $settings = $XPath->query(
            '/quiqqer/bricks/brick[@control="\\QUI\\Bricks\\Controls\\Image"]' .
            '/settings/setting[@name="link"]'
        );

        $this->assertNotFalse($settings);
        $this->assertCount(1, $settings);
        $this->assertSame('1', $settings->item(0)?->attributes?->getNamedItem('data-external')?->nodeValue);

        foreach (['linkTarget', 'linkRel'] as $settingName) {
            $linkAttributeSettings = $XPath->query(
                '/quiqqer/bricks/brick[@control="\\QUI\\Bricks\\Controls\\Image"]' .
                '/settings/setting[@name="' . $settingName . '"]'
            );

            $this->assertNotFalse($linkAttributeSettings);
            $this->assertCount(1, $linkAttributeSettings);
            $this->assertSame(
                'select',
                $linkAttributeSettings->item(0)?->attributes?->getNamedItem('type')?->nodeValue
            );
        }

        $altTextSettings = $XPath->query(
            '/quiqqer/bricks/brick[@control="\\QUI\\Bricks\\Controls\\Image"]' .
            '/settings/setting[@name="altText"]'
        );

        $this->assertNotFalse($altTextSettings);
        $this->assertCount(1, $altTextSettings);
        $this->assertSame('text', $altTextSettings->item(0)?->attributes?->getNamedItem('type')?->nodeValue);

        $imageTitleSettings = $XPath->query(
            '/quiqqer/bricks/brick[@control="\\QUI\\Bricks\\Controls\\Image"]' .
            '/settings/setting[@name="imageTitle"]'
        );

        $this->assertNotFalse($imageTitleSettings);
        $this->assertCount(1, $imageTitleSettings);
        $this->assertSame('text', $imageTitleSettings->item(0)?->attributes?->getNamedItem('type')?->nodeValue);
    }
}

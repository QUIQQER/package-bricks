<?php

namespace QUITests\Bricks\Controls;

use PHPUnit\Framework\TestCase;
use QUI\Bricks\Controls\Button;

class ButtonTest extends TestCase
{
    public function testDelegatesButtonAttributesToComponent(): void
    {
        $html = (new Button([
            'text' => '<strong>"Go"</strong>',
            'btnType' => 'secondary-outline',
            'size' => 'lg',
        ]))->create();

        $this->assertStringContainsString('class="quiqqer-bricks-button"', $html);
        $this->assertStringContainsString('<button', $html);
        $this->assertStringContainsString('class="btn btn-secondary-outline btn-lg"', $html);
        $this->assertStringContainsString(
            '<span class="btn__text">&lt;strong&gt;&quot;Go&quot;&lt;/strong&gt;</span>',
            $html
        );
        $this->assertStringNotContainsString('<strong>', $html);
    }

    public function testDataAttributesFromEditorAreRenderedWithSinglePrefix(): void
    {
        $html = (new Button([
            'text' => 'Track',
            'dataAttributes' => json_encode([
                ['name' => 'data-track-id', 'value' => '42'],
                ['name' => 'data-label', 'value' => 'primary'],
                ['name' => 'plain', 'value' => 'ignored'],
            ]),
        ]))->create();

        $this->assertStringContainsString('data-track-id="42"', $html);
        $this->assertStringContainsString('data-label="primary"', $html);
        $this->assertStringNotContainsString('data-data-', $html);
        $this->assertStringNotContainsString('ignored', $html);
    }

    public function testDisplayModeIsAppliedPerButton(): void
    {
        $html = (new Button([
            'displayMode' => 'icon-only-rounded',
            'iconClass' => 'fa-solid fa-arrow-right',
            'ariaLabel' => 'Continue',
        ]))->create();

        $this->assertStringContainsString('btn-icon btn-rounded', $html);
        $this->assertStringContainsString('aria-label="Continue"', $html);
        $this->assertStringNotContainsString('btn__text', $html);
    }

    public function testIconClassSettingMapsToButtonIcon(): void
    {
        $html = (new Button([
            'text' => 'Next',
            'iconClass' => 'fa fa-arrow-right',
        ]))->create();

        $this->assertStringContainsString('fa fa-arrow-right btn__icon', $html);
    }

    public function testNonRenderableButtonRendersNoBrickMarkup(): void
    {
        $this->assertSame('', (new Button([
            'displayMode' => 'icon-only',
            'iconClass' => 'fa fa-check',
        ]))->create());
    }

    public function testChildButtonCssIsForwardedToBrick(): void
    {
        $Brick = new Button(['text' => 'Styled']);
        $Brick->create();

        $forwarded = array_filter(
            $Brick->getCSSFiles(),
            static fn(string $file): bool => str_ends_with($file, 'Components/Controls/Button.css')
        );

        $this->assertCount(1, $forwarded);
    }

    public function testBricksXmlRegistersButtonBrickWithDependencyWiring(): void
    {
        $packageDir = dirname(__DIR__, 4);
        $Document = new \DOMDocument();

        $this->assertTrue($Document->load($packageDir . '/bricks.xml'));

        $XPath = new \DOMXPath($Document);
        $base = '/quiqqer/bricks/brick[@control="\\QUI\\Bricks\\Controls\\Button"]';

        $this->assertCount(1, $XPath->query($base) ?: []);

        $openBrickId = $XPath->query($base . '/settings/setting[@name="openBrickId"]');
        $this->assertCount(1, $openBrickId ?: []);
        $this->assertSame(
            'package/quiqqer/bricks/bin/Controls/backend/BrickIdInput',
            $openBrickId?->item(0)?->attributes?->getNamedItem('data-qui')?->nodeValue
        );

        foreach (['openBrickWinWidth', 'openBrickWinHeight', 'openBrickSpacing'] as $name) {
            $node = $XPath->query($base . '/settings/setting[@name="' . $name . '"]')?->item(0);
            $this->assertSame('openBrickId', $node?->attributes?->getNamedItem('data-dependency')?->nodeValue, $name);
            $this->assertSame('*', $node?->attributes?->getNamedItem('data-dependency-options')?->nodeValue, $name);
        }

        $href = $XPath->query($base . '/settings/setting[@name="href"]')?->item(0);
        $this->assertSame('openBrickId', $href?->attributes?->getNamedItem('data-dependency')?->nodeValue);
        $this->assertSame('!*', $href?->attributes?->getNamedItem('data-dependency-options')?->nodeValue);

        $displayOptions = $XPath->query($base . '/settings/setting[@name="displayMode"]/option');
        $this->assertSame(
            ['button', 'icon-only', 'icon-only-rounded'],
            array_map(
                static fn(\DOMNode $option): string => (string)$option->attributes?->getNamedItem('value')?->nodeValue,
                iterator_to_array($displayOptions ?: [])
            )
        );

        $this->assertCount(1, $XPath->query($base . '/settings/setting[@name="size"]') ?: []);

        $dataAttributes = $XPath->query($base . '/settings/setting[@name="dataAttributes"]')?->item(0);
        $this->assertSame(
            'package/quiqqer/components/bin/Controls/DataAttributes',
            $dataAttributes?->attributes?->getNamedItem('data-qui')?->nodeValue
        );
    }
}

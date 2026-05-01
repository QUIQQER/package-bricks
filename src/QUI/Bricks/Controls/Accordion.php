<?php

namespace QUI\Bricks\Controls;

use Exception;
use QUI;
use Seld\JsonLint\JsonParser;

use function is_array;
use function in_array;
use function str_replace;

/**
 * Class Accordion
 */
class Accordion extends QUI\Control
{
    /**
     * [
     *   'entryTitle' => string,
     *   'entryContent' => string
     * ]
     *
     * @var array<string, mixed>
     */
    protected array $entries = [];

    /**
     * constructor
     *
     * @param array<string, mixed> $attributes
     */
    public function __construct(array $attributes = [])
    {
        // default options
        $this->setAttributes([
            'nodeName' => 'section',
            'class' => 'quiqqer-accordion',
            'qui-class' => 'package/quiqqer/bricks/bin/Controls/Accordion',
            'template' => 'default',
            'columns' => 1,
            'iconPosition' => 'right',
            'iconStyle' => 'angle',
            'stayOpen' => false, // if true make accordion items stay open when another item is opened
            'openFirst' => false, // the first entry is initially opened
            'listMaxWidth' => 0, // positive numbers only, 0 disabled this option.
            'entries' => [],
            'useFaqStructuredData' => false
        ]);

        parent::__construct($attributes);

        $this->addCSSFile(dirname(__FILE__) . '/Accordion.css');
    }

    public function getBody(): string
    {
        $Engine = QUI::getTemplateManager()->getEngine();
        $entries = $this->getAttribute('entries');

        if ($this->getAttribute('stayOpen') !== false) {
            $this->setJavaScriptControlOption('stayopen', $this->getAttribute('stayOpen'));
        }

        $maxWidth = false;

        if (intval($this->getAttribute('listMaxWidth')) > 0) {
            $maxWidth = intval($this->getAttribute('listMaxWidth'));
        }

        if (is_string($entries)) {
            $entries = str_replace("\n", "", $entries);

            try {
                $entries = (new JsonParser())->parse($entries, JsonParser::PARSE_TO_ASSOC);
            } catch (Exception $Exception) {
                QUI\System\Log::writeException($Exception);
                $entries = [];
            }
        }

        if (!is_array($entries)) {
            $entries = [];
        }

        $template = $this->getTemplateName();
        $columns = $this->getColumns();
        $iconPosition = $this->getIconPosition();
        $iconStyle = $this->getIconStyle();
        $rotateAngle = $this->getRotateAngle($iconStyle);
        $this->entries = $entries;
        [
            $entriesColumnLeft,
            $entriesColumnRight
        ] = $this->prepareEntriesForRender($entries, $columns);

        $this->setJavaScriptControlOption('rotateangle', $rotateAngle);

        $Engine->assign([
            'this' => $this,
            'columns' => $columns,
            'openFirst' => $this->getAttribute('openFirst'),
            'listMaxWidth' => $maxWidth,
            'entries' => $this->entries,
            'entriesColumnLeft' => $entriesColumnLeft,
            'entriesColumnRight' => $entriesColumnRight,
            'template' => $template,
            'iconPosition' => $iconPosition,
            'iconClass' => $this->getIconClass($iconStyle),
            'rotateAngle' => $rotateAngle,
            'useFaqStructuredData' => $this->getAttribute('useFaqStructuredData')
        ]);

        $this->addCSSFile(dirname(__FILE__) . '/Accordion.' . $template . '.css');

        return $Engine->fetch(dirname(__FILE__) . '/' . $this->getResolvedTemplateFile($template) . '.html');
    }

    /**
     * Generate JSON-LD FAQ Schema Code
     *
     * @return string
     */
    public function createJSONLDFAQSchemaCode(): string
    {
        $Engine = QUI::getTemplateManager()->getEngine();

        if (empty($this->entries)) {
            $this->entries = $this->getAttribute('entries');
        }

        if (empty($this->entries)) {
            return '';
        }

        $Engine->assign([
            'this' => $this,
            'entries' => $this->entries
        ]);

        return $Engine->fetch(dirname(__FILE__) . '/Accordion.JSON-LD-Schema.html');
    }

    protected function getTemplateName(): string
    {
        $template = $this->getAttribute('template');

        if (!is_string($template)) {
            return 'default';
        }

        if (
            !in_array($template, [
                'default',
                'simple',
                'boxOutline',
                'boxOutlineAccent',
                'boxOutlineTextColor',
                'boxFill',
                'boxFillSubtle',
                'softCard',
                'softCardFill'
            ], true)
        ) {
            return 'default';
        }

        return $template;
    }

    protected function getIconPosition(): string
    {
        $iconPosition = $this->getAttribute('iconPosition');

        if (!is_string($iconPosition)) {
            return 'right';
        }

        if (!in_array($iconPosition, ['left', 'right'], true)) {
            return 'right';
        }

        return $iconPosition;
    }

    protected function getColumns(): int
    {
        return (int)$this->getAttribute('columns') === 2 ? 2 : 1;
    }

    protected function getResolvedTemplateFile(string $template): string
    {
        return match ($template) {
            'boxOutlineAccent', 'boxOutlineTextColor' => 'Accordion.boxOutline',
            'boxFillSubtle' => 'Accordion.boxFill',
            'softCardFill' => 'Accordion.softCard',
            'simple' => 'Accordion.default',
            default => 'Accordion.' . $template
        };
    }

    protected function getIconStyle(): string
    {
        $iconStyle = $this->getAttribute('iconStyle');

        if (!is_string($iconStyle)) {
            return 'angle';
        }

        if (!in_array($iconStyle, ['angle', 'plus'], true)) {
            return 'angle';
        }

        return $iconStyle;
    }

    protected function getIconClass(string $iconStyle): string
    {
        return match ($iconStyle) {
            'plus' => 'fa-plus',
            default => 'fa-angle-down'
        };
    }

    protected function getRotateAngle(string $iconStyle): int
    {
        return match ($iconStyle) {
            'plus' => 45,
            default => 180
        };
    }

    /**
     * @param array<int|string, mixed> $entries
     * @return array{
     *     0: array<int, array{index: int, entry: mixed}>,
     *     1: array<int, array{index: int, entry: mixed}>
     * }
     */
    protected function prepareEntriesForRender(array $entries, int $columns): array
    {
        $preparedEntries = [];

        foreach (array_values($entries) as $index => $entry) {
            $preparedEntries[] = [
                'index' => $index,
                'entry' => $entry
            ];
        }

        if ($columns !== 2) {
            return [$preparedEntries, []];
        }

        $splitAt = (int)ceil(count($preparedEntries) / 2);

        return [
            array_slice($preparedEntries, 0, $splitAt),
            array_slice($preparedEntries, $splitAt)
        ];
    }
}

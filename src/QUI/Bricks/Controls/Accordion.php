<?php

namespace QUI\Bricks\Controls;

use Exception;
use QUI;
use Seld\JsonLint\JsonParser;

use function is_array;
use function str_replace;

/**
 * Class Accordion
 *
 * @package quiqqer/bricks
 */
class Accordion extends QUI\Control
{
    /**
     * [
     *   'entryTitle'   => string,
     *   'entryContent' => string
     * ]
     *
     * @var array
     */
    protected array $entries = [];

    /**
     * constructor
     *
     * @param array $attributes
     */
    public function __construct(array $attributes = [])
    {
        // default options
        $this->setAttributes([
            'nodeName' => 'section',
            'class' => 'quiqqer-accordion',
            'qui-class' => 'package/quiqqer/bricks/bin/Controls/Accordion',
            'stayOpen' => false, // if true make accordion items stay open when another item is opened
            'openFirst' => false, // the first entry is initially opened
            'listMaxWidth' => 0, // positive numbers only, 0 disabled this option.
            'entries' => [],
            'useFaqStructuredData' => false
        ]);

        parent::__construct($attributes);

        $this->addCSSFile(
            dirname(__FILE__) . '/Accordion.css'
        );
    }

    /**
     * @see \QUI\Control::create()
     */
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

        $this->entries = $entries;

        $Engine->assign([
            'this' => $this,
            'openFirst' => $this->getAttribute('openFirst'),
            'listMaxWidth' => $maxWidth,
            'entries' => $this->entries,
            'useFaqStructuredData' => $this->getAttribute('useFaqStructuredData')
        ]);

        return $Engine->fetch(dirname(__FILE__) . '/Accordion.html');
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
}

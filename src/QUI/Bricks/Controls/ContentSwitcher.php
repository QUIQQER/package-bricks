<?php

/**
 * This file contains QUI\Bricks\Controls\ContentSwitcher
 */

namespace QUI\Bricks\Controls;

use QUI;

use function dirname;
use function is_string;
use function json_decode;

/**
 * Class ContentSwitcher
 *
 * @package quiqqer/bricks
 */
class ContentSwitcher extends QUI\Control
{
    /**
     * constructor
     *
     * @param array $attributes
     */
    public function __construct(array $attributes = [])
    {
        // default options
        $this->setAttributes([
            'title' => 'Content Switcher',
            'contentList' => false,
            'entries' => []
        ]);

        parent::__construct($attributes);

        $this->addCSSFile(
            dirname(__FILE__) . '/ContentSwitcher.css'
        );
    }

    /**
     * (non-PHPdoc)
     *
     * @see \QUI\Control::create()
     */
    public function getBody(): string
    {
        $Engine = QUI::getTemplateManager()->getEngine();
        $entries = $this->getAttribute('entries');

        if (is_string($entries)) {
            $entries = json_decode($entries, true);
        }

        $Engine->assign([
            'this' => $this,
            'entries' => $entries
        ]);

        return $Engine->fetch(dirname(__FILE__) . '/ContentSwitcher.html');
    }
}

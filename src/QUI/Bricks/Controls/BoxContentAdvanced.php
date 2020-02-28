<?php

/**
 * This file contains QUI\Bricks\Controls\BoxContentAdvanced
 */

namespace QUI\Bricks\Controls;

use QUI;

/**
 * Class BoxContentAdvanced
 *
 * @package quiqqer/bricks
 */
class BoxContentAdvanced extends QUI\Control
{
    /**
     * constructor
     *
     * @param array $attributes
     */
    public function __construct($attributes = [])
    {
        // default options
        $this->setAttributes([
            'title'          => 'Box Content Advanced',
            'entriesPerLine' => 3,
            'template'       => 'standard',
            'entries'        => []
        ]);

        parent::__construct($attributes);

        $this->addCSSFile(
            dirname(__FILE__) . '/BoxContentAdvanced.css'
        );
    }

    /**
     * (non-PHPdoc)
     *
     * @see \QUI\Control::create()
     */
    public function getBody()
    {
        $Engine  = QUI::getTemplateManager()->getEngine();
        $entries = $this->getAttribute('entries');

        if (is_string($entries)) {
            $entries = json_decode($entries, true);
        }

        $Engine->assign([
            'entries'        => $entries,
            'entriesPerLine' => '-' . $this->getAttribute('entriesPerLine')
        ]);

        $entriesTemplate = $Engine->fetch(dirname(__FILE__) . '/BoxContentAdvanced.standard.html');

        $Engine->assign([
            'this'            => $this,
            'entriesTemplate' => $entriesTemplate
        ]);

        return $Engine->fetch(dirname(__FILE__) . '/BoxContentAdvanced.html');
    }
}

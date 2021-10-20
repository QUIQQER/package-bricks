<?php

/**
 * This file contains QUI\Bricks\Controls\Accordion
 */

namespace QUI\Bricks\Controls;

use QUI;

/**
 * Class Accordion
 *
 * @package quiqqer/bricks
 */
class Accordion extends QUI\Control
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
            'nodeName'     => 'section',
            'class'        => 'quiqqer-accordion',
            'qui-class'    => 'package/quiqqer/bricks/bin/Controls/Accordion',
            'stayOpen'     => false, // if true make accordion items stay open when another item is opened
            'openFirst'    => false, // the first entry is initially opened
            'listMaxWidth' => 0, // positive numbers only, 0 disabled this option.
            'entries'      => []
        ]);

        parent::__construct($attributes);

        $this->addCSSFile(
            dirname(__FILE__).'/Accordion.css'
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

        if ($this->getAttribute('stayOpen') !== false) {
            $this->setJavaScriptControlOption('stayopen', $this->getAttribute('stayOpen'));
        }

        $maxWidth = false;

        if (intval($this->getAttribute('listMaxWidth')) > 0) {
            $maxWidth = intval($this->getAttribute('listMaxWidth'));
        }

        if (is_string($entries)) {
            $entries = json_decode($entries, true);
        }

        $Engine->assign([
            'this'         => $this,
            'openFirst'    => $this->getAttribute('openFirst'),
            'listMaxWidth' => $maxWidth,
            'entries'      => $entries
        ]);

        return $Engine->fetch(dirname(__FILE__).'/Accordion.html');
    }
}

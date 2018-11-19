<?php

/**
 * This file contains QUI\Bricks\Controls\ContentSwitcher
 */

namespace QUI\Bricks\Controls;

use QUI;

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
    public function __construct($attributes = array())
    {
        // default options
        $this->setAttributes(array(
            'title'       => 'Content Switcher',
            'contentList' => false,
            'entries'     => array()
        ));

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
    public function getBody()
    {
        $Engine  = QUI::getTemplateManager()->getEngine();
        $entries = $this->getAttribute('entries');

        if (is_string($entries)) {
            $entries = json_decode($entries, true);
        }

        $Engine->assign(array(
            'this'    => $this,
            'entries' => $entries
        ));

        return $Engine->fetch(dirname(__FILE__) . '/ContentSwitcher.html');
    }
}

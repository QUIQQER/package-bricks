<?php

/**
 * This file contains QUI\Bricks\Controls\Banner
 */

namespace QUI\Bricks\Controls;

use QUI;

/**
 * Class Banner
 *
 * @package quiqqer/bricks
 */
class Banner extends QUI\Control
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
            'title' => '',
            'text' => '',
            'class' => 'quiqqer-bricks-banner',
            'nodeName' => 'section'
        ]);

        parent::__construct($attributes);

        $this->addCSSFile(
            dirname(__FILE__) . '/Banner.css'
        );
    }

    /**
     * (non-PHPdoc)
     *
     * @see \QUI\Control::create()
     */
    public function getBody()
    {
        $Engine = QUI::getTemplateManager()->getEngine();

        $Engine->assign([
            'this' => $this
        ]);

        return $Engine->fetch(dirname(__FILE__) . '/Banner.html');
    }
}

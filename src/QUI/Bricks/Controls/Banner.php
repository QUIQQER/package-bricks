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
    public function __construct($attributes = array())
    {
        // default options
        $this->setAttributes(array(
            'title'    => '',
            'text'     => '',
            'class'    => 'quiqqer-bricks-banner',
            'nodeName' => 'section'
        ));

        $this->addCSSFile(
            dirname(__FILE__).'/Banner.css'
        );

        parent::__construct($attributes);
    }

    /**
     * (non-PHPdoc)
     *
     * @see \QUI\Control::create()
     */
    public function getBody()
    {
        $Engine = QUI::getTemplateManager()->getEngine();

        $Engine->assign(array(
            'this' => $this
        ));

        return $Engine->fetch(dirname(__FILE__).'/Banner.html');
    }
}

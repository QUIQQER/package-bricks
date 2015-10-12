<?php

/**
 * This file contains QUI\Bricks\Controls\GoogleMaps
 */

namespace QUI\Bricks\Controls;

use QUI;

/**
 * Class GoogleMaps
 *
 * @package quiqqer/bricks
 */
class GoogleMaps extends QUI\Control
{
    /**
     * constructor
     *
     * @param Array $attributes
     */
    public function __construct($attributes = array())
    {
        // default options
        $this->setAttributes(array(
            'title'    => '',
            'text'     => '',
            'class'    => 'quiqqer-bricks-googlemaps',
            'nodeName' => 'section'
        ));

        $this->addCSSFile(
            dirname(__FILE__).'/GoogleMaps.css'
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

        return $Engine->fetch(dirname(__FILE__).'/GoogleMaps.html');
    }
}
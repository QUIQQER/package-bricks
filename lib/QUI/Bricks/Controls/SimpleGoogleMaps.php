<?php

/**
 * This file contains QUI\Bricks\Controls\SimpleGoogleMaps
 */

namespace QUI\Bricks\Controls;

use QUI;

/**
 * Class SimpleGoogleMaps
 *
 * @package quiqqer/bricks
 */
class SimpleGoogleMaps extends QUI\Control
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
            'title' => ''
        ));

        parent::__construct($attributes);

        $this->addCSSFile(
            dirname(__FILE__) . '/SimpleGoogleMaps.css'
        );
    }

    /**
     * (non-PHPdoc)
     *
     * @see \QUI\Control::create()
     */
    public function getBody()
    {
        $Engine      = QUI::getTemplateManager()->getEngine();
        $brickTitle  = $this->getAttribute('title');
        $brickStreet = $this->getAttribute('street');
        $brickZip    = $this->getAttribute('zip');
        $brickCity   = $this->getAttribute('city');

        $query = http_build_query(array(
            'key' => trim($this->getAttribute('api')),
            'q'   => "{$brickTitle},{$brickZip},{$brickStreet},{$brickCity}"
        ));

        $url = 'https://www.google.com/maps/embed/v1/place?' . $query;

        $Engine->assign(array(
            'url' => $url
        ));

        return $Engine->fetch(dirname(__FILE__) . '/SimpleGoogleMaps.html');
    }
}

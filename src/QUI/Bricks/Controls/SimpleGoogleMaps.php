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
     * @param array $attributes
     */
    public function __construct($attributes = [])
    {
        // default options
        $this->setAttributes([
            'title'          => '',
            'preventLoadMap' => false
        ]);

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
        $Engine         = QUI::getTemplateManager()->getEngine();
        $brickPlace     = $this->getAttribute('place');
        $brickZip       = $this->getAttribute('zip');
        $brickStreet    = $this->getAttribute('street');
        $brickCity      = $this->getAttribute('city');
        $zoom           = $this->getAttribute('zoom');
        $preventLoadMap = $this->getAttribute('preventLoadMap');

        if (!$zoom) {
            $zoom = 15;
        }

        $query = http_build_query([
            'key' => trim($this->getAttribute('api')),
            'q'   => "{$brickPlace},{$brickZip},{$brickStreet},{$brickCity}"
        ]);

        $url = 'https://www.google.com/maps/embed/v1/place?' . $query . "&zoom=" . $zoom;

        if ($preventLoadMap) {
            $imgUrl = URL_OPT_DIR . 'quiqqer/bricks/bin/images/SimpleGoogleMapsBackground1.png';

            $this->setAttributes([
                'qui-class'       => "package/quiqqer/bricks/bin/Controls/SimpleGoogleMaps",
                'data-qui-url'    => $url,
                'data-qui-imgUrl' => $imgUrl
            ]);
        }

        $Engine->assign([
            'this'           => $this,
            'url'            => $url,
            'preventLoadMap' => $preventLoadMap
        ]);

        return $Engine->fetch(dirname(__FILE__) . '/SimpleGoogleMaps.html');
    }
}

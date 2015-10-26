<?php

/**
 * This file contains QUI\Bricks\Controls\Image
 */

namespace QUI\Bricks\Controls;

use QUI;

/**
 * Class Image
 *
 * @package quiqqer/bricks
 */


class Image extends QUI\Control
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
            'title'       => 'Image Brick',
            'contentList' => false,
            'entries'     => array()
        ));

        parent::__construct($attributes);

        $this->addCSSFile(
            dirname(__FILE__) . '/Image.css'
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
        $entries = $this->getAttribute('entries');
        $brickImage = $this->getAttribute('picture');

        $Engine->assign(array(
            'this'      => $this,
            'entries'   => $entries,
            'brickImag' => $brickImage
        ));


        return $Engine->fetch(dirname(__FILE__).'/Image.html');
    }
}





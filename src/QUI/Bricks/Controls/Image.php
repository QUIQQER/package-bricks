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
     * @param array $attributes
     */
    public function __construct(array $attributes = [])
    {
        // default options
        $this->setAttributes([
            'title' => 'Image Brick',
            'contentList' => false
        ]);

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
    public function getBody(): string
    {
        $Engine = QUI::getTemplateManager()->getEngine();
        $brickImage = $this->getAttribute('picture');
        $brickLink = $this->getAttribute('link');

        $Engine->assign([
            'this' => $this,
            'brickImage' => $brickImage,
            'brickLink' => $brickLink
        ]);


        return $Engine->fetch(dirname(__FILE__) . '/Image.html');
    }
}

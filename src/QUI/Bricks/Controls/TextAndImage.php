<?php

/**
 * This file contains \QUI\Bricks\Controls\TextAndImage
 */

namespace QUI\Bricks\Controls;

use QUI;

/**
 * Class TextAndImage
 *
 * @package quiqqer/bricks
 */
class TextAndImage extends QUI\Control
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
            'image'         => false,
            'maxImageWidth' => false,
            'imageRight'    => false,
            'textPosition'  => 'top' // top, center, bottom
        ]);

        parent::__construct($attributes);

        $this->addCSSFile(
            dirname(__FILE__) . '/TextAndImage.css'
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

        // text position
        switch ($this->getAttribute('textPosition')) {
            case 'center':
                $textPosition = 'center';
                break;

            case 'bottom':
                $textPosition = 'bottom';
                break;

            case 'top':
            default:
                $textPosition = 'flex-start';
        }

        $Engine->assign([
            'this'              => $this,
            'img'               => $this->getAttribute('image'),
            'maxImageWidth'     => intval($this->getAttribute('maxImageWidth')),
            'imageOnLeft'       => $this->getAttribute('imageOnLeft'),
            'imageAsBackground' => $this->getAttribute('imageAsBackground'),
            'textPosition'      => $textPosition
        ]);

        return $Engine->fetch(dirname(__FILE__) . '/TextAndImage.html');
    }
}

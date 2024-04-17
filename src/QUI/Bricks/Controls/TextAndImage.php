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
            'image' => false,
            'maxImageWidth' => false,
            'imageRight' => false,
            'imageShadow' => false,
            'fullImageHeight' => false,
            'textPosition' => 'top', // top, center, bottom
            'textImageRatio' => 50, // 30,35,40,45,50,55,60,65,70
            'imageZoom' => false
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
    public function getBody(): string
    {
        $Engine = QUI::getTemplateManager()->getEngine();

        // text position
        switch ($this->getAttribute('textPosition')) {
            case 'center':
                $textPosition = 'center';
                break;

            case 'bottom':
                $textPosition = 'flex-end';
                break;

            case 'top':
            default:
                $textPosition = 'flex-start';
        }

        /* text width */
        $textWidthClass = 'grid-50';
        $imgWidthClass = 'grid-50';

        if ($this->getAttribute('textImageRatio')) {
            $textWidth = intval($this->getAttribute('textImageRatio'));


            if ($textWidth > 0 && $textWidth < 100) {
                $imgWidth = 100 - $textWidth;
                $textWidthClass = 'grid-' . $textWidth;
                $imgWidthClass = 'grid-' . $imgWidth;
            }
        }

        $shadow = '';
        if ($this->getAttribute('imageShadow')) {
            $shadow = 'shadow-xl';
        }

        $fullImageHeight = '';
        if ($this->getAttribute('fullImageHeight')) {
            $fullImageHeight = 'quiqqer-textImage-image__fullImageHeight';
        }

        $maxImageWidth = false;
        if (intval($this->getAttribute('maxImageWidth')) > 0) {
            $maxImageWidth = intval($this->getAttribute('maxImageWidth'));
        }

        // zoom
        $imageZoom = 0;
        if (
            $this->getAttribute('imageZoom') &&
            QUI::getPackageManager()->isInstalled('quiqqer/gallery')
        ) {
            $imageZoom = 1;
        }

        $Engine->assign([
            'this' => $this,
            'img' => $this->getAttribute('image'),
            'maxImageWidth' => $maxImageWidth,
            'imageOnLeft' => $this->getAttribute('imageOnLeft'),
            'imageShadow' => $shadow,
            'fullImageHeight' => $fullImageHeight,
            'imageAsBackground' => $this->getAttribute('imageAsBackground'),
            'textPosition' => $textPosition,
            'textWidthClass' => $textWidthClass,
            'imgWidthClass' => $imgWidthClass,
            'imageZoom' => $imageZoom
        ]);

        return $Engine->fetch(dirname(__FILE__) . '/TextAndImage.html');
    }
}

<?php

/**
 * This file contains \QUI\Bricks\Controls\TextAndImageMultiple
 */

namespace QUI\Bricks\Controls;

use QUI;

/**
 * Class TextAndImageMultiple
 *
 * @package quiqqer/bricks
 */
class TextAndImageMultiple extends QUI\Control
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
            'textPosition'  => 'top',
            'imagePosition' => 'imageLeft',
            'textRatio'     => false,
            'maxImageWidth' => false,
            'title'         => false,
            'text'          => false,
            'image'         => false,
        ]);

        parent::__construct($attributes);

        $this->addCSSFile(
            dirname(__FILE__) . '/TextAndImageMultiple.css'
        );
    }

    /**
     * (non-PHPdoc)
     *
     * @see \QUI\Control::create()
     */
    public function getBody()
    {
        $Engine        = QUI::getTemplateManager()->getEngine();
        $entries       = json_decode($this->getAttribute('entries'), true);
        $textRatio     = $this->getAttribute('textRatio');
        $imagePosition = $this->getAttribute('imagePosition');
        $imageOnLeft   = true;

        $html = '';

        if ($imagePosition === "imageLeft" ||
            $imagePosition === "imageLeftAlternately") {
            $imageOnLeft = true;
        }

        if ($imagePosition === "imageRight" ||
            $imagePosition === "imageRightAlternately") {
            $imageOnLeft = false;
        }

        foreach ($entries as $entry) {
            if ($entry['isDisabled'] === 1) {
                continue;
            }

            $fullImageHeight = '';

            if ($this->getAttribute('fullImageHeight')) {
                $fullImageHeight = 'quiqqer-textImage-image__fullImageHeight';
            }

            $TextAndImage = new QUI\Bricks\Controls\TextAndImage([
                'image'           => $entry['image'],
                'maxImageWidth'   => $this->getAttribute('maxImageWidth'),
                'imageOnLeft'     => $imageOnLeft,
                'fullImageHeight' => $fullImageHeight,
                'textPosition'    => $this->getAttribute('textPosition'),
                'textImageRatio'  => $textRatio,
                'content'         => $entry['text']
            ]);

            $TextAndImage->addCSSClass('textImageMultiple');

            $html .= $TextAndImage->create();

            $this->addCSSFiles($TextAndImage->getCSSFiles());

            if ($imagePosition === "imageLeftAlternately" ||
                $imagePosition === "imageRightAlternately") {
                $imageOnLeft = !$imageOnLeft;
            }
        }

        $Engine->assign([
            'this' => $this,
            'html' => $html
        ]);

        return $Engine->fetch(dirname(__FILE__) . '/TextAndImageMultiple.html');
    }
}

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
            'textPosition' => 'top',
//            'imagePosition' => 'left',
            'textRatio' => false,
            'maxImageWidth'   => false,
            'title' => false,
            'text' => false,
            'image' => false,
        ]);

        parent::__construct($attributes);

        $this->addCSSFile(
            dirname(__FILE__).'/TextAndImageMultiple.css'
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
        $entries = json_decode($this->getAttribute('entries'), true);
        $textRatio = $this->getAttribute('textRatio');
        $imagePosition = $this->getAttribute('imagePosition');

        $html = '';

        foreach ($entries as $key=>$entry) {

            if ($entry['isDisabled'] === 1) {
                continue;
            }

            switch ($imagePosition) {
                case "imageLeft":
                    $imageOnLeft = true;
                    break;

                case "imageRight":
                    $imageOnLeft = false;
                    break;

                case "imageLeftAlternately":
                    $imageOnLeft = true;

                    if($key % 2 !== 0) {
                        $imageOnLeft = false;
                    }
                    break;

                case "imageRightAlternately":
                    $imageOnLeft = false;

                    if($key % 2 !== 0) {
                        $imageOnLeft = true;
                    }
                    break;
            }

            $fullImageHeight = '';
            if ($this->getAttribute('fullImageHeight')) {
                $fullImageHeight = 'quiqqer-textImage-image__fullImageHeight';
            }

            $TextAndImage = new QUI\Bricks\Controls\TextAndImage();
            $TextAndImage->setAttribute('image', $entry['image']);
            $TextAndImage->setAttribute('maxImageWidth', $this->getAttribute('maxImageWidth'));
            $TextAndImage->setAttribute('imageOnLeft', $imageOnLeft);
            $TextAndImage->setAttribute('fullImageHeight', $fullImageHeight);
            $TextAndImage->setAttribute('textPosition', $this->getAttribute('textPosition'));
            $TextAndImage->setAttribute('textImageRatio', $textRatio);
            $TextAndImage->setAttribute('content', $entry['text']);

            $TextAndImage->addCSSClass('textImageMultiple');

            $html .= $TextAndImage->create();

            $this->addCSSFiles($TextAndImage->getCSSFiles());
        }

        return $html;
    }
}

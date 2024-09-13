<?php

/**
 * This file contains \QUI\Bricks\Controls\TextAndImageMultiple
 */

namespace QUI\Bricks\Controls;

use Exception;
use QUI;

/**
 * Class TextAndImageMultiple
 *
 * @author  Dominik Chrzanowski
 * @package quiqqer/bricks
 */
class TextAndImageMultiple extends QUI\Control
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
            'textPosition' => 'top',
            'imagePosition' => 'imageLeft',
            'textRatio' => false,
            'maxImageWidth' => false,
            'title' => false,
            'text' => false,
            'image' => false,
            'imageZoom' => false
        ]);

        parent::__construct($attributes);

        $this->addCSSFile(
            dirname(__FILE__) . '/TextAndImageMultiple.css'
        );
    }

    /**
     * @return string
     * @throws Exception
     */
    public function getBody(): string
    {
        $Engine = QUI::getTemplateManager()->getEngine();
        $entries = json_decode($this->getAttribute('entries'), true);
        $textRatio = $this->getAttribute('textRatio');
        $imagePosition = $this->getAttribute('imagePosition');
        $imageOnLeft = true;

        if (!$entries) {
            QUI\System\Log::addNotice(
                'QUI\Bricks\Controls\Slider\CustomerReviewsSlider - No entries founded. 
packages/quiqqer/bricks/src/QUI/Bricks/Controls/TextAndImageMultiple.php'
            );

            return '';
        }

        $html = '';

        if (
            $imagePosition === "imageLeft" ||
            $imagePosition === "imageLeftAlternately"
        ) {
            $imageOnLeft = true;
        }

        if (
            $imagePosition === "imageRight" ||
            $imagePosition === "imageRightAlternately"
        ) {
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
                'image' => $entry['image'],
                'maxImageWidth' => $this->getAttribute('maxImageWidth'),
                'imageOnLeft' => $imageOnLeft,
                'fullImageHeight' => $fullImageHeight,
                'textPosition' => $this->getAttribute('textPosition'),
                'textImageRatio' => $textRatio,
                'content' => $entry['text'],
                'imageZoom' => $this->getAttribute('imageZoom')
            ]);

            $TextAndImage->addCSSClass('grid-container');

            $html .= '<div class="quiqqer-textImageMultiple">' . $TextAndImage->create() . '</div>';

            $this->addCSSFiles($TextAndImage->getCSSFiles());

            if (
                $imagePosition === "imageLeftAlternately" ||
                $imagePosition === "imageRightAlternately"
            ) {
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

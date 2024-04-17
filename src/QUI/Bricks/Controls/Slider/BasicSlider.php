<?php

/**
 * This file contains QUI\Bricks\Controls\Slider\BasicSlider
 */

namespace QUI\Bricks\Controls\Slider;

use QUI;
use QUI\Projects\Media\Folder;

use function dirname;

/**
 * Class BrickSlider
 *
 * @author  Dominik Chrzanowski
 * @package QUI\Bricks\Controls
 */
class BasicSlider extends QUI\Control
{
    public function __construct($attributes = [])
    {
        // default options
        $this->setAttributes([
            'title' => '',
            'text' => '',
            'mediaFolder' => false,
            'delay' => 7000,
            'imgLeft' => false,
            'maxImageWidth' => false,
            'sliderContent' => '',
            'class' => 'quiqqer-bricks-basic-slider',
            'nodeName' => 'section',
            'data-qui' => 'package/quiqqer/bricks/bin/Controls/Slider/BasicSlider',
            'dotsNav' => false,
        ]);

        parent::__construct($attributes);

        $this->addCSSFile(
            dirname(__FILE__) . '/BasicSlider.css'
        );
    }


    public function getBody(): string
    {
        $Engine = QUI::getTemplateManager()->getEngine();

        $mediaFolder = $this->getAttribute('mediaFolder');
        $Folder = false;
        $images = [];
        $sliderContent = $this->getAttribute('sliderContent');
        $imgLeft = false;
        $dotsNav = false;

        if (!$mediaFolder) {
            return '';
        }

        if (!$sliderContent) {
            return '';
        }

        /* @var $Folder Folder */
        if (str_contains($mediaFolder, 'image.php')) {
            try {
                $Folder = QUI\Projects\Media\Utils::getMediaItemByUrl(
                    $mediaFolder
                );
            } catch (QUI\Exception) {
                $Folder = false;
            }
        }

        if ($Folder) {
            $images = $Folder->getImages();
        } elseif (!empty($this->ownImages)) {
            $images = $this->ownImages;
        }

        $delay = 5000;
        if (intval($this->getAttribute('delay')) > 0) {
            $delay = $this->getAttribute('delay');
        }

        $this->setJavaScriptControlOption('delay', $delay);

        if ($this->getAttribute('imgLeft')) {
            $imgLeft = $this->getAttribute('imgLeft');
        }

        $maxImageWidth = false;
        if (intval($this->getAttribute('maxImageWidth')) > 0) {
            $maxImageWidth = intval($this->getAttribute('maxImageWidth'));
        }

        $dotsNav = $this->getAttribute('navigationDotsShow');

        // text position
        $textPosition = match ($this->getAttribute('textPosition')) {
            'center' => 'center',
            'bottom' => 'flex-end',
            default => 'flex-start',
        };

        $options = [
            'this' => $this,
            'images' => $images,
            'sliderContent' => $sliderContent,
            'imgLeft' => $imgLeft,
            'maxImageWidth' => $maxImageWidth,
            'textPosition' => $textPosition,
            'dotsNav' => $dotsNav,
        ];

        $Engine->assign($options);

        return $Engine->fetch(dirname(__FILE__) . '/BasicSlider.html');
    }
}

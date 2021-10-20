<?php

/**
 * This file contains QUI\Bricks\Controls\Slider\Promoslider
 */

namespace QUI\Bricks\Controls\Slider;

use QUI;
use QUI\Projects\Media\Utils;

/**
 * Class BricSlkider
 *
 * @package QUI\Bricks\Controls
 */
class BasicSlider extends AbstractPromoslider
{
    public function __construct($attributes = [])
    {
        // default options
        $this->setAttributes([
            'title'         => '',
            'text'          => '',
            'mediaFolder'   => false,
            'delay'         => 5000,
            'imgLeft'       => false,
            'sliderContent' => '',
            'class'         => 'quiqqer-bricks-basic-slider',
            'nodeName'      => 'section',
            'data-qui'      => 'package/quiqqer/bricks/bin/Controls/Slider/BasicSlider',
        ]);

        parent::__construct($attributes);

        $this->addCSSFile(
            \dirname(__FILE__) . '/BasicSlider.css'
        );

        $this->addCSSClass('grid-100');
        $this->addCSSClass('mobile-grid-100');
    }


    public function getBody()
    {
        $Engine = QUI::getTemplateManager()->getEngine();

        $mediaFolder   = $this->getAttribute('mediaFolder');
        $Folder        = false;
        $images        = [];
        $sliderContent = $this->getAttribute('sliderContent');
        $imgLeft       = false;

        if (!$mediaFolder) {
            return '';
        }

        if (!$sliderContent) {
            return '';
        }

        /* @var $Folder \QUI\Projects\Media\Folder */
        if (\strpos($mediaFolder, 'image.php') !== false) {
            try {
                $Folder = QUI\Projects\Media\Utils::getMediaItemByUrl(
                    $mediaFolder
                );
            } catch (QUI\Exception $Exception) {
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

        $options = [
            'this'          => $this,
            'images'        => $images,
            'sliderContent' => $sliderContent,
            'imgLeft'       => $imgLeft
        ];

        $Engine->assign($options);

        return $Engine->fetch(\dirname(__FILE__) . '/BasicSlider.html');
    }
}

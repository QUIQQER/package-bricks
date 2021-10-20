<?php

/**
 * This file contains QUI\Bricks\Controls\Slider\Promoslider
 */

namespace QUI\Bricks\Controls\Slider;

use QUI;
use QUI\Projects\Media\Utils;

/**
 * Class BrickSlider
 *
 * @author  Dominik Chrzanowski
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
            'maxImageWidth' => false,
            'sliderContent' => '',
            'class'         => 'quiqqer-bricks-basic-slider',
            'nodeName'      => 'section',
            'data-qui'      => 'package/quiqqer/bricks/bin/Controls/Slider/BasicSlider',
        ]);

        parent::__construct($attributes);

        $this->addCSSFile(
            \dirname(__FILE__) . '/BasicSlider.css'
        );
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

        $maxImageWidth = false;
        if (intval($this->getAttribute('maxImageWidth')) > 0) {
            $maxImageWidth = intval($this->getAttribute('maxImageWidth'));
        }

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

        $options = [
            'this'          => $this,
            'images'        => $images,
            'sliderContent' => $sliderContent,
            'imgLeft'       => $imgLeft,
            'maxImageWidth' => $maxImageWidth,
            'textPosition'  => $textPosition
        ];

        $Engine->assign($options);

        return $Engine->fetch(\dirname(__FILE__) . '/BasicSlider.html');
    }
}

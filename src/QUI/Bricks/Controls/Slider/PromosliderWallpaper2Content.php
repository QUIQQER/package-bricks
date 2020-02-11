<?php

/**
 * This file contains QUI\Bricks\Controls\Slider\PromosliderWallpaper2Content
 */

namespace QUI\Bricks\Controls\Slider;

use QUI;
use QUI\Projects\Media\Utils;

/**
 * Class PromosliderWallpaper2Content
 *
 * @package QUI\Bricks\Controls
 */
class PromosliderWallpaper2Content extends PromosliderWallpaper
{
    /**
     * constructor
     *
     * @param array $attributes
     */
    public function __construct($attributes = [])
    {
        parent::__construct();

        $defaultAttributes = [
            'title'                 => '',
            'text'                  => '',
            'class'                 => 'quiqqer-bricks-promoslider-wallpaper2Content',
            'nodeName'              => 'section',
            'data-qui'              => 'package/quiqqer/bricks/bin/Controls/Slider/PromosliderWallpaper',
            'role'                  => 'listbox',
            'shownavigation'        => true,
            'showarrows'            => 'showHoverScale',
            'autostart'             => false,
            'delay'                 => 5000,
            'template'              => \dirname(__FILE__).'/PromosliderWallpaper2Content.html',
            'isMobileSlidesEnabled' => false
        ];

        // merge default attributes with custom attributes (custom overwrites default values)
        $this->setAttributes(\array_merge($defaultAttributes, $attributes));

        $this->addCSSFile(\dirname(__FILE__).'/PromosliderWallpaper2Content.css');

        $this->addCSSClass('grid-100');
        $this->addCSSClass('mobile-grid-100');
        $this->addCSSClass('quiqqer-bricks-promoslider-wallpaper');
    }

    /**
     * Add a slide for the desktop view
     *
     * @param string $image - image.php URL to an image
     * @param string $left - optional, left text
     * @param string $right - optional, right text
     * @param string|bool $type - optional, not exists, but we are from PromosliderWallpaper and AbstractPromoslider
     * @param string $url - index.php? or extern url
     * @param boolean $newTab - should the url be opened in a new tab?
     */
    public function addSlide($image, $left = '', $right = '', $type = false, $url = '', $newTab = false)
    {
        $this->desktopSlides[] = $this->checkSlideParams($image, $left, $right, $url, $newTab);
    }

    /**
     * Add a slide for the mobile view
     *
     * @param string $image - image.php URL to an image
     * @param string $left - optional, left text
     * @param string $right - optional, right text
     * @param string $url - index.php? or extern url
     * @param boolean $newTab - should the url be opened in a new tab?
     */
    public function addMobileSlide($image, $left = '', $right = '', $url = '', $newTab = false)
    {
        $this->mobileSlides[] = $this->checkSlideParams($image, $left, $right, $url, $newTab);
    }

    /**
     * Add a slide for the mobile view
     *
     * @param string $image - image.php URL to an image
     * @param string $left - Left text
     * @param string $right - Right text
     * @param string $url - index.php? or extern url
     * @param boolean $newTab - should the url be opened in a new tab?
     * @return array
     */
    protected function checkSlideParams($image, $left = '', $right = '', $url = '', $newTab = false)
    {
        if (Utils::isMediaUrl($image)) {
            try {
                $Image = Utils::getMediaItemByUrl($image);

                if (Utils::isImage($Image)) {
                    $image = $Image;
                } else {
                    $image = false;
                }
            } catch (QUI\Exception $Exception) {
                QUI\System\Log::addDebug($Exception->getMessage());
                $image = false;
            }
        } else {
            $image = false;
        }

        return [
            'image'  => $image,
            'left'   => $left,
            'right'  => $right,
            'url'    => $url,
            'newTab' => $newTab
        ];
    }

    /**
     * Parse slide params and add the slide
     *
     * @param mixed $slides
     * @param string $type
     */
    protected function parseSlides($slides, $type = 'desktop')
    {
        if (empty($slides)) {
            return;
        }

        // desktop slides
        if (\is_string($slides)) {
            $slides = \json_decode($slides, true);
        }

        if (!\is_array($slides)) {
            return;
        }

        $attributes = ['image', 'left', 'right', 'url', 'newTab'];

        foreach ($slides as $slide) {
            if (isset($slide['isDisabled']) && $slide['isDisabled']) {
                continue;
            }

            foreach ($attributes as $attribute) {
                if (!isset($slide[$attribute])) {
                    $slide[$attribute] = false;
                }
            }

            switch ($type) {
                case 'desktop':
                    $this->addSlide(
                        $slide['image'],
                        $slide['left'],
                        $slide['right'],
                        'desktop',
                        $slide['url'],
                        $slide['newTab']
                    );
                    break;

                case 'mobile':
                    $this->addMobileSlide(
                        $slide['image'],
                        $slide['left'],
                        $slide['right'],
                        $slide['url'],
                        $slide['newTab']
                    );
                    break;
            }
        }
    }
}

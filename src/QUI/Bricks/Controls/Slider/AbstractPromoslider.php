<?php

/**
 * This file contains QUI\Bricks\Controls\Slider\AbstractPromoslider
 */

namespace QUI\Bricks\Controls\Slider;

use QUI;
use QUI\Projects\Media\Utils;

/**
 * Class AbstractPromoslider
 * Abstact parent class for all sliders
 * Slide handling for the all sliders
 *
 * @package QUI\Bricks\Controls
 */
class AbstractPromoslider extends QUI\Control
{
    /**
     * @var array
     */
    protected $mobileSlides = array();

    /**
     * @var array
     */
    protected $desktopSlides = array();

    /**
     * Add a slide for the desktop view
     *
     * @param string $image - image.php URL to an image
     * @param string $title - Title Text or image.php URL to an image
     * @param string $text - Description text
     * @param string $type - left, right (default = right)
     * @param string $url - index.php? or extern url
     */
    public function addSlide($image, $title, $text, $type = 'right', $url = '')
    {
        if (Utils::isMediaUrl($image)) {
            try {
                $Image = Utils::getMediaItemByUrl($image);

                if (Utils::isImage($Image)) {
                    $image = $Image;
                }
            } catch (QUI\Exception $Exception) {
                QUI\System\Log::addDebug($Exception->getMessage());
                $image = false;
            }
        } else {
            $image = false;
        }

        if (Utils::isMediaUrl($title)) {
            try {
                $Title = Utils::getMediaItemByUrl($title);

                if (Utils::isImage($Title)) {
                    $title = $Title;
                }
            } catch (QUI\Exception $Exception) {
                $title = '';
            }
        } else {
            $title = QUI\Utils\Security\Orthos::cleanHTML($title);
        }

        $pos = 'quiqqer-bricks-promoslider-slide-right';

        if ($type == 'left') {
            $pos = 'quiqqer-bricks-promoslider-slide-left';
        }

        $this->desktopSlides[] = array(
            'image' => $image,
            'title' => $title,
            'text'  => $text,
            'pos'   => $pos,
            'url'   => $url
        );
    }

    /**
     * Add a slide for the mobile view
     *
     * @param string $image
     * @param string $title
     * @param string $text
     * @param string $url - index.php? or extern url
     */
    public function addMobileSlide($image, $title, $text, $url = '')
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

        if (Utils::isMediaUrl($title)) {
            try {
                $Title = Utils::getMediaItemByUrl($title);

                if (Utils::isImage($Title)) {
                    $title = $Title;
                }
            } catch (QUI\Exception $Exception) {
                $title = false;
            }
        }

        $this->mobileSlides[] = array(
            'image' => $image,
            'title' => $title,
            'text'  => $text,
            'url'   => $url
        );
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
        if (is_string($slides)) {
            $slides = json_decode($slides, true);
        }

        if (!is_array($slides)) {
            return;
        }

        $attributes = array('image', 'title', 'text', 'type', 'url');

        foreach ($slides as $slide) {
            foreach ($attributes as $attribute) {
                if (!isset($slide[$attribute])) {
                    $slide[$attribute] = false;
                }
            }

            switch ($type) {
                case 'desktop':
                    $this->addSlide(
                        $slide['image'],
                        $slide['title'],
                        $slide['text'],
                        $slide['type'],
                        $slide['url']
                    );
                    break;

                case 'mobile':
                    $this->addMobileSlide(
                        $slide['image'],
                        $slide['title'],
                        $slide['text'],
                        $slide['url']
                    );
                    break;
            }
        }
    }
}

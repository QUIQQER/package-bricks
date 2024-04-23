<?php

/**
 * This file contains QUI\Bricks\Controls\Slider\AbstractPromoslider
 */

namespace QUI\Bricks\Controls\Slider;

use QUI;
use QUI\Projects\Media\Utils;

use function is_array;
use function is_string;
use function json_decode;

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
    protected array $mobileSlides = [];

    /**
     * @var array
     */
    protected array $desktopSlides = [];

    /**
     * Add a slide for the desktop view
     *
     * @param string $image - image.php URL to an image
     * @param string $title - Title Text or image.php URL to an image
     * @param string $text - Description text
     * @param string $type - left, right (default = right)
     * @param string $url - index.php? or extern url
     * @param boolean $newTab - should the url be opened in a new tab?
     */
    public function addSlide(
        string $image,
        string $title,
        string $text,
        string $type = 'right',
        string $url = '',
        bool $newTab = false
    ): void {
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
            } catch (QUI\Exception) {
                $title = '';
            }
        } else {
            $title = QUI\Utils\Security\Orthos::cleanHTML($title);
        }

        $pos = 'quiqqer-bricks-promoslider-slide-right';

        if ($type == 'left') {
            $pos = 'quiqqer-bricks-promoslider-slide-left';
        }

        $this->desktopSlides[] = [
            'image' => $image,
            'title' => $title,
            'text' => $text,
            'pos' => $pos,
            'url' => $url,
            'newTab' => $newTab
        ];
    }

    /**
     * Add a slide for the mobile view
     *
     * @param string $image
     * @param string $title
     * @param string $text
     * @param string $url - index.php? or extern url
     * @param boolean $newTab - should the url be opened in a new tab?
     */
    public function addMobileSlide(
        string $image,
        string $title,
        string $text,
        string $url = '',
        bool $newTab = false
    ): void {
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
            } catch (QUI\Exception) {
                $title = false;
            }
        }

        $this->mobileSlides[] = [
            'image' => $image,
            'title' => $title,
            'text' => $text,
            'url' => $url,
            'newTab' => $newTab
        ];
    }

    /**
     * Parse slide params and add the slide
     *
     * @param mixed $slides
     * @param string $type
     */
    protected function parseSlides(mixed $slides, string $type = 'desktop'): void
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

        $attributes = ['image', 'title', 'text', 'type', 'url', 'newTab', 'isDisabled'];

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
                        $slide['title'],
                        $slide['text'],
                        $slide['type'],
                        $slide['url'],
                        $slide['newTab']
                    );
                    break;

                case 'mobile':
                    $this->addMobileSlide(
                        $slide['image'],
                        $slide['title'],
                        $slide['text'],
                        $slide['url'],
                        $slide['newTab']
                    );
                    break;
            }
        }
    }
}

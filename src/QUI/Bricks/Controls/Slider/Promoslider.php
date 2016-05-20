<?php

/**
 * This file contains QUI\Bricks\Controls\Slider\Promoslider
 */

namespace QUI\Bricks\Controls\Slider;

use QUI;
use QUI\Projects\Media\Utils;

/**
 * Class Promoslider
 *
 * @package QUI\Bricks\Controls
 */
class Promoslider extends QUI\Control
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
     * constructor
     *
     * @param array $attributes
     */
    public function __construct($attributes = array())
    {
        // default options
        $this->setAttributes(array(
            'title' => '',
            'text' => '',
            'class' => 'quiqqer-bricks-promoslider',
            'nodeName' => 'section',
            'data-qui' => 'package/quiqqer/bricks/bin/Controls/Slider/Promoslider',
            'role' => 'listbox',
            'shownavigation' => false,
            'image-as-wallpaper' => false,
            'autostart' => false,
            'delay' => 5000
        ));

        $this->addCSSFile(
            dirname(__FILE__) . '/Promoslider.css'
        );

        $this->addCSSClass('grid-100');
        $this->addCSSClass('mobile-grid-100');


        parent::__construct($attributes);
    }

    /**
     * (non-PHPdoc)
     *
     * @see \QUI\Control::create()
     */
    public function getBody()
    {
        $Engine = QUI::getTemplateManager()->getEngine();

        // defaults
        $this->setAttribute('data-qui-options-autostart', false);
        $this->setAttribute('data-qui-options-pagefit', false);
        $this->setAttribute('data-qui-options-pagefitcut', false);
        $this->setAttribute('data-qui-options-pagefitcutmobile', false);
        $this->setAttribute('data-qui-options-autostart', false);
        $this->setAttribute('data-qui-options-shownavigation', false);
        $this->setAttribute('data-qui-options-image-as-wallpaper', false);
        $this->setAttribute('data-qui-options-delay', 5000);

        if ($this->getAttribute('pagefit')) {
            $this->setAttribute('data-qui-options-pagefit', $this->getAttribute('pagefit'));
            $this->setAttribute('height', '100vh');
        }

        if ($this->getAttribute('delay')) {
            $this->setAttribute('data-qui-options-delay', $this->getAttribute('delay'));
        }

        if ($this->getAttribute('pagefitcut')) {
            $this->setAttribute('data-qui-options-pagefitcut', $this->getAttribute('pagefitcut'));

            $this->setAttribute(
                'height',
                'calc(100vh - ' . (int)$this->getAttribute('pagefitcut') . 'px)'
            );
        }

        if ($this->getAttribute('pagefitcutmobile')) {
            $this->setAttribute(
                'data-qui-options-pagefitcutmobile',
                $this->getAttribute('pagefitcutmobile')
            );
        }

        if ($this->getAttribute('autostart')) {
            $this->setAttribute(
                'data-qui-options-autostart',
                $this->getAttribute('autostart')
            );
        }

        if ($this->getAttribute('shownavigation')) {
            $this->setAttribute(
                'data-qui-options-shownavigation',
                $this->getAttribute('shownavigation')
            );
        }


        if ($this->getAttribute('image-as-wallpaper')) {
            $this->setAttribute(
                'data-qui-options-image-as-wallpaper',
                $this->getAttribute('image-as-wallpaper')
            );
        }

        if ($this->getAttribute('image-wallpaper-position')) {
            switch ($this->getAttribute('image-wallpaper-position')) {
                case "top-left":
                case "top":
                case "top-right":
                case "left":
                case "center":
                case "right":
                case "bottom-left":
                case "bottom":
                case "bottom-right":
                    $this->addCSSClass(
                        'quiqqer-bricks-promoslider-wallpaper__' . $this->getAttribute('image-wallpaper-position')
                    );
                    break;

                default:
                    $this->addCSSClass('quiqqer-bricks-promoslider-wallpaper__center');
            }
        }

        if ($this->getAttribute('navigation-position')) {
            $this->setAttribute(
                'data-qui-options-navigation-position',
                $this->getAttribute('navigation-position')
            );
        }

        if ($this->getAttribute('navigation-position') == 'inner') {
            $this->addCSSClass('quiqqer-bricks-promoslider__nav_inner');
        }


        $this->parseSlides($this->getAttribute('desktopslides'), 'desktop');
        $this->parseSlides($this->getAttribute('mobileslides'), 'mobile');

        $Engine->assign(array(
            'this' => $this,
            'desktopSlides' => $this->desktopSlides,
            'mobileSlides' => $this->mobileSlides,
            'Utils' => new Utils()
        ));

        return $Engine->fetch(dirname(__FILE__) . '/Promoslider.html');
    }

    /**
     * Add a slide for the desktop view
     *
     * @param string $image - image.php URL to an image
     * @param string $title - Title Text or image.php URL to an image
     * @param string $text - Description text
     * @param string $type - left, right (default = right)
     */
    public function addSlide($image, $title, $text, $type = 'right')
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
            'text' => $text,
            'pos' => $pos
        );
    }

    /**
     * Add a slide for the mobile view
     *
     * @param string $image
     * @param string $title
     * @param string $text
     */
    public function addMobileSlide($image, $title, $text)
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
            'text' => $text
        );
    }

    /**
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

        $attributes = array('image', 'title', 'text', 'type');

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
                        $slide['type']
                    );
                    break;

                case 'mobile':
                    $this->addMobileSlide(
                        $slide['image'],
                        $slide['title'],
                        $slide['text']
                    );
                    break;
            }
        }
    }
}

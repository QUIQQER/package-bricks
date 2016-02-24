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
            'data-qui' => 'package/quiqqer/bricks/bin/Controls/Slider/Promoslider'
        ));

        $this->addCSSFile(
            dirname(__FILE__) . '/Promoslider.css'
        );

        $this->addCSSClass('grid-100');
        $this->addCSSClass('mobile-grid-100');


        parent::__construct($attributes);


        $this->addSlide(
            'image.php?project=pbischop&id=19',

            'image.php?project=pbischop&id=18',

            "<p>
                You lived before you met me?! Maybe I love you so much I love you no matter who you are pretending to
                be.
            </p>
            <p>
             It may comfort you to know that Fry's death took only fifteen seconds, yet the pain
                was so intense, that it felt to him like fifteen years.
            </p>
            <p>
                And it goes without saying, it caused him to empty his bowels.
            </p>",

            'right'
        );

        $this->addSlide(
            'image.php?project=pbischop&id=21',
            'image.php?project=pbischop&id=20',

            "<p>
                You lived before you met me?! Maybe I love you so much I love you no matter who you are pretending to
                be.
            </p>"
        );

        $this->addSlide(
            'image.php?project=pbischop&id=23',
            'image.php?project=pbischop&id=22',

            "<p>
                You lived before you met me?! Maybe I love you so much I love you no matter who you are pretending to
                be.
            </p>"
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
}

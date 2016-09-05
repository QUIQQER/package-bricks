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
class PromosliderWallpaper extends AbstractPromoslider
{
    /**
     * constructor
     *
     * @param array $attributes
     */
    public function __construct($attributes = array())
    {
        // default options
        $this->setAttributes(array(
            'title'          => '',
            'text'           => '',
            'class'          => 'quiqqer-bricks-promoslider-wallpaper',
            'nodeName'       => 'section',
            'data-qui'       => 'package/quiqqer/bricks/bin/Controls/Slider/PromosliderWallpaper',
            'role'           => 'listbox',
            'shownavigation' => false,
            'autostart'      => false,
            'delay'          => 5000,
            'template'       => dirname(__FILE__) . '/PromosliderWallpaper.html'
        ));

        $this->addCSSFile(
            dirname(__FILE__) . '/PromosliderWallpaper.css'
        );

        $this->addCSSClass('grid-100');
        $this->addCSSClass('mobile-grid-100');

        parent::__construct($attributes);
    }

    /**
     * @return string
     */
    public function create()
    {
        $result = '';

        if ($this->getAttribute('pagefit') === false) {
            $this->setAttribute('pagefitcut', false);
            $this->setAttribute('pagefitcutmobile', false);
        }

        if ($this->getAttribute('pagefitcut')
            && (int)$this->getAttribute('pagefitcut')
        ) {
            $pagefit = (int)$this->getAttribute('pagefitcut');

            $result .= '
                <style>
                    .quiqqer-bricks-promoslider-wallpaper {
                        height: calc(100vh - ' . $pagefit . 'px);
                    }
                </style>';
        }

        if ($this->getAttribute('pagefitcutmobile')
            && (int)$this->getAttribute('pagefitcutmobile')
        ) {
            $pagefit = (int)$this->getAttribute('pagefitcutmobile');

            $result .= '
                <style>
                    @media screen and (max-width: 768px) {
                        .quiqqer-bricks-promoslider-wallpaper {
                            height: calc(100vh - ' . $pagefit . 'px);
                        }
                    }
                </style>';
        }

        $result .= parent::create();

        return $result;
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
        $this->setAttribute('data-qui-options-attachment', false);
        $this->setAttribute('data-qui-options-delay', 5000);

        if ($this->getAttribute('pagefit') === false) {
            $this->setAttribute('pagefitcut', false);
            $this->setAttribute('pagefitcutmobile', false);
        }

        if ($this->getAttribute('pagefit')) {
            $this->setAttribute('data-qui-options-pagefit', $this->getAttribute('pagefit'));
        }

        if ($this->getAttribute('delay')) {
            $this->setAttribute('data-qui-options-delay', $this->getAttribute('delay'));
        }

        if ($this->getAttribute('pagefitcut') && (int)$this->getAttribute('pagefitcut')) {
            $this->setAttribute('data-qui-options-pagefitcut', $this->getAttribute('pagefitcut'));
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

        if ($this->getAttribute('attachment') == 'fixed') {
            $this->addCSSClass(
                'quiqqer-bricks-promoslider-slide-image__fixed'
            );
        }

        if ($this->getAttribute('position')) {
            switch ($this->getAttribute('position')) {
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
                        'quiqqer-bricks-promoslider-wallpaper__' . $this->getAttribute('position')
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
            'this'          => $this,
            'desktopSlides' => $this->desktopSlides,
            'mobileSlides'  => $this->mobileSlides,
            'Utils'         => new Utils()
        ));

        return $Engine->fetch($this->getAttribute('template'));
    }
}

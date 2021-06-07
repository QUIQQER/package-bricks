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
class Promoslider extends AbstractPromoslider
{
    /**
     * constructor
     *
     * @param array $attributes
     */
    public function __construct($attributes = [])
    {
        parent::__construct($attributes);

        // default options
        $this->setAttributes([
            'title'                      => '',
            'text'                       => '',
            'class'                      => 'quiqqer-bricks-promoslider',
            'nodeName'                   => 'section',
            'data-qui'                   => 'package/quiqqer/bricks/bin/Controls/Slider/Promoslider',
            'role'                       => 'listbox',
            'shownavigation'             => false,
            'showarrows'                 => false,
            'image-as-wallpaper'         => false,
            'image-wallpaper-attachment' => false,
            'autostart'                  => false,
            'delay'                      => 5000,
            'isMobileSlidesEnabled'      => false,
            'imageSize'                  => false // false = use original size, do not create srcset
        ]);

        $this->addCSSFile(
            \dirname(__FILE__).'/Promoslider.css'
        );

        $this->addCSSClass('grid-100');
        $this->addCSSClass('mobile-grid-100');
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
        $this->setAttribute('data-qui-options-wallpaper-attachment', false);
        $this->setAttribute('data-qui-options-delay', 5000);
        $this->setAttribute('data-qui-options-isMobileSlidesEnabled', false);

        if ($this->getAttribute('pagefit') === false) {
            $this->setAttribute('pagefitcut', false);
            $this->setAttribute('pagefitcutmobile', false);
        }

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
                'calc(100vh - '.(int)$this->getAttribute('pagefitcut').'px)'
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

        if (!$this->getAttribute('showarrows')) {
            $this->setAttribute('showarrows', 'hide');
        }

        if ($this->getAttribute('image-as-wallpaper')) {
            $this->setAttribute(
                'data-qui-options-image-as-wallpaper',
                $this->getAttribute('image-as-wallpaper')
            );
        }

        if ($this->getAttribute('image-wallpaper-attachment') == 'fixed') {
            $this->addCSSClass(
                'quiqqer-bricks-promoslider-slide-image__fixed'
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
                        'quiqqer-bricks-promoslider-wallpaper__'.$this->getAttribute('image-wallpaper-position')
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

        if ($this->getAttribute('isMobileSlidesEnabled') === "true") {
            $this->setAttribute(
                'data-qui-options-isMobileSlidesEnabled',
                $this->getAttribute('isMobileSlidesEnabled')
            );
        }

        $this->parseSlides($this->getAttribute('desktopslides'), 'desktop');

        $options = [
            'this'          => $this,
            'desktopSlides' => $this->desktopSlides,
            'Utils'         => new Utils(),
            'imageSize'     => $this->getAttribute('imageSize')
        ];

        if ($this->getAttribute('isMobileSlidesEnabled') === "true") {
            $this->parseSlides($this->getAttribute('mobileslides'), 'mobile');

            $options['mobileSlides'] = $this->mobileSlides;
        } else {
            $this->parseSlides($this->getAttribute('desktopslides'), 'mobile');

            $options['mobileSlides'] = $this->desktopSlides;
        }

        $Engine->assign($options);

        return $Engine->fetch(\dirname(__FILE__).'/Promoslider.html');
    }
}

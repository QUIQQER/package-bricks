<?php

/**
 * This file contains QUI\Bricks\Controls\Slider\CustomerReviewsSlider
 * @author Dominik Chrzanowski
 */

namespace QUI\Bricks\Controls\Slider;

use QUI;

/**
 * Class CustomerReviews
 *
 * @package quiqqer/bricks/Controls
 */
class CustomerReviewsSlider extends AbstractPromoslider
{
    public function __construct($attributes = [])
    {
        // default options
        $this->setAttributes([
            'data-qui' => 'package/quiqqer/bricks/bin/Controls/Slider/CustomerReviewsSlider',
            'template' => 'default',
            'delay'    => 5000
        ]);

        parent::__construct($attributes);
    }


    public function getBody()
    {
        $Engine = QUI::getTemplateManager()->getEngine();

        $entries  = json_decode($this->getAttribute('entries'), true);
        $template = $this->getAttribute('template');
        $path     = \dirname(__FILE__) . '/CustomerReviewsSlider.' . $template . '.html';

        $this->setJavaScriptControlOption('delay', $this->getAttribute('delay'));
        $this->setJavaScriptControlOption('autoplay', $this->getAttribute('autoplay'));
        $this->setJavaScriptControlOption('height', $this->getAttribute('sliderHeight'));


        $options = [
            'this'    => $this,
            'entries' => $entries,
            'arrows'  => $this->getAttribute('showArrows')
        ];

        $this->addCSSFile(
            \dirname(__FILE__) . '/CustomerReviewsSlider.' . $template . '.css'
        );

        $Engine->assign($options);

        return $Engine->fetch($path);
    }
}

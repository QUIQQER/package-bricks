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
        ]);

        parent::__construct($attributes);
    }


    public function getBody()
    {
        $Engine = QUI::getTemplateManager()->getEngine();

        $entries = json_decode($this->getAttribute('entries'), true);
        $template = $this->getAttribute('template');
        $path = \dirname(__FILE__) . '/CustomerReviewsSlider.' . $template . '.html';

        $options = [
            'this'    => $this,
            'entries' => $entries
        ];

        $this->addCSSFile(
            \dirname(__FILE__) . '/CustomerReviewsSlider.' . $template . '.css'
        );

        $Engine->assign($options);

        return $Engine->fetch($path);
    }
}
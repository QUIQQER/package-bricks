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
 * @package quiqqer/bricks
 */
class CustomerReviewsSlider extends QUI\Control
{
    /**
     * constructor
     *
     * @param array $attributes
     */
    public function __construct($attributes = [])
    {
        // default options
        $this->setAttributes([
            'template'   => 'default'
        ]);

        parent::__construct($attributes);
    }

    /**
     * (non-PHPdoc)
     *
     * @see \QUI\Control::create()
     */
    public function getBody()
    {
    }
}

<?php

/**
 * This file contains QUI\Bricks\Controls\CustomerReviews
 */

namespace QUI\Bricks\Controls;

use QUI;

/**
 * Class CustomerReviews
 *
 * @package quiqqer/bricks
 */
class CustomerReviews extends QUI\Control
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
//            'title'       => 'Content Switcher',
            'entries' => []
        ]);

        parent::__construct($attributes);

        $this->addCSSFile(
            dirname(__FILE__) . '/CustomerReviews.css'
        );
    }

    /**
     * (non-PHPdoc)
     *
     * @see \QUI\Control::create()
     */
    public function getBody()
    {
        $Engine  = QUI::getTemplateManager()->getEngine();
        $entries = $this->getAttribute('entries');

        if (is_string($entries)) {
            $entries = json_decode($entries, true);
        }

        $Engine->assign([
            'this'    => $this,
            'entries' => $entries
        ]);


        return $Engine->fetch(dirname(__FILE__) . '/CustomerReviews.html');
    }
}

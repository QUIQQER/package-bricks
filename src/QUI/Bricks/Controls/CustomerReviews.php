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
            'template' => 'wideBoxes',
            'entries'  => []
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
        $Engine  = QUI::getTemplateManager()->getEngine();
        $entries = $this->getAttribute('entries');

        if (is_string($entries)) {
            $entries = json_decode($entries, true);
        }

        switch ($this->getAttribute('template')) {
            case 'smallBoxes':
                $template = dirname(__FILE__) . '/CustomerReviews.SmallBoxes.html';
                $this->addCSSFile(dirname(__FILE__) . '/CustomerReviews.SmallBoxes.css');
                break;

            case 'wideBoxes':
            default:
                $template = dirname(__FILE__) . '/CustomerReviews.WideBoxes.html';
                $this->addCSSFile(dirname(__FILE__) . '/CustomerReviews.WideBoxes.css');
                break;
        }

        $Engine->assign([
            'this'    => $this,
            'entries' => $entries
        ]);

        return $Engine->fetch($template);
    }
}

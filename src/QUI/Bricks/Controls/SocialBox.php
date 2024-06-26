<?php

/**
 * This file contains QUI\Bricks\Controls\SocialBox
 */

namespace QUI\Bricks\Controls;

use QUI;

/**
 * Class SocialBox
 *
 * @package quiqqer/bricks
 */
class SocialBox extends QUI\Control
{
    /**
     * constructor
     *
     * @param array $attributes
     */
    public function __construct(array $attributes = [])
    {
        // default options
        $this->setAttributes([
            'title' => 'Social',
            'socialList' => false
        ]);

        parent::__construct($attributes);

        $this->addCSSFile(
            dirname(__FILE__) . '/SocialBox.css'
        );
    }

    /**
     * (non-PHPdoc)
     *
     * @see \QUI\Control::create()
     */
    public function getBody(): string
    {
        $Engine = QUI::getTemplateManager()->getEngine();
        $socialList = $this->getAttribute('socialList');

        if ($socialList) {
            $socialList = json_decode($socialList, true);
        }

        $Engine->assign([
            'this' => $this,
            'socialList' => $socialList
        ]);

        return $Engine->fetch(dirname(__FILE__) . '/SocialBox.html');
    }
}

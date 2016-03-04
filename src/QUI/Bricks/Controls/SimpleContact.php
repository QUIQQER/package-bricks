<?php

/**
 * This file contains \QUI\Bricks\Controls\SimpleContact
 */

namespace QUI\Bricks\Controls;

use QUI;

/**
 * Mini contact control
 * {control control="\QUI\Bricks\Controls\SimpleContact" labels=false}
 *
 * @author  www.pcsg.de (Henning Leutz)
 * @licence For copyright and license information, please view the /README.md
 */
class SimpleContact extends QUI\Control
{
    /**
     * constructor
     *
     * @param array $attributes
     */
    public function __construct($attributes = array())
    {
        parent::__construct($attributes);

        $this->addCSSFile(
            dirname(__FILE__) . '/SimpleContact.css'
        );

        $this->setAttribute('class', 'quiqqer-simple-contact');
        $this->setAttribute('qui-class', "package/quiqqer/bricks/bin/Controls/SimpleContact");
        $this->setAttribute('labels', true);
        $this->setAttribute('data-brickid', true);
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
            'this' => $this
        ));

        return $Engine->fetch(dirname(__FILE__) . '/SimpleContact.html');
    }
}

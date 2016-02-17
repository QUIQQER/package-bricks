<?php

/**
 * This file contains \QUI\Bricks\Controls\SimpleContact
 */

namespace QUI\Bricks\Controls;

use QUI;
use QUI\Utils\Security\Orthos;

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
        $this->setAttributes(array(
            'data-ajax' => 1,
            'POST_NAME' => '',
            'POST_EMAIL' => '',
            'POST_MESSAGE' => ''
        ));

        parent::__construct($attributes);

        $this->addCSSFile(
            dirname(__FILE__) . '/SimpleContact.css'
        );

        $this->setAttribute('class', 'quiqqer-simple-contact');
        $this->setAttribute('qui-class', "Bricks/Controls/SimpleContact");
        $this->setAttribute('labels', true);
    }

    /**
     * (non-PHPdoc)
     *
     * @see \QUI\Control::create()
     */
    public function getBody()
    {
        $Engine = QUI::getTemplateManager()->getEngine();

        // filter POST vars if exist
        $this->setAttributes(array(
            'POST_NAME' => Orthos::clearFormRequest($this->getAttribute('POST_NAME')),
            'POST_EMAIL' => Orthos::clearFormRequest($this->getAttribute('POST_EMAIL')),
            'POST_MESSAGE' => Orthos::clearFormRequest($this->getAttribute('POST_MESSAGE')),
        ));

        $Engine->assign(array(
            'this' => $this
        ));

        return $Engine->fetch(dirname(__FILE__) . '/SimpleContact.html');
    }
}

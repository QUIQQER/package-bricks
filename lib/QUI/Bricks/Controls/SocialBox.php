<?php

/**
 * This file contains QUI\Bricks\Controls\SocialBox
 */

namespace QUI\Bricks\Controls;

use QUI;

/**
 * Class SocialBox
 *
 * @package quiqqer/template-qui
 */
class SocialBox extends QUI\Control
{
    /**
     * constructor
     * @param Array $attributes
     */
    public function __construct($attributes = array())
    {
        // default options
        $this->setAttributes(array(
            'title'      => 'Social',
            'socialList' => false
        ));

        parent::setAttributes( $attributes );

        $this->addCSSFile(
            dirname( __FILE__ ) . '/SocialBox.css'
        );
    }

    /**
     * (non-PHPdoc)
     * @see \QUI\Control::create()
     */
    public function getBody()
    {
        $Engine     = QUI::getTemplateManager()->getEngine();
        $socialList = $this->getAttribute( 'socialList' );

        if ( $socialList ) {
            $socialList = json_decode( $socialList, true );
        }


        $Engine->assign(array(
            'this'       => $this,
            'socialList' => $socialList
        ));


        return $Engine->fetch( dirname( __FILE__ ) .'/SocialBox.html' );
    }
}
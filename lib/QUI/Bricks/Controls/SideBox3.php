<?php

/**
 * This file contains QUI\Bricks\Controls\SideBox3
 */

namespace QUI\Bricks\Controls;

use QUI;

/**
 * Class SocialBox
 *
 * @package quiqqer/bricks
 */
class SideBox3 extends QUI\Bricks\Controls\SideBox2
{
    /**
     * constructor
     *
     * @param Array $attributes
     */
    public function __construct($attributes = array())
    {
        // default options
        $this->setAttributes(array(
            'showImage'          => true,
            'showTitle'          => true,
            'showDescription'    => true,
            'showContent'        => false,
            'class'              => 'quiqqer-bricks-sidebox3',
            'nodeName'           => 'section',
            'site'               => false,
            'limit'              => 3,
            'grid-class-row'     => 'row',
            'grid-class-article' => '4u'
        ));

        parent::setAttributes($attributes);
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
            'this'     => $this,
            'children' => $this->_getSites()
        ));

        return $Engine->fetch(dirname(__FILE__).'/SideBox3.html');
    }
}